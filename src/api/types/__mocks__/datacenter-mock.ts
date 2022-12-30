import { HDatacenter } from "../datacenter";
import { HLocationMock } from "./location-mock";

export const HDatacenterMock: HDatacenter = {
  description: "Falkenstein",
  id: 1,
  location: HLocationMock,
  name: "Falkenstein",
  server_types: {
    available: [],
    available_for_migration: [],
    supported: [],
  },
};
