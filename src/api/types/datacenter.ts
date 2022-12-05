import { HLocation } from "./location";

export enum DATACENTER {
  NUREMBERG = "Nuremberg",
  FALKENSTEIN = "Falkenstein",
  HELSINKI = "Helsinki",
  ASHBURN = "Ashburn",
}

export type HServerTypes = {
  available: number[];
  available_for_migration: number[];
  supported: number[];
};

export type HDatacenter = {
  description: string;
  id: number;
  location: HLocation;
  name: string;
  server_types: HServerTypes;
};

// Get All Datacenters
export type DatacenterGetAllRequest = {
  name?: string;
};

export type DatacenterGetAllResponse = {
  datacenters: HDatacenter[];
  recommendation: number;
};
