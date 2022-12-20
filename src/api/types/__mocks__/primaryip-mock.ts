import { HIPType } from "../floatingip";
import { HAssigneeType, HPrimaryIP } from "../primaryip";
import { HDatacenterMock } from "./datacenter-mock";

export const HPrimaryIPMock: HPrimaryIP = {
  assignee_ip: null,
  assignee_type: HAssigneeType.SERVER,
  auto_delete: false,
  blocked: false,
  created: "",
  datacenter: HDatacenterMock,
  dns_ptr: [],
  id: 0,
  ip: "0.0.0.0",
  labels: {},
  name: "space-ip",
  protection: {
    delete: false,
  },
  type: HIPType.IPV4,
};
