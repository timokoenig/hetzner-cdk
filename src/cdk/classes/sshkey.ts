import { IAPIFactory } from "../../api/factory";
import { ICDK } from "../cdk";
import { resourceNameFormatter } from "../utils/formatter";
import { PublicKey } from "./publickey";
import { Resource } from "./resource";

export type SSHKeyOptions = {
  name: string;
  publicKey: PublicKey;
  labels?: { [key: string]: string };
};

export class SSHKey implements Resource {
  cdk?: ICDK;
  private _options: SSHKeyOptions;

  constructor(options: SSHKeyOptions) {
    this._options = options;
  }

  getName(): string {
    return resourceNameFormatter(this.cdk?.namespace ?? "", this._options.name);
  }

  getAttachedResources(): Resource[] {
    return [];
  }

  async apply(apiFactory: IAPIFactory): Promise<number> {
    const namespace = this.cdk?.namespace ?? "";
    const allSSHKeys = await apiFactory.sshkey.getAllSSHKeys({
      label_selector: `namespace=${namespace}`,
    });
    const sshKey = allSSHKeys.find((obj) => obj.name == this.getName());
    if (sshKey) {
      // SSH Key already exists; check for updates
      const res = await apiFactory.sshkey.updateSSHKey(sshKey.id, {
        name: this.getName(),
        labels: {
          ...this._options.labels,
          namespace,
        },
      });
      return res.id;
    } else {
      // SSH Key does not exist; create new key
      const res = await apiFactory.sshkey.createSSHKey({
        name: this.getName(),
        labels: { ...this._options.labels, namespace },
        public_key: this._options.publicKey.key,
      });
      return res.id;
    }
  }

  async delete(apiFactory: IAPIFactory): Promise<boolean> {
    const namespace = this.cdk?.namespace ?? "";
    const allSSHKeys = await apiFactory.sshkey.getAllSSHKeys({
      label_selector: `namespace=${namespace}`,
    });
    const sshKey = allSSHKeys.find((obj) => obj.name == this.getName());
    if (!sshKey) return false;
    return await apiFactory.sshkey.deleteSSHKey(sshKey.id);
  }

  static async deleteUnusedResources(
    localResourceNames: string[],
    namespace: string,
    apiFactory: IAPIFactory
  ): Promise<boolean> {
    const remoteResources = await apiFactory.sshkey.getAllSSHKeys({
      label_selector: `namespace=${namespace}`,
    });
    const resourcesToBeRemoved = remoteResources.filter(
      (sshkey) => localResourceNames.findIndex((name) => name == sshkey.name) == -1
    );
    if (resourcesToBeRemoved.length == 0) return false;
    const res = await Promise.all(
      resourcesToBeRemoved.map((obj) => apiFactory.sshkey.deleteSSHKey(obj.id))
    );
    return res.findIndex((obj) => obj === false) != 1;
  }
}
