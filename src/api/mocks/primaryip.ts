import { HAssigneeType, HPrimaryIP } from "../types/primaryip";
import { HDatacenterMock } from "./datacenter";
import { HIPType } from "../types/floatingip";

export const HPrimaryIPMock: HPrimaryIP = {
  assignee_ip: null,
  assignee_type: HAssigneeType.SERVER,
  auto_delete: false,
  blocked: false,
  created: "",
  datacenter: HDatacenterMock,
  dns_ptr: [],
  id: 1,
  ip: "0.0.0.0",
  labels: {},
  name: "",
  protection: {
    delete: false,
  },
  type: HIPType.IPV4,
};
