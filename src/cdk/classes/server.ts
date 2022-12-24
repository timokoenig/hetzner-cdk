import chalk from "chalk";
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
import { FloatingIP } from "./floatingip";
import { PrimaryIP } from "./primaryip";
import { Resource } from "./resource";
import { SSHKey } from "./sshkey";

export type ServerOptions = {
  name: string;
  image: string;
  labels?: { [key: string]: string };
  serverType: string;
  userData?: string;
  dockerImage?: string;
  enableIPv4?: boolean;
  enableIPv6?: boolean;
  protected?: boolean;
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
    const namespace = this.cdk?.namespace ?? "";
    const sshkey = await this._sshKey?.apply(apiFactory);
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
    if (
      this._options.userData === undefined &&
      this._options.dockerImage !== undefined
    ) {
      const dockerImage = formatDockerImage(this._options.dockerImage);
      cloudConfig = defaultCloudConfig(dockerImage);

      // Save docker image version as server label so we can identify later if we need to restart
      // the server to run a new version of the given docker image
      labels.dockerImageVersion = extractDockerImageVersion(dockerImage);
    }

    const allServers = await apiFactory.server.getAllServers({
      label_selector: `namespace=${namespace}`,
    });
    const server = allServers.find((obj) => obj.name == this.getName());
    if (server) {
      // Server already exists; check for updates
      const res = await apiFactory.server.updateServer(server.id, {
        labels,
        name: this.getName(),
      });
      return res.id;
    } else {
      // Server does not exist; create new server
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

      if (apiFactory instanceof APIFactory) {
        // Wait until server is running
        const createdAt = moment();
        await this._waitForServerToBeReady(apiFactory, res.id, createdAt);
        console.log(chalk.gray(`Server ${res.name} is running`));

        // Update Server protection
        if (this._options.protected !== undefined) {
          await apiFactory.server.changeProtection(res.id, {
            delete: this._options.protected,
            rebuild: this._options.protected, // currently needs to be the same as `deleted`
          });
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
    await this._waitForServerToBeReady(apiFactory, id, createdAt);
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
      console.log(chalk.red("[Server] Server does not exist; skip deletion"));
      return false;
    }
    if (server.protection.delete) {
      console.log(chalk.yellow("[Server] Server is protected; skip deletion"));
      return false;
    }
    const res = await apiFactory.server.deleteServer(server.id);
    if (!res) return false;

    // Wait until server has been deleted
    if (apiFactory instanceof APIFactory) {
      const createdAt = moment();
      await this._waitForServerToBeDeleted(apiFactory, server.id, createdAt);
      console.log(chalk.gray(`Server ${server.name} has been deleted`));
    }
    return true;
  }

  static async deleteUnusedResources(
    localResourceNames: string[],
    namespace: string,
    apiFactory: IAPIFactory
  ): Promise<boolean> {
    const remoteResources = await apiFactory.server.getAllServers({
      label_selector: `namespace=${namespace}`,
    });
    const resourcesToBeRemoved = remoteResources.filter(
      (server) =>
        localResourceNames.findIndex(
          (name) => name == server.name && !server.protection.delete
        ) == -1
    );
    if (resourcesToBeRemoved.length == 0) return false;
    const res = await Promise.all(
      resourcesToBeRemoved.map((obj) => apiFactory.server.deleteServer(obj.id))
    );
    return res.findIndex((obj) => obj === false)! != 1;
  }
}
