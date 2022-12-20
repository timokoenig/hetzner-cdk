import chalk from "chalk";
import { APIFactory, IAPIFactory } from "../../api/factory";
import { HIPType } from "../../api/types/floatingip";
import { ICDK } from "../cdk";
import { resourceNameFormatter } from "../utils/formatter";
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
    if (!this.cdk) throw new Error("CDK not set");

    const namespace = this.cdk?.namespace ?? "";
    const allFloatingIPs = await apiFactory.floatingip.getAllFloatingIPs({
      label_selector: `namespace=${namespace}`,
    });
    const floatingIP = allFloatingIPs.find((obj) => obj.name == this.getName());
    if (floatingIP) {
      // FloatingIP already exists; check for updates
      const res = await apiFactory.floatingip.updateFloatingIP(floatingIP.id, {
        name: this.getName(),
        labels: {
          ...this._options.labels,
          namespace,
        },
      });
      return res.id;
    } else {
      // FloatingIP does not exist; create new key
      const res = await apiFactory.floatingip.createFloatingIP({
        name: this.getName(),
        labels: { ...this._options.labels, namespace },
        type: this._options.type as HIPType,
        home_location: this.cdk.datacenter.location.name,
      });

      if (apiFactory instanceof APIFactory) {
        // Update IP protection
        if (this._options.protected !== undefined) {
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
      console.log(chalk.red("[FloatingIP] IP does not exist; skip deletion"));
      return false;
    }
    if (floatingIP.protection.delete) {
      console.log(chalk.yellow("[FloatingIP] IP is protected; skip deletion"));
      return false;
    }
    return await apiFactory.floatingip.deleteFloatingIP(floatingIP.id);
  }

  static async deleteUnusedResources(
    localResourceNames: string[],
    namespace: string,
    apiFactory: IAPIFactory
  ): Promise<boolean> {
    const remoteResources = await apiFactory.floatingip.getAllFloatingIPs({
      label_selector: `namespace=${namespace}`,
    });
    const resourcesToBeRemoved = remoteResources.filter(
      (floatingIP) =>
        localResourceNames.findIndex(
          (name) => name == floatingIP.name && !floatingIP.protection.delete
        ) == -1
    );
    if (resourcesToBeRemoved.length == 0) return false;
    const res = await Promise.all(
      resourcesToBeRemoved.map((obj) =>
        apiFactory.floatingip.deleteFloatingIP(obj.id)
      )
    );
    return res.findIndex((obj) => obj === false)! != 1;
  }
}
