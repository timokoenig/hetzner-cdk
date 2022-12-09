import { AxiosResponse } from "axios";
import chalk = require("chalk");
import client from "./client";
import {
  FloatingIPCreateRequest,
  FloatingIPCreateResponse,
  FloatingIPDeleteResponse,
  FloatingIPGetAllRequest,
  FloatingIPGetAllResponse,
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
  deleteFloatingIP(id: number): Promise<FloatingIPDeleteResponse>;
  getFloatingIP(id: number): Promise<FloatingIPGetResponse>;
  updateFloatingIP(
    id: number,
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

  async deleteFloatingIP(id: number): Promise<FloatingIPDeleteResponse> {
    const res: AxiosResponse<FloatingIPDeleteResponse> = await client.delete(
      `/floating_ips/${id}`
    );
    return res.data;
  }

  async getFloatingIP(id: number): Promise<FloatingIPGetResponse> {
    const res: AxiosResponse<FloatingIPGetResponse> = await client.get(
      `/floating_ips/${id}`
    );
    return res.data;
  }

  async updateFloatingIP(
    id: number,
    params: FloatingIPUpdateRequest
  ): Promise<FloatingIPUpdateResponse> {
    const currentData = await this.getFloatingIP(id);
    if (
      (!params.name || currentData.floating_ip.name == params.name) &&
      (!params.description ||
        currentData.floating_ip.description == params.description) &&
      (!params.labels || currentData.floating_ip.labels == params.labels)
    ) {
      console.log(chalk.gray("[FloatingIP] Nothing to update"));
      return currentData;
    }

    const res: AxiosResponse<FloatingIPUpdateResponse> = await client.put(
      `/floating_ips/${id}`,
      params
    );
    return res.data;
  }
}
