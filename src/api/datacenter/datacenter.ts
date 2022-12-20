import { AxiosResponse } from "axios";
import client from "../client";
import {
  DatacenterGetAllRequest,
  DatacenterGetAllResponse,
} from "../types/datacenter";

// Cloud API - Datacenters
// https://docs.hetzner.cloud/#datacenters

export async function getAllDatacenters(
  params?: DatacenterGetAllRequest
): Promise<DatacenterGetAllResponse> {
  const res: AxiosResponse<DatacenterGetAllResponse> = await client.get(
    "/datacenters",
    { params }
  );
  return res.data;
}
