import { APIFactory, IAPIFactory } from "../../api/factory";
import { HIPType } from "../../api/types/floatingip";
import { HAssigneeType } from "../../api/types/primaryip";
import { ICDK } from "../cdk";
import { resourceNameFormatter } from "../utils/formatter";
import { logError, logInfo, logSuccess } from "../utils/logger";
import { Resource } from "./resource";

export type PrimaryIPOptions = {
  name: string;
  type: "ipv4" | "ipv6";
  labels?: { [key: string]: string };
  protected?: boolean;
};

export class PrimaryIP implements Resource {
  cdk?: ICDK;
  private _options: PrimaryIPOptions;

  constructor(options: PrimaryIPOptions) {
    this._options = options;
  }

  getName(): string {
    return resourceNameFormatter(this.cdk?.namespace ?? "", this._options.name);
  }

  getAttachedResources(): Resource[] {
    return [];
  }

  async apply(apiFactory: IAPIFactory): Promise<number> {
    logInfo("[PrimaryIP] Apply changes");
    if (!this.cdk) throw new Error("CDK not set");

    const namespace = this.cdk?.namespace ?? "";
    const allPrimaryIPs = await apiFactory.primaryip.getAllPrimaryIPs({
      label_selector: `namespace=${namespace}`,
    });
    const primaryIP = allPrimaryIPs.find((obj) => obj.name == this.getName());
    if (primaryIP) {
      // PrimaryIP already exists; check for updates
      logInfo("[PrimaryIP] Update existing PrimaryIP");
      const res = await apiFactory.primaryip.updatePrimaryIP(primaryIP.id, {
        name: this.getName(),
        labels: {
          ...this._options.labels,
          namespace,
        },
      });
      logSuccess("[PrimaryIP] Successfully updated the existing PrimaryIP");
      return res.id;
    } else {
      // PrimaryIP does not exist; create new key
      logInfo("[PrimaryIP] Create new PrimaryIP");
      const res = await apiFactory.primaryip.createPrimaryIP({
        name: this.getName(),
        labels: { ...this._options.labels, namespace },
        type: this._options.type as HIPType,
        assignee_type: HAssigneeType.SERVER,
        datacenter: this.cdk.datacenter.name,
      });
      logSuccess("[PrimaryIP] Successfully created a new PrimaryIP");

      if (apiFactory instanceof APIFactory) {
        // Update IP protection
        if (this._options.protected !== undefined) {
          this._options.protected
            ? logSuccess("[PrimaryIP] Enable protection")
            : logInfo("[PrimaryIP] Disable protection");
          await apiFactory.primaryip.changeProtection(res.id, {
            delete: this._options.protected,
          });
        }
      }

      return res.id;
    }
  }

  async delete(apiFactory: IAPIFactory): Promise<boolean> {
    const namespace = this.cdk?.namespace ?? "";
    const allPrimaryIPs = await apiFactory.primaryip.getAllPrimaryIPs({
      label_selector: `namespace=${namespace}`,
    });
    const primaryIP = allPrimaryIPs.find((obj) => obj.name == this.getName());
    if (!primaryIP) {
      logError("[PrimaryIP] IP does not exist; skip deletion");
      return false;
    }
    if (primaryIP.protection.delete) {
      logInfo("[PrimaryIP] IP is protected; skip deletion");
      return false;
    }
    logInfo("[PrimaryIP] Delete PrimaryIP");
    const res = await apiFactory.primaryip.deletePrimaryIP(primaryIP.id);
    res
      ? logSuccess("[PrimaryIP] Successfully deleted the PrimaryIP")
      : logError("[PrimaryIP] Failed to delete PrimaryIP");
    return res;
  }

  static async deleteUnusedResources(
    localResourceNames: string[],
    namespace: string,
    apiFactory: IAPIFactory
  ): Promise<boolean> {
    logInfo("[PrimaryIP] Try to delete all unused resources");
    const remoteResources = await apiFactory.primaryip.getAllPrimaryIPs({
      label_selector: `namespace=${namespace}`,
    });
    const resourcesToBeRemoved = remoteResources.filter(
      (primaryIP) =>
        localResourceNames.findIndex(
          (name) => name == primaryIP.name && !primaryIP.protection.delete
        ) == -1
    );
    if (resourcesToBeRemoved.length == 0) {
      logInfo("[PrimaryIP] Nothing to delete");
      return false;
    }
    const res = await Promise.all(
      resourcesToBeRemoved.map((obj) => apiFactory.primaryip.deletePrimaryIP(obj.id))
    );
    const success = res.findIndex((obj) => obj === false)! != 1;
    success
      ? logSuccess("[PrimaryIP] Successfully deleted all unused resources")
      : logError("[PrimaryIP] Failed to delete all unused resources");
    return success;
  }
}
