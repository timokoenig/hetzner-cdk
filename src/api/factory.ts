import { ICDK } from "../cdk/cdk";
import { FloatingIPAPI, IFloatingIPAPI } from "./floatingip/floatingip";
import { FloatingIPAPIChangeset } from "./floatingip/floatingip.changeset";
import { IPrimaryIPAPI, PrimaryIPAPI } from "./primaryip/primaryip";
import { PrimaryIPAPIChangeset } from "./primaryip/primaryip.changeset";
import { IServerAPI, ServerAPI } from "./server/server";
import { ServerAPIChangeset } from "./server/server.changeset";
import { ISSHKeyAPI, SSHKeyAPI } from "./sshkey/sshkey";
import { SSHKeyAPIChangeset } from "./sshkey/sshkey.changeset";

export interface IAPIFactory {
  server: IServerAPI;
  sshkey: ISSHKeyAPI;
  floatingip: IFloatingIPAPI;
  primaryip: IPrimaryIPAPI;
}

export class APIFactory implements IAPIFactory {
  server: IServerAPI = new ServerAPI();
  sshkey: ISSHKeyAPI = new SSHKeyAPI();
  floatingip: IFloatingIPAPI = new FloatingIPAPI();
  primaryip: IPrimaryIPAPI = new PrimaryIPAPI();
}

export class APIFactoryChangeset implements IAPIFactory {
  constructor(cdk: ICDK, apiFactory: IAPIFactory) {
    this.server = new ServerAPIChangeset(cdk, apiFactory.server);
    this.sshkey = new SSHKeyAPIChangeset(cdk, apiFactory.sshkey);
    this.floatingip = new FloatingIPAPIChangeset(cdk, apiFactory.floatingip);
    this.primaryip = new PrimaryIPAPIChangeset(cdk, apiFactory.primaryip);
  }

  server: IServerAPI;
  sshkey: ISSHKeyAPI;
  floatingip: IFloatingIPAPI;
  primaryip: IPrimaryIPAPI;
}
