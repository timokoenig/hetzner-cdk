import { HAction } from "./action";
import { HDNSPtr } from "./dns";
import { HLocation } from "./location";
import { HMeta } from "./meta";
import { HProtection } from "./protection";

export enum HIPType {
  IPV4 = "ipv4",
  IPV6 = "ipv6",
}

export type HFloatingIP = {
  blocked: boolean;
  created: string;
  description: string | null;
  dns_ptr: HDNSPtr;
  home_location: HLocation;
  id: number;
  ip: string;
  labels: { [key: string]: string };
  name: string;
  protection: HProtection;
  server: number | null;
  type: HIPType;
};

export enum HFloatingIPSort {
  ID = "id",
  ID_ASC = "id:asc",
  ID_DESC = "id:desc",
  CREATED = "created",
  CREATED_ASC = "created:asc",
  CREATED_DESC = "created:desc",
}

// Get All Floating IPs
export type FloatingIPGetAllRequest = {
  name?: string;
  label_selector?: string;
  sort?: HFloatingIPSort;
};

export type FloatingIPGetAllResponse = {
  floating_ips: HFloatingIP | HFloatingIP[];
  meta?: HMeta;
};

// Create Floating IP
export type FloatingIPCreateRequest = {
  description?: string;
  home_location?: string;
  labels?: { [key: string]: string };
  name: string;
  server?: number;
  type: HIPType;
};

export type FloatingIPCreateResponse = {
  action?: HAction;
  floating_ip: HFloatingIP;
};

// Delete Floating IP
export type FloatingIPDeleteResponse = {
  floating_ip: HFloatingIP;
};

// Get a Floating IP
export type FloatingIPGetResponse = {
  floating_ip: HFloatingIP;
};

// Update a Floating IP
export type FloatingIPUpdateRequest = {
  description?: string;
  labels?: { [key: string]: string };
  name?: string;
};

export type FloatingIPUpdateResponse = {
  floating_ip: HFloatingIP;
};
