import axios from "axios";
import moment from "moment";
import { APIFactory, IAPIFactory } from "../../api/factory";
import { HIPType } from "../../api/types/floatingip";
import { HServerStatus } from "../../api/types/server";
import { ICDK } from "../cdk";
import { defaultCloudConfig } from "../utils/cloudconfig";
import {
  extractDockerImageVersion,
  formatDockerImage,
  resourceNameFormatter,
} from "../utils/formatter";
import { logError, logInfo, logSuccess } from "../utils/logger";
import { sleep } from "../utils/sleep";
import { FloatingIP } from "./floatingip";
import { PrimaryIP } from "./primaryip";
import { Resource } from "./resource";
import { SSHKey } from "./sshkey";

export type HealthCheck = {
  intervalInSeconds: number;
  statusCode: number;
};

export type SSLConfiguration = {
  host: string;
  letsEncryptEmail: string;
};

export type ServerOptions = {
  name: string;
  image: string;
  labels?: { [key: string]: string };
  serverType: string;
  userData?: string;
  dockerImage?: string;
  dockerPort?: string;
  ssl?: SSLConfiguration;
  enableIPv4?: boolean;
  enableIPv6?: boolean;
  protected?: boolean;
  healthCheck?: HealthCheck;
};

export class Server implements Resource {
  cdk?: ICDK;
  private _options: ServerOptions;
  private _sshKey?: SSHKey;
  private _floatingIPs: FloatingIP[] = [];
  private _primaryIPs: PrimaryIP[] = [];

  private static WAIT_TIMEOUT_SECONDS = 60;

  constructor(options: ServerOptions) {
    this._options = options;
  }

  getName(): string {
    return resourceNameFormatter(this.cdk?.namespace ?? "", this._options.name);
  }

  addSSHKey(sshKey: SSHKey): void {
    sshKey.cdk = this.cdk;
    this._sshKey = sshKey;
  }

  addFloatingIP(floatingIP: FloatingIP): void {
    floatingIP.cdk = this.cdk;
    this._floatingIPs.push(floatingIP);
  }

  addPrimaryIP(primaryIP: PrimaryIP): void {
    primaryIP.cdk = this.cdk;
    this._primaryIPs.push(primaryIP);
  }

  getAttachedResources(): Resource[] {
    return ([] as Resource[]).concat(
      this._sshKey ? [this._sshKey] : [],
      this._floatingIPs,
      this._primaryIPs
    );
  }

  async apply(apiFactory: IAPIFactory): Promise<number> {
    logInfo("[Server] Apply changes");
    const namespace = this.cdk?.namespace ?? "";

    this._sshKey
      ? logInfo("[Server] Apply change to attached SSH Key")
      : logInfo("[Server] Server does not have an attached SSH Key");
    const sshkey = await this._sshKey?.apply(apiFactory);

    this._primaryIPs.length > 0
      ? logInfo("[Server] Apply change to attached Primary IPs")
      : logInfo("[Server] Server does not have attached Primary IPs");
    const primaryIPs = await Promise.all(
      this._primaryIPs.map(async (obj) => {
        const primaryIPId = await obj.apply(apiFactory);
        return await apiFactory.primaryip.getPrimaryIP(primaryIPId);
      })
    );

    const labels: { [key: string]: string } = {
      ...this._options.labels,
      namespace,
    };

    // If the user did not define a custom userData but set the dockerImage,
    // then we use the default cloud config for our server
    let cloudConfig = this._options.userData;
    if (this._options.userData === undefined) {
      if (this._options.dockerImage === undefined) {
        logInfo("[Server] Do not use any cloud config");
      } else {
        const dockerImage = formatDockerImage(this._options.dockerImage);
        logInfo(`[Server] Use default cloud config with docker image '${dockerImage}'`);
        cloudConfig = defaultCloudConfig(this._options);

        // Save docker image version as server label so we can identify later if we need to restart
        // the server to run a new version of the given docker image
        labels.dockerImageVersion = extractDockerImageVersion(dockerImage);
      }
    } else {
      logInfo("[Server] Use given cloud config");
    }

    const allServers = await apiFactory.server.getAllServers({
      label_selector: `namespace=${namespace}`,
    });
    const server = allServers.find((obj) => obj.name == this.getName());
    if (server) {
      // Server already exists; check for updates
      logInfo("[Server] Update existing Server");
      const res = await apiFactory.server.updateServer(server.id, {
        labels,
        name: this.getName(),
      });
      logSuccess("[Server] Successfully updated the existing Server");
      return res.id;
    } else {
      // Server does not exist; create new server
      logInfo("[Server] Create new Server");
      const res = await apiFactory.server.createServer({
        automount: false,
        datacenter: this.cdk?.datacenter.id.toString(),
        firewalls: undefined,
        image: this._options.image,
        labels,
        name: this.getName(),
        networks: undefined,
        placement_group: undefined,
        public_net: {
          enable_ipv4: this._options.enableIPv4 ?? true,
          enable_ipv6: this._options.enableIPv6 ?? false,
          ipv4: primaryIPs.find((obj) => obj.type == HIPType.IPV4)?.id,
          ipv6: primaryIPs.find((obj) => obj.type == HIPType.IPV6)?.id,
        },
        server_type: this._options.serverType,
        ssh_keys: sshkey ? [sshkey] : [],
        start_after_create: true,
        user_data: cloudConfig,
        volumes: [],
      });
      logSuccess("[Server] Successfully created a new Server");

      if (apiFactory instanceof APIFactory) {
        // Wait until server is running
        logInfo("[Server] Wait until new server is running");
        const createdAt = moment();
        await this._waitForServerToBeReady(apiFactory, res.id, createdAt);
        logSuccess(`[Server] Server ${res.name} is running`);

        // Update Server protection
        if (this._options.protected !== undefined) {
          await apiFactory.server.changeProtection(res.id, {
            delete: this._options.protected,
            rebuild: this._options.protected, // currently needs to be the same as `deleted`
          });
        }

        // Wait for service to be healthy
        if (this._options.healthCheck) {
          const ip = res.public_net.ipv4?.ip;
          if (ip) {
            const url = `http://${ip}`;
            logInfo(`[Server] Run health check for ${url}`);
            try {
              await this._waitForServerToBeHealthy(url, this._options.healthCheck, moment());
              logSuccess("[Server] Service is healthy");
            } catch (error: unknown) {
              logError("[Server] Service is unhealthy");
              logError(`${error}`);
              // TODO in the future we might want to trigger a rollback at this point
            }
          } else {
            logInfo("[Server] Skip health check; missing ip");
          }
        } else {
          logInfo("[Server] Skip health check");
        }
      }

      return res.id;
    }
  }

  // Request server status until server is running or timeout is reached
  private async _waitForServerToBeReady(
    apiFactory: IAPIFactory,
    id: number,
    createdAt: moment.Moment
  ): Promise<void> {
    if (moment() > createdAt.add(Server.WAIT_TIMEOUT_SECONDS, "seconds"))
      throw new Error("Server is not running");
    const res = await apiFactory.server.getServer(id);
    if (res.status == HServerStatus.RUNNING) return;
    await sleep(5); // Sleep for 5 seconds to avoid spamming the API
    await this._waitForServerToBeReady(apiFactory, id, createdAt);
  }

  // Run health check until service is up and running or timeout is reached
  private async _waitForServerToBeHealthy(
    url: string,
    healthCheck: HealthCheck,
    createdAt: moment.Moment
  ): Promise<void> {
    if (moment() > createdAt.add(Server.WAIT_TIMEOUT_SECONDS, "seconds"))
      throw new Error("Server is unhealthy");
    try {
      const res = await axios.get(url);
      if (res.status == healthCheck.statusCode) return;
    } catch {
      // Ignore the error, this is the case as long as the service is not running
    }
    await sleep(healthCheck.intervalInSeconds);
    await this._waitForServerToBeHealthy(url, healthCheck, createdAt);
  }

  // Request server status until server is deleted or timeout is reached
  private async _waitForServerToBeDeleted(
    apiFactory: IAPIFactory,
    id: number,
    createdAt: moment.Moment
  ): Promise<void> {
    if (moment() > createdAt.add(Server.WAIT_TIMEOUT_SECONDS, "seconds"))
      throw new Error("Server is still running");
    try {
      await apiFactory.server.getServer(id);
      await sleep(5); // Sleep for 5 seconds to avoid spamming the API
      await this._waitForServerToBeDeleted(apiFactory, id, createdAt);
    } catch {
      // Server does not exist anymore
    }
  }

  async delete(apiFactory: IAPIFactory): Promise<boolean> {
    const namespace = this.cdk?.namespace ?? "";
    const allServers = await apiFactory.server.getAllServers({
      label_selector: `namespace=${namespace}`,
    });
    const server = allServers.find((obj) => obj.name == this.getName());
    if (!server) {
      logError("[Server] Server does not exist; skip deletion");
      return false;
    }
    if (server.protection.delete) {
      logInfo("[Server] Server is protected; skip deletion");
      return false;
    }
    logInfo("[Server] Delete Server");
    const res = await apiFactory.server.deleteServer(server.id);
    res
      ? logInfo("[Server] Server marked for deletion")
      : logError("[Server] Failed to delete Server");
    if (!res) return false;

    // Sleep for 5 seconds because the original wait sometimes does not work properly
    logInfo("[Server] Wait until server has been deleted");
    await sleep(5);

    // Wait until server has been deleted
    if (apiFactory instanceof APIFactory) {
      const createdAt = moment();
      await this._waitForServerToBeDeleted(apiFactory, server.id, createdAt);
      logInfo(`[Server] Successfully deleted the server`);
    }
    return true;
  }

  static async deleteUnusedResources(
    localResourceNames: string[],
    namespace: string,
    apiFactory: IAPIFactory
  ): Promise<boolean> {
    logInfo("[Server] Try to delete all unused resources");
    const remoteResources = await apiFactory.server.getAllServers({
      label_selector: `namespace=${namespace}`,
    });
    const resourcesToBeRemoved = remoteResources.filter(
      (server) =>
        localResourceNames.findIndex((name) => name == server.name && !server.protection.delete) ==
        -1
    );
    if (resourcesToBeRemoved.length == 0) {
      logInfo("[Server] Nothing to delete");
      return false;
    }
    const res = await Promise.all(
      resourcesToBeRemoved.map((obj) => apiFactory.server.deleteServer(obj.id))
    );
    const success = res.findIndex((obj) => obj === false)! != 1;
    success
      ? logSuccess("[Server] Successfully deleted all unused resources")
      : logError("[Server] Failed to delete all unused resources");
    return success;
  }

  async export(): Promise<object> {
    let attachedResources = [];
    if (this._sshKey) {
      attachedResources.push(await this._sshKey.export());
    }
    if (this._floatingIPs) {
      attachedResources.push(
        ...(await Promise.all(this._floatingIPs.map((resource) => resource.export())))
      );
    }
    if (this._primaryIPs) {
      attachedResources.push(
        ...(await Promise.all(this._primaryIPs.map((resource) => resource.export())))
      );
    }
    return {
      resourceType: "Server",
      ...this._options,
      attachedResources,
    };
  }

  static async import(cdk: ICDK, data: any): Promise<Server> {
    const server = new Server(data);
    server.cdk = cdk;
    for (const attachedResource of data.attachedResources) {
      if (attachedResource.resourceType === "SSHKey") {
        server.addSSHKey(await SSHKey.import(cdk, attachedResource));
      } else if (attachedResource.resourceType === "PrimaryIP") {
        server.addPrimaryIP(await PrimaryIP.import(cdk, attachedResource));
      } else if (attachedResource.resourceType === "FloatingIP") {
        server.addFloatingIP(await FloatingIP.import(cdk, attachedResource));
      } else {
        throw new Error("[Server] Unsupported resource type");
      }
    }
    return server;
  }
}
