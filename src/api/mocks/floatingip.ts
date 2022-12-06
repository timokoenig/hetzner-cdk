import { HFloatingIP, HIPType } from "../types/floatingip";
import { HLocationMock } from "./location";

export const HFloatingIPMock: HFloatingIP = {
  blocked: false,
  created: "",
  description: null,
  dns_ptr: {
    ip: "0.0.0.0",
    dns_ptr: "",
  },
  home_location: HLocationMock,
  id: 1,
  ip: "0.0.0.0",
  labels: {},
  name: "",
  protection: {
    delete: false,
  },
  server: null,
  type: HIPType.IPV4,
};
