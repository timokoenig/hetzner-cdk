import { AxiosResponse } from "axios";
import client from "./client";
import {
  PrimaryIPCreateRequest,
  PrimaryIPCreateResponse,
  PrimaryIPGetAllRequest,
  PrimaryIPGetAllResponse,
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
  deletePrimaryIP(id: number): Promise<void>;
  getPrimaryIP(id: number): Promise<PrimaryIPGetResponse>;
  updatePrimaryIP(
    id: number,
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

  async deletePrimaryIP(id: number): Promise<void> {
    await client.delete(`/primary_ips/${id}`);
  }

  async getPrimaryIP(id: number): Promise<PrimaryIPGetResponse> {
    const res: AxiosResponse<PrimaryIPGetResponse> = await client.get(
      `/primary_ips/${id}`
    );
    return res.data;
  }

  async updatePrimaryIP(
    id: number,
    params: PrimaryIPUpdateRequest
  ): Promise<PrimaryIPUpdateResponse> {
    const res: AxiosResponse<PrimaryIPUpdateResponse> = await client.put(
      `/primary_ips/${id}`,
      params
    );
    return res.data;
  }
}
