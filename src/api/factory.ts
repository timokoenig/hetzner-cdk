import { ICDK } from "../cdk/cdk";
import { IServerAPI, ServerAPI } from "./server";
import { ServerAPIChangeset } from "./server.changeset";
import { ISSHKeyAPI, SSHKeyAPI } from "./sshkey";
import { SSHKeyAPIChangeset } from "./sshkey.changeset";

export interface IAPIFactory {
  server: IServerAPI;
  sshkey: ISSHKeyAPI;
}

export class APIFactory implements IAPIFactory {
  server: IServerAPI = new ServerAPI();
  sshkey: ISSHKeyAPI = new SSHKeyAPI();
}

export class APIFactoryChangeset implements IAPIFactory {
  constructor(cdk: ICDK) {
    this.server = new ServerAPIChangeset(cdk, new ServerAPI());
    this.sshkey = new SSHKeyAPIChangeset(cdk, new SSHKeyAPI());
  }

  server: IServerAPI;
  sshkey: ISSHKeyAPI;
}
