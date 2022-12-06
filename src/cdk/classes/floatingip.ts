import { IAPIFactory } from "../../api/factory";
import { HIPType } from "../../api/types/floatingip";
import { ICDK } from "../cdk";
import { resourceNameFormatter } from "../utils/formatter";
import { Resource } from "./resource";

export type FloatingIPOptions = {
  name: string;
  type: "ipv4" | "ipv6";
  labels?: { [key: string]: string };
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
      // TODO check if we really need to update it
      const res = await apiFactory.floatingip.updateFloatingIP({
        id: floatingIP.id,
        name: this.getName(),
        labels: {
          ...this._options.labels,
          namespace,
        },
      });
      return res.floating_ip.id;
    } else {
      // FloatingIP does not exist; create new key
      const res = await apiFactory.floatingip.createFloatingIP({
        name: this.getName(),
        labels: { ...this._options.labels, namespace },
        type: this._options.type as HIPType,
        home_location: this.cdk.datacenter.location.name,
      });
      return res.floating_ip.id;
    }
  }

  async delete(apiFactory: IAPIFactory): Promise<void> {
    const namespace = this.cdk?.namespace ?? "";
    const allFloatingIPs = await apiFactory.floatingip.getAllFloatingIPs({
      label_selector: `namespace=${namespace}`,
    });
    const floatingIP = allFloatingIPs.find((obj) => obj.name == this.getName());
    if (!floatingIP) return;
    await apiFactory.floatingip.deleteFloatingIP({
      id: floatingIP.id,
    });
  }

  static async deleteUnusedResources(
    localResources: FloatingIP[],
    namespace: string,
    apiFactory: IAPIFactory
  ): Promise<void> {
    const remoteResources = await apiFactory.floatingip.getAllFloatingIPs({
      label_selector: `namespace=${namespace}`,
    });
    const resourcesToBeRemoved = remoteResources.filter(
      (floatingIP) =>
        localResources.findIndex((obj) => obj.getName() == floatingIP.name) ==
        -1
    );
    await Promise.all(
      resourcesToBeRemoved.map((obj) =>
        apiFactory.floatingip.deleteFloatingIP({
          id: obj.id,
        })
      )
    );
  }
}
