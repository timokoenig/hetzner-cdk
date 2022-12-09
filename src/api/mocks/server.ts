import { HImageFlavor, HImageStatus, HImageType } from "../types/image";
import {
  HCPUType,
  HServer,
  HServerStatus,
  HStorageType,
} from "../types/server";
import { HLocationMock } from "./location";

export const HServerMock: HServer = {
  backup_window: null,
  created: "",
  datacenter: {
    id: 0,
    description: "",
    location: HLocationMock,
    name: "",
    server_types: {
      available: [],
      available_for_migration: [],
      supported: [],
    },
  },
  id: 0,
  image: {
    bound_to: null,
    created: "",
    created_from: null,
    deleted: null,
    deprecated: null,
    description: "",
    disk_size: 0,
    id: 0,
    image_size: null,
    labels: {},
    name: null,
    os_flavor: HImageFlavor.UBUNTU,
    protection: {
      delete: false,
    },
    rapid_deploy: false,
    status: HImageStatus.AVAILABLE,
    type: HImageType.APP,
  },
  included_traffic: null,
  ingoing_traffic: null,
  iso: null,
  labels: {},
  load_balancers: undefined,
  locked: false,
  name: "",
  outgoing_traffic: null,
  placement_group: undefined,
  primary_disk_size: 1,
  private_net: [],
  protection: {
    delete: false,
    rebuild: false,
  },
  public_net: {
    floating_ips: [],
    ipv4: null,
    ipv6: null,
    firewalls: undefined,
  },
  rescue_enabled: false,
  server_type: {
    cores: 0,
    cpu_type: HCPUType.SHARED,
    deprecated: false,
    description: "",
    disk: 0,
    id: 0,
    memory: 0,
    name: "",
    prices: [],
    storage_type: HStorageType.LOCAL,
  },
  status: HServerStatus.RUNNING,
  volumes: undefined,
};