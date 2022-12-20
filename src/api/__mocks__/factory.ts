import { IAPIFactory } from "../factory";
import { IFloatingIPAPI } from "../floatingip";
import { IPrimaryIPAPI } from "../primaryip";
import { IServerAPI } from "../server";
import { ISSHKeyAPI } from "../sshkey";
import { FloatingIPAPIMock } from "./floatingip";
import { PrimaryIPAPIMock } from "./primaryip";
import { ServerAPIMock } from "./server";
import { SSHKeyAPIMock } from "./sshkey";

export class APIFactoryMock implements IAPIFactory {
  server: IServerAPI = new ServerAPIMock();
  sshkey: ISSHKeyAPI = new SSHKeyAPIMock();
  floatingip: IFloatingIPAPI = new FloatingIPAPIMock();
  primaryip: IPrimaryIPAPI = new PrimaryIPAPIMock();
}
