export type HCreatedImage = {
  id: number;
  name: string;
};

export enum HImageFlavor {
  UBUNTU = "ubuntu",
  CENTOS = "centos",
  DEBIAN = "debian",
  FEDORA = "fedora",
  UNKNOWN = "unknown",
}

export type HImageProtection = {
  delete: boolean;
};

export enum HImageStatus {
  AVAILABLE = "available",
  CREATING = "creating",
  UNAVAILABLE = "unavailable",
}

export enum HImageType {
  SYSTEM = "system",
  APP = "app",
  SNAPSHOT = "snapshot",
  BACKUP = "backup",
  TEMPORARY = "temporary",
}

export enum HISOImageType {
  PUBLIC = "public",
  PRIVATE = "private",
}

export type HISOImage = {
  deprecated: string | null;
  description: string;
  id: number;
  name: string | null;
  type: HISOImageType;
};

export type HImage = {
  bound_to: number | null;
  created: string;
  created_from: HCreatedImage | null;
  deleted: string | null;
  deprecated: string | null;
  description: string;
  disk_size: number;
  id: number;
  image_size: number | null;
  labels: { [key: string]: string };
  name: string | null;
  os_flavor: HImageFlavor;
  protection: HImageProtection;
  rapid_deploy: boolean;
  status: HImageStatus;
  type: HImageType;
};
