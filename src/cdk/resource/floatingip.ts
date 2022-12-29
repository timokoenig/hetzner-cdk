import { APIFactory, IAPIFactory } from "../../api/factory";
import { HIPType } from "../../api/types/floatingip";
import { ICDK } from "../cdk";
import { resourceNameFormatter } from "../utils/formatter";
import { logError, logInfo, logSuccess } from "../utils/logger";
import { Resource } from "./resource";

export type FloatingIPOptions = {
  name: string;
  type: "ipv4" | "ipv6";
  labels?: { [key: string]: string };
  protected?: boolean;
};

export class FloatingIP implements Resource {
  cdk?: ICDK;
  private _options: FloatingIPOptions;

  constructor(options: FloatingIPOptions) {
    this._options = options;
  }

  getName(): string {
    return resourceNameFormatter(this.cdk?.namespace ?? "", this._options.name);
  }

  getAttachedResources(): Resource[] {
    return [];
  }

  async apply(apiFactory: IAPIFactory): Promise<number> {
    logInfo("[FloatingIP] Apply changes");
    if (!this.cdk) throw new Error("CDK not set");

    const namespace = this.cdk?.namespace ?? "";
    const allFloatingIPs = await apiFactory.floatingip.getAllFloatingIPs({
      label_selector: `namespace=${namespace}`,
    });
    const floatingIP = allFloatingIPs.find((obj) => obj.name == this.getName());
    if (floatingIP) {
      // FloatingIP already exists; check for updates
      logInfo("[FloatingIP] Update existing FloatingIP");
      const res = await apiFactory.floatingip.updateFloatingIP(floatingIP.id, {
        name: this.getName(),
        labels: {
          ...this._options.labels,
          namespace,
        },
      });
      logSuccess("[FloatingIP] Successfully updated the existing FloatingIP");
      return res.id;
    } else {
      // FloatingIP does not exist; create new key
      logInfo("[FloatingIP] Create new FloatingIP");
      const res = await apiFactory.floatingip.createFloatingIP({
        name: this.getName(),
        labels: { ...this._options.labels, namespace },
        type: this._options.type as HIPType,
        home_location: this.cdk.datacenter.location.name,
      });
      logSuccess("[FloatingIP] Successfully created a new FloatingIP");

      if (apiFactory instanceof APIFactory) {
        // Update IP protection
        if (this._options.protected !== undefined) {
          this._options.protected
            ? logSuccess("[FloatingIP] Enable protection")
            : logInfo("[FloatingIP] Disable protection");
          await apiFactory.floatingip.changeProtection(res.id, {
            delete: this._options.protected,
          });
        }
      }

      return res.id;
    }
  }

  async delete(apiFactory: IAPIFactory): Promise<boolean> {
    const namespace = this.cdk?.namespace ?? "";
    const allFloatingIPs = await apiFactory.floatingip.getAllFloatingIPs({
      label_selector: `namespace=${namespace}`,
    });
    const floatingIP = allFloatingIPs.find((obj) => obj.name == this.getName());
    if (!floatingIP) {
      logError("[FloatingIP] IP does not exist; skip deletion");
      return false;
    }
    if (floatingIP.protection.delete) {
      logInfo("[FloatingIP] IP is protected; skip deletion");
      return false;
    }
    logInfo("[FloatingIP] Delete FloatingIP");
    const res = await apiFactory.floatingip.deleteFloatingIP(floatingIP.id);
    res
      ? logSuccess("[FloatingIP] Successfully deleted the FloatingIP")
      : logError("[FloatingIP] Failed to delete FloatingIP");
    return res;
  }

  static async deleteUnusedResources(
    localResourceNames: string[],
    namespace: string,
    apiFactory: IAPIFactory
  ): Promise<boolean> {
    logInfo("[FloatingIP] Try to delete all unused resources");
    const remoteResources = await apiFactory.floatingip.getAllFloatingIPs({
      label_selector: `namespace=${namespace}`,
    });
    const resourcesToBeRemoved = remoteResources.filter(
      (floatingIP) =>
        localResourceNames.findIndex(
          (name) => name == floatingIP.name && !floatingIP.protection.delete
        ) == -1
    );
    if (resourcesToBeRemoved.length == 0) {
      logInfo("[FloatingIP] Nothing to delete");
      return false;
    }
    const res = await Promise.all(
      resourcesToBeRemoved.map((obj) => apiFactory.floatingip.deleteFloatingIP(obj.id))
    );
    const success = res.findIndex((obj) => obj === false)! != 1;
    success
      ? logSuccess("[FloatingIP] Successfully deleted all unused resources")
      : logError("[FloatingIP] Failed to delete all unused resources");

    return success;
  }
}
