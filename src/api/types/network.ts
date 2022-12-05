import { HFirewall } from "./firewall";

export type HDNSEntry = {
  blocked: boolean;
  dns_ptr: string;
  id?: number;
  ip: string;
};

export type HPublicNet = {
  firewalls?: HFirewall[];
  floating_ips: number[];
  ipv4: HDNSEntry | null;
  ipv6: HDNSEntry | null;
};

export type HPrivateNet = {
  alias_ips?: string[];
  id?: string;
  mac_address?: string;
  network?: number;
};
