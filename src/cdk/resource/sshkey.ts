import { IAPIFactory } from "../../api/factory";
import { ICDK } from "../cdk";
import { resourceNameFormatter } from "../utils/formatter";
import { logError, logInfo, logSuccess } from "../utils/logger";
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
    logInfo("[SSHKey] Apply changes");
    const namespace = this.cdk?.namespace ?? "";
    const allSSHKeys = await apiFactory.sshkey.getAllSSHKeys({
      label_selector: `namespace=${namespace}`,
    });
    const sshKey = allSSHKeys.find((obj) => obj.name == this.getName());
    if (sshKey) {
      // SSH Key already exists; check for updates
      logInfo("[SSHKey] Update existing SSH Key");
      const res = await apiFactory.sshkey.updateSSHKey(sshKey.id, {
        name: this.getName(),
        labels: {
          ...this._options.labels,
          namespace,
        },
      });
      logSuccess("[SSHKey] Successfully updated the existing SSH Key");
      return res.id;
    } else {
      // SSH Key does not exist; create new key
      logInfo("[SSHKey] Create new SSH Key");
      const res = await apiFactory.sshkey.createSSHKey({
        name: this.getName(),
        labels: { ...this._options.labels, namespace },
        public_key: this._options.publicKey.key,
      });
      logSuccess("[SSHKey] Successfully created a new SSH Key");
      return res.id;
    }
  }

  async delete(apiFactory: IAPIFactory): Promise<boolean> {
    logInfo("[SSHKey] Delete SSH Key");
    const namespace = this.cdk?.namespace ?? "";
    const allSSHKeys = await apiFactory.sshkey.getAllSSHKeys({
      label_selector: `namespace=${namespace}`,
    });
    const sshKey = allSSHKeys.find((obj) => obj.name == this.getName());
    if (!sshKey) {
      logError("[SSHKey] Unable to find SSH Key");
      return false;
    }
    const res = await apiFactory.sshkey.deleteSSHKey(sshKey.id);
    res
      ? logSuccess("[SSHKey] Successfully deleted the SSH Key")
      : logError("[SSHKey] Failed to delete the SSH Key");
    return res;
  }

  static async deleteUnusedResources(
    localResourceNames: string[],
    namespace: string,
    apiFactory: IAPIFactory
  ): Promise<boolean> {
    logInfo("[SSHKey] Try to delete all unused resources");
    const remoteResources = await apiFactory.sshkey.getAllSSHKeys({
      label_selector: `namespace=${namespace}`,
    });
    const resourcesToBeRemoved = remoteResources.filter(
      (sshkey) => localResourceNames.findIndex((name) => name == sshkey.name) == -1
    );
    if (resourcesToBeRemoved.length == 0) {
      logInfo("[SSHKey] Nothing to delete");
      return false;
    }
    const res = await Promise.all(
      resourcesToBeRemoved.map((obj) => apiFactory.sshkey.deleteSSHKey(obj.id))
    );
    const success = res.findIndex((obj) => obj === false) != 1;
    success
      ? logSuccess("[SSHKey] Successfully deleted all unused resources")
      : logError("[SSHKey] Failed to delete all unused resources");
    return success;
  }
}
