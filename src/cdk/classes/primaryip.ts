import { IAPIFactory } from "../../api/factory";
import { HIPType } from "../../api/types/floatingip";
import { HAssigneeType } from "../../api/types/primaryip";
import { ICDK } from "../cdk";
import { resourceNameFormatter } from "../utils/formatter";
import { Resource } from "./resource";

export type PrimaryIPOptions = {
  name: string;
  type: "ipv4" | "ipv6";
  labels?: { [key: string]: string };
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
    if (!this.cdk) throw new Error("CDK not set");

    const namespace = this.cdk?.namespace ?? "";
    const allPrimaryIPs = await apiFactory.primaryip.getAllPrimaryIPs({
      label_selector: `namespace=${namespace}`,
    });
    const primaryIP = allPrimaryIPs.find((obj) => obj.name == this.getName());
    if (primaryIP) {
      // PrimaryIP already exists; check for updates
      // TODO check if we really need to update it
      const res = await apiFactory.primaryip.updatePrimaryIP({
        id: primaryIP.id,
        name: this.getName(),
        labels: {
          ...this._options.labels,
          namespace,
        },
      });
      return res.primary_id.id;
    } else {
      // PrimaryIP does not exist; create new key
      const res = await apiFactory.primaryip.createPrimaryIP({
        name: this.getName(),
        labels: { ...this._options.labels, namespace },
        type: this._options.type as HIPType,
        assignee_type: HAssigneeType.SERVER,
        datacenter: this.cdk.datacenter.name,
      });
      return res.primary_ip.id;
    }
  }

  async delete(apiFactory: IAPIFactory): Promise<void> {
    const namespace = this.cdk?.namespace ?? "";
    const allPrimaryIPs = await apiFactory.primaryip.getAllPrimaryIPs({
      label_selector: `namespace=${namespace}`,
    });
    const primaryIP = allPrimaryIPs.find((obj) => obj.name == this.getName());
    if (!primaryIP) return;
    await apiFactory.primaryip.deletePrimaryIP({
      id: primaryIP.id,
    });
  }

  static async deleteUnusedResources(
    localResources: PrimaryIP[],
    namespace: string,
    apiFactory: IAPIFactory
  ): Promise<void> {
    const remoteResources = await apiFactory.primaryip.getAllPrimaryIPs({
      label_selector: `namespace=${namespace}`,
    });
    const resourcesToBeRemoved = remoteResources.filter(
      (primaryip) =>
        localResources.findIndex((obj) => obj.getName() == primaryip.name) == -1
    );
    await Promise.all(
      resourcesToBeRemoved.map((obj) =>
        apiFactory.primaryip.deletePrimaryIP({
          id: obj.id,
        })
      )
    );
  }
}
