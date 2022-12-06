import { AxiosResponse } from "axios";
import client from "./client";
import {
  FloatingIPCreateRequest,
  FloatingIPCreateResponse,
  FloatingIPDeleteRequest,
  FloatingIPDeleteResponse,
  FloatingIPGetAllRequest,
  FloatingIPGetAllResponse,
  FloatingIPGetRequest,
  FloatingIPGetResponse,
  FloatingIPUpdateRequest,
  FloatingIPUpdateResponse,
  HFloatingIP,
} from "./types/floatingip";

// Cloud API - Floating IP
// https://docs.hetzner.cloud/#floating-ips

export interface IFloatingIPAPI {
  getAllFloatingIPs(params?: FloatingIPGetAllRequest): Promise<HFloatingIP[]>;
  createFloatingIP(
    params: FloatingIPCreateRequest
  ): Promise<FloatingIPCreateResponse>;
  deleteFloatingIP(
    params: FloatingIPDeleteRequest
  ): Promise<FloatingIPDeleteResponse>;
  getFloatingIP(params: FloatingIPGetRequest): Promise<FloatingIPGetResponse>;
  updateFloatingIP(
    params: FloatingIPUpdateRequest
  ): Promise<FloatingIPUpdateResponse>;
}

export class FloatingIPAPI implements IFloatingIPAPI {
  async getAllFloatingIPs(
    params?: FloatingIPGetAllRequest
  ): Promise<HFloatingIP[]> {
    const res: AxiosResponse<FloatingIPGetAllResponse> = await client.get(
      "/floating_ips",
      { params }
    );
    if (Array.isArray(res.data.floating_ips)) {
      return res.data.floating_ips;
    }
    return [res.data.floating_ips];
  }

  async createFloatingIP(
    params: FloatingIPCreateRequest
  ): Promise<FloatingIPCreateResponse> {
    const res: AxiosResponse<FloatingIPCreateResponse> = await client.post(
      "/floating_ips",
      params
    );
    return res.data;
  }

  async deleteFloatingIP(
    params: FloatingIPDeleteRequest
  ): Promise<FloatingIPDeleteResponse> {
    const res: AxiosResponse<FloatingIPDeleteResponse> = await client.delete(
      `/floating_ips/${params.id}`
    );
    return res.data;
  }

  async getFloatingIP(
    params: FloatingIPGetRequest
  ): Promise<FloatingIPGetResponse> {
    const res: AxiosResponse<FloatingIPGetResponse> = await client.get(
      `/floating_ips/${params.id}`
    );
    return res.data;
  }

  async updateFloatingIP(
    params: FloatingIPUpdateRequest
  ): Promise<FloatingIPUpdateResponse> {
    const res: AxiosResponse<FloatingIPUpdateResponse> = await client.put(
      `/floating_ips/${params.id}`,
      params
    );
    return res.data;
  }
}
