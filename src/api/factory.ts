import { ICDK } from "../cdk/cdk";
import { FloatingIPAPI, IFloatingIPAPI } from "./floatingip";
import { FloatingIPAPIChangeset } from "./floatingip.changeset";
import { IServerAPI, ServerAPI } from "./server";
import { ServerAPIChangeset } from "./server.changeset";
import { ISSHKeyAPI, SSHKeyAPI } from "./sshkey";
import { SSHKeyAPIChangeset } from "./sshkey.changeset";

export interface IAPIFactory {
  server: IServerAPI;
  sshkey: ISSHKeyAPI;
  floatingip: IFloatingIPAPI;
}

export class APIFactory implements IAPIFactory {
  server: IServerAPI = new ServerAPI();
  sshkey: ISSHKeyAPI = new SSHKeyAPI();
  floatingip: IFloatingIPAPI = new FloatingIPAPI();
}

export class APIFactoryChangeset implements IAPIFactory {
  constructor(cdk: ICDK) {
    this.server = new ServerAPIChangeset(cdk, new ServerAPI());
    this.sshkey = new SSHKeyAPIChangeset(cdk, new SSHKeyAPI());
    this.floatingip = new FloatingIPAPIChangeset(cdk, new FloatingIPAPI());
  }

  server: IServerAPI;
  sshkey: ISSHKeyAPI;
  floatingip: IFloatingIPAPI;
}
