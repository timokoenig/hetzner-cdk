import { AxiosResponse } from "axios";
import client from "./client";
import {
  PrimaryIPCreateRequest,
  PrimaryIPCreateResponse,
  PrimaryIPDeleteRequest,
  PrimaryIPGetAllRequest,
  PrimaryIPGetAllResponse,
  PrimaryIPGetRequest,
  PrimaryIPGetResponse,
  PrimaryIPUpdateRequest,
  PrimaryIPUpdateResponse,
  HPrimaryIP,
} from "./types/primaryip";

// Cloud API - Primary IP
// https://docs.hetzner.cloud/#primary-ips

export interface IPrimaryIPAPI {
  getAllPrimaryIPs(params?: PrimaryIPGetAllRequest): Promise<HPrimaryIP[]>;
  createPrimaryIP(
    params: PrimaryIPCreateRequest
  ): Promise<PrimaryIPCreateResponse>;
  deletePrimaryIP(params: PrimaryIPDeleteRequest): Promise<void>;
  getPrimaryIP(params: PrimaryIPGetRequest): Promise<PrimaryIPGetResponse>;
  updatePrimaryIP(
    params: PrimaryIPUpdateRequest
  ): Promise<PrimaryIPUpdateResponse>;
}

export class PrimaryIPAPI implements IPrimaryIPAPI {
  async getAllPrimaryIPs(
    params?: PrimaryIPGetAllRequest
  ): Promise<HPrimaryIP[]> {
    const res: AxiosResponse<PrimaryIPGetAllResponse> = await client.get(
      "/primary_ips",
      { params }
    );
    if (Array.isArray(res.data.primary_ips)) {
      return res.data.primary_ips;
    }
    return [res.data.primary_ips];
  }

  async createPrimaryIP(
    params: PrimaryIPCreateRequest
  ): Promise<PrimaryIPCreateResponse> {
    const res: AxiosResponse<PrimaryIPCreateResponse> = await client.post(
      "/primary_ips",
      params
    );
    return res.data;
  }

  async deletePrimaryIP(params: PrimaryIPDeleteRequest): Promise<void> {
    await client.delete(`/primary_ips/${params.id}`);
  }

  async getPrimaryIP(
    params: PrimaryIPGetRequest
  ): Promise<PrimaryIPGetResponse> {
    const res: AxiosResponse<PrimaryIPGetResponse> = await client.get(
      `/primary_ips/${params.id}`
    );
    return res.data;
  }

  async updatePrimaryIP(
    params: PrimaryIPUpdateRequest
  ): Promise<PrimaryIPUpdateResponse> {
    const res: AxiosResponse<PrimaryIPUpdateResponse> = await client.put(
      `/primary_ips/${params.id}`,
      params
    );
    return res.data;
  }
}
