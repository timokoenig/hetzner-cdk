import chalk = require("chalk");
import moment = require("moment");
import { APIFactory, IAPIFactory } from "../../api/factory";
import { HServerStatus } from "../../api/types/server";
import { ICDK } from "../cdk";
import { resourceNameFormatter } from "../utils/formatter";
import { Resource } from "./resource";
import { SSHKey } from "./sshkey";

export type ServerOptions = {
  name: string;
  image: string;
  labels?: { [key: string]: string };
  serverType: string;
  userData?: string;
};

export class Server implements Resource {
  cdk?: ICDK;
  private _options: ServerOptions;
  private _sshKey?: SSHKey;

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

  getAttachedResources(): Resource[] {
    return this._sshKey ? [this._sshKey] : [];
  }

  async apply(apiFactory: IAPIFactory): Promise<number> {
    const namespace = this.cdk?.namespace ?? "";
    const sshkey = await this._sshKey?.apply(apiFactory);

    const allServers = await apiFactory.server.getAllServers({
      label_selector: `namespace=${namespace}`,
    });
    const server = allServers.find((obj) => obj.name == this.getName());
    if (server) {
      // SSH Key already exists; check for updates
      // TODO check if we really need to update it
      const res = await apiFactory.server.updateServer({
        id: server.id,
        labels: { ...this._options.labels, namespace },
        name: this._options.name,
      });
      return res.server.id;
    } else {
      // SSH Key does not exist; create new key
      const res = await apiFactory.server.createServer({
        automount: false,
        datacenter: this.cdk?.datacenter.id.toString(),
        firewalls: undefined,
        image: this._options.image,
        labels: { ...this._options.labels, namespace },
        name: this.getName(),
        networks: undefined,
        placement_group: undefined,
        public_net: {
          enable_ipv4: true,
          enable_ipv6: false,
        },
        server_type: this._options.serverType,
        ssh_keys: sshkey ? [sshkey] : [],
        start_after_create: true,
        user_data: this._options.userData,
        volumes: [],
      });

      // Wait until server is running
      if (apiFactory instanceof APIFactory) {
        const createdAt = moment();
        await this._waitForServer(apiFactory, res.server.id, createdAt);
        console.log(chalk.gray(`Server ${res.server.name} is running`));
      }

      return res.server.id;
    }
  }

  // Request server status until server is running or timeout is reached
  private async _waitForServer(
    apiFactory: IAPIFactory,
    id: number,
    createdAt: moment.Moment
  ): Promise<void> {
    if (moment() > createdAt.add(Server.WAIT_TIMEOUT_SECONDS, "seconds"))
      throw new Error("Server is not running");
    const res = await apiFactory.server.getServer({
      id,
    });
    if (res.server.status == HServerStatus.RUNNING) return;
    await this._waitForServer(apiFactory, id, createdAt);
  }

  async delete(apiFactory: IAPIFactory): Promise<void> {
    const namespace = this.cdk?.namespace ?? "";
    const allServers = await apiFactory.server.getAllServers({
      label_selector: `namespace=${namespace}`,
    });
    const server = allServers.find((obj) => obj.name == this.getName());
    if (!server) return;
    await apiFactory.server.deleteServer({
      id: server.id,
    });
  }

  static async deleteUnusedResources(
    localResources: Server[],
    namespace: string,
    apiFactory: IAPIFactory
  ): Promise<void> {
    const remoteResources = await apiFactory.server.getAllServers({
      label_selector: `namespace=${namespace}`,
    });
    const resourcesToBeRemoved = remoteResources.filter(
      (server) =>
        localResources.findIndex((obj) => obj.getName() == server.name) == -1
    );
    await Promise.all(
      resourcesToBeRemoved.map((obj) =>
        apiFactory.server.deleteServer({
          id: obj.id,
        })
      )
    );
  }
}
