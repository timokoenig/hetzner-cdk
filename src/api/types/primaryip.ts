import { HAction } from "./action";
import { HDatacenter } from "./datacenter";
import { HDNSPtr } from "./dns";
import { HIPType } from "./floatingip";
import { HMeta } from "./meta";
import { HProtection } from "./protection";

export enum HPrimaryIPSort {
  ID = "id",
  ID_ASC = "id:asc",
  ID_DESC = "id:desc",
  CREATED = "created",
  CREATED_ASC = "created:asc",
  CREATED_DESC = "created:desc",
}

export enum HAssigneeType {
  SERVER = "server",
}

export type HPrimaryIP = {
  assignee_ip: number | null;
  assignee_type: HAssigneeType;
  auto_delete: boolean;
  blocked: boolean;
  created: string;
  datacenter: HDatacenter;
  dns_ptr: HDNSPtr | HDNSPtr[];
  id: number;
  ip: string;
  labels: { [key: string]: string };
  name: string;
  protection: HProtection;
  type: HIPType;
};

// Get All Primary IPs
export type PrimaryIPGetAllRequest = {
  name?: string;
  label_selector?: string;
  ip?: string;
  sort?: HPrimaryIPSort;
};

export type PrimaryIPGetAllResponse = {
  meta: HMeta;
  primary_ips: HPrimaryIP | HPrimaryIP[];
};

// Create Primary IP
export type PrimaryIPCreateRequest = {
  assignee_id?: number;
  assignee_type: HAssigneeType;
  auto_delete?: boolean;
  datacenter?: string;
  labels?: { [key: string]: string };
  name: string;
  type: HIPType;
};

export type PrimaryIPCreateResponse = {
  action?: HAction;
  primary_ip: HPrimaryIP;
};

// Delete a Primary IP
export type PrimaryIPDeleteRequest = {
  id: number;
};

// Get a Primary IP
export type PrimaryIPGetRequest = {
  id: number;
};

export type PrimaryIPGetResponse = {
  primary_ip: HPrimaryIP;
};

// Update a Primary IP
export type PrimaryIPUpdateRequest = {
  id: number;
  auto_delete?: boolean;
  labels?: { [key: string]: string };
  name?: string;
};

export type PrimaryIPUpdateResponse = {
  primary_id: HPrimaryIP;
};
