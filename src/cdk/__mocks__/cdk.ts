import { HDatacenter } from "../../api/types/datacenter";
import { HDatacenterMock } from "../../api/types/__mocks__/datacenter-mock";
import { CDKMode, ICDK } from "../cdk";
import { Resource, ResourceChangeset } from "../resource/resource";

export class CDKMock implements ICDK {
  mode: CDKMode = CDKMode.DIFF;
  namespace: string = "mock";
  datacenter: HDatacenter = HDatacenterMock;
  changeset: ResourceChangeset[] = [];
  run(): void {}
  runDiff(options?: { debug?: boolean }): Promise<void> {
    return Promise.resolve();
  }
  runDeploy(options?: { debug?: boolean; force?: boolean }): Promise<void> {
    return Promise.resolve();
  }
  runDestroy(options?: { debug?: boolean; all?: boolean }): Promise<void> {
    return Promise.resolve();
  }
  add(_: Resource): void {}
  async export(): Promise<string> {
    return "";
  }
}
