import { HMeta } from "./meta";

export type HSSHKey = {
  created: string;
  fingerprint: string;
  id: number;
  labels: { [key: string]: string };
  name: string;
  public_key: string;
};

export enum HSSHKeySort {
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

// Get All SSH Keys
export type SSHKeyGetAllRequest = {
  sort?: HSSHKeySort;
  name?: string;
  fingerprint?: string;
  label_selector?: string;
};

export type SSHKeyGetAllResponse = {
  meta?: HMeta;
  ssh_keys: HSSHKey | HSSHKey[];
};

// Create SSH Key
export type SSHKeyCreateRequest = {
  labels?: { [key: string]: string };
  name: string;
  public_key: string;
};

export type SSHKeyCreateResponse = {
  ssh_key: HSSHKey;
};

// Get SSH Key
export type SSHKeyGetResponse = {
  ssh_key: HSSHKey;
};

// Update SSH Key
export type SSHKeyUpdateRequest = {
  labels?: { [key: string]: string };
  name?: string;
};

export type SSHKeyUpdateResponse = {
  ssh_key: HSSHKey;
};
