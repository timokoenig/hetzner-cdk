import { IAPIFactory } from "../../api/factory";
import { ICDK } from "../cdk";

export enum Operation {
  ADD = "add",
  MODIFY = "modify",
  DELETE = "delete",
}

export enum ResourceType {
  SERVER = "Server",
  SSHKEY = "SSHKey",
  FLOATINGIP = "FloatingIP",
  PRIMARYIP = "PrimaryIP",
}

export interface ResourceChangeset {
  operation: Operation;
  id: string;
  type: string;
  value_old?: string;
  value_new?: string;
}

export interface Resource {
  cdk?: ICDK;
  getName(): string;
  getAttachedResources(): Resource[];
  apply(apiFactory: IAPIFactory): Promise<number>;
  delete(apiFactory: IAPIFactory): Promise<boolean>;
}
