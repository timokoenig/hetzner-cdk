import { HAction } from "./action";
import { HDatacenter } from "./datacenter";
import { HImage, HISOImage } from "./image";
import { HMeta } from "./meta";
import { HPrivateNet, HPublicNet } from "./network";
import { HPlacementGroup } from "./placementgroup";
import { HPrice } from "./price";

export enum HServerStatus {
  INITIALIZING = "initializing",
  STARTING = "starting",
  RUNNING = "running",
  STOPPING = "stopping",
  OFF = "off",
  DELETING = "deleting",
  REBUILDING = "rebuilding",
  MIGRATING = "migrating",
  UNKNOWN = "unknown",
}

export enum HServerSort {
  ID = "id",
  ID_ASC = "id:asc",
  ID_DESC = "id:desc",
  NAME = "name",
  NAME_ASC = "name:asc",
  NAME_DESC = "name:desc",
  CREATED = "created",
  CREATED_ASC = "created:asc",
  CREATED_DESC = "created:desc",
}

export type HServerFirewall = {
  firewall: string;
};

export type HServerProtection = {
  delete: boolean;
  rebuild: boolean;
};

export enum HCPUType {
  SHARED = "shared",
  DEDICATED = "dedicated",
}

export enum HStorageType {
  LOCAL = "local",
  NETWORK = "network",
}

export type HServerType = {
  cores: number;
  cpu_type: HCPUType;
  deprecated: boolean;
  description: string;
  disk: number;
  id: number;
  memory: number;
  name: string;
  prices: HPrice[];
  storage_type: HStorageType;
};

export type HServer = {
  backup_window: string | null;
  created: string;
  datacenter: HDatacenter;
  id: number;
  image: HImage;
  included_traffic: number | null;
  ingoing_traffic: number | null;
  iso: HISOImage | null;
  labels: { [key: string]: string };
  load_balancers?: number[];
  locked: boolean;
  name: string;
  outgoing_traffic: number | null;
  placement_group?: HPlacementGroup | null;
  primary_disk_size: number;
  private_net: HPrivateNet[];
  protection: HServerProtection;
  public_net: HPublicNet;
  rescue_enabled: boolean;
  server_type: HServerType;
  status: HServerStatus;
  volumes?: number[];
};

// Get All Servers
export type ServerGetAllRequest = {
  name?: string;
  label_selector?: string;
  sort?: HServerSort;
  status?: HServerStatus;
};

export type ServerGetAllResponse = {
  meta: HMeta;
  servers: HServer[];
};

// Create A Server
export type ServerCreatePublicNet = {
  enable_ipv4?: boolean;
  enable_ipv6?: boolean;
  ipv4?: number;
  ipv6?: number;
};

export type ServerCreateRequest = {
  automount?: boolean;
  datacenter?: string;
  firewalls?: HServerFirewall | HServerFirewall[];
  image: string;
  labels?: { [key: string]: string };
  location?: string;
  name: string;
  networks?: number | number[];
  placement_group?: number;
  public_net?: ServerCreatePublicNet;
  server_type: string;
  ssh_keys?: string[] | number[];
  start_after_create?: boolean;
  user_data?: string;
  volumes?: number[];
};

export type ServerCreateResponse = {
  action: HAction;
  next_action: HAction | HAction[];
  root_password: string | null;
  server: HServer;
};

// Delete A Server
export type ServerDeleteResponse = {
  action: HAction;
};

// Get A Server
export type ServerGetResponse = {
  server: HServer;
};

// Update A Server
export type ServerUpdateRequest = {
  labels?: { [key: string]: string };
  name?: string;
};

export type ServerUpdateResponse = {
  server: HServer;
};

// Action: Server Protection
export type ServerProtectionRequest = {
  delete: boolean;
  rebuild: boolean;
};

export type ServerProtectionResponse = {
  action: HAction;
};
