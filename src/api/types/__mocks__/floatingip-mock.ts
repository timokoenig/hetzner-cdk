import { HFloatingIP, HIPType } from "../floatingip";
import { HLocationMock } from "./location-mock";

export const HFloatingIPMock: HFloatingIP = {
  blocked: false,
  created: "",
  description: null,
  dns_ptr: {
    ip: "0.0.0.0",
    dns_ptr: "",
  },
  home_location: HLocationMock,
  id: 0,
  ip: "0.0.0.0",
  labels: {},
  name: "space-ip",
  protection: {
    delete: false,
  },
  server: null,
  type: HIPType.IPV4,
};
