import { HDatacenter } from "../../api/types/datacenter";
import { HDatacenterMock } from "../../api/types/__mocks__/datacenter-mock";
import { CDKMode, ICDK } from "../cdk";
import { Resource, ResourceChangeset } from "../classes/resource";

export class CDKMock implements ICDK {
  mode: CDKMode = CDKMode.DIFF;
  namespace: string = "mock";
  datacenter: HDatacenter = HDatacenterMock;
  changeset: ResourceChangeset[] = [];
  run(): void {}
  add(_: Resource): void {}
}
