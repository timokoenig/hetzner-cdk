import { AxiosResponse } from "axios";
import chalk from "chalk";
import client from "./client";
import { HAction } from "./types/action";
import {
  FloatingIPCreateRequest,
  FloatingIPCreateResponse,
  FloatingIPDeleteResponse,
  FloatingIPGetAllRequest,
  FloatingIPGetAllResponse,
  FloatingIPGetResponse,
  FloatingIPProtectionRequest,
  FloatingIPProtectionResponse,
  FloatingIPUpdateRequest,
  FloatingIPUpdateResponse,
  HFloatingIP,
} from "./types/floatingip";

// Cloud API - Floating IP
// https://docs.hetzner.cloud/#floating-ips

export interface IFloatingIPAPI {
  getAllFloatingIPs(params?: FloatingIPGetAllRequest): Promise<HFloatingIP[]>;
  createFloatingIP(params: FloatingIPCreateRequest): Promise<HFloatingIP>;
  deleteFloatingIP(id: number): Promise<HFloatingIP | null>;
  getFloatingIP(id: number): Promise<HFloatingIP>;
  updateFloatingIP(
    id: number,
    params: FloatingIPUpdateRequest
  ): Promise<HFloatingIP>;
  changeProtection(
    id: number,
    params: FloatingIPProtectionRequest
  ): Promise<HAction>;
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
  ): Promise<HFloatingIP> {
    const res: AxiosResponse<FloatingIPCreateResponse> = await client.post(
      "/floating_ips",
      params
    );
    return res.data.floating_ip;
  }

  async deleteFloatingIP(id: number): Promise<HFloatingIP | null> {
    const obj = await this.getFloatingIP(id);
    if (obj.protection.delete) {
      // Floating IP is protected
      return null;
    }
    const res: AxiosResponse<FloatingIPDeleteResponse> = await client.delete(
      `/floating_ips/${id}`
    );
    return res.data.floating_ip;
  }

  async getFloatingIP(id: number): Promise<HFloatingIP> {
    const res: AxiosResponse<FloatingIPGetResponse> = await client.get(
      `/floating_ips/${id}`
    );
    return res.data.floating_ip;
  }

  async updateFloatingIP(
    id: number,
    params: FloatingIPUpdateRequest
  ): Promise<HFloatingIP> {
    const currentData = await this.getFloatingIP(id);
    if (
      (!params.name || currentData.name == params.name) &&
      (!params.description || currentData.description == params.description) &&
      (!params.labels || currentData.labels == params.labels)
    ) {
      console.log(chalk.gray("[FloatingIP] Nothing to update"));
      return currentData;
    }

    const res: AxiosResponse<FloatingIPUpdateResponse> = await client.put(
      `/floating_ips/${id}`,
      params
    );
    return res.data.floating_ip;
  }

  async changeProtection(
    id: number,
    params: FloatingIPProtectionRequest
  ): Promise<HAction> {
    const res: AxiosResponse<FloatingIPProtectionResponse> = await client.post(
      `/floating_ips/${id}/actions/change_protection`,
      params
    );
    return res.data.action;
  }
}
