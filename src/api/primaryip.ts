import { AxiosResponse } from "axios";
import chalk from "chalk";
import client from "./client";
import { HAction } from "./types/action";
import {
  HPrimaryIP,
  PrimaryIPCreateRequest,
  PrimaryIPCreateResponse,
  PrimaryIPGetAllRequest,
  PrimaryIPGetAllResponse,
  PrimaryIPGetResponse,
  PrimaryIPProtectionRequest,
  PrimaryIPProtectionResponse,
  PrimaryIPUpdateRequest,
  PrimaryIPUpdateResponse,
} from "./types/primaryip";

// Cloud API - Primary IP
// https://docs.hetzner.cloud/#primary-ips

export interface IPrimaryIPAPI {
  getAllPrimaryIPs(params?: PrimaryIPGetAllRequest): Promise<HPrimaryIP[]>;
  createPrimaryIP(params: PrimaryIPCreateRequest): Promise<HPrimaryIP>;
  deletePrimaryIP(id: number): Promise<boolean>;
  getPrimaryIP(id: number): Promise<HPrimaryIP>;
  updatePrimaryIP(
    id: number,
    params: PrimaryIPUpdateRequest
  ): Promise<HPrimaryIP>;
  changeProtection(
    id: number,
    params: PrimaryIPProtectionRequest
  ): Promise<HAction>;
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

  async createPrimaryIP(params: PrimaryIPCreateRequest): Promise<HPrimaryIP> {
    const res: AxiosResponse<PrimaryIPCreateResponse> = await client.post(
      "/primary_ips",
      params
    );
    return res.data.primary_ip;
  }

  async deletePrimaryIP(id: number): Promise<boolean> {
    const res = await this.getPrimaryIP(id);
    if (res.protection.delete) {
      // Primary IP is protected
      return false;
    }
    await client.delete(`/primary_ips/${id}`);
    return true;
  }

  async getPrimaryIP(id: number): Promise<HPrimaryIP> {
    const res: AxiosResponse<PrimaryIPGetResponse> = await client.get(
      `/primary_ips/${id}`
    );
    return res.data.primary_ip;
  }

  async updatePrimaryIP(
    id: number,
    params: PrimaryIPUpdateRequest
  ): Promise<HPrimaryIP> {
    const currentData = await this.getPrimaryIP(id);
    if (
      (!params.name || currentData.name == params.name) &&
      (!params.auto_delete || currentData.auto_delete == params.auto_delete) &&
      (!params.labels || currentData.labels == params.labels)
    ) {
      console.log(chalk.gray("[PrimaryIPs] Nothing to update"));
      return currentData;
    }

    const res: AxiosResponse<PrimaryIPUpdateResponse> = await client.put(
      `/primary_ips/${id}`,
      params
    );
    return res.data.primary_ip;
  }

  async changeProtection(
    id: number,
    params: PrimaryIPProtectionRequest
  ): Promise<HAction> {
    const res: AxiosResponse<PrimaryIPProtectionResponse> = await client.post(
      `/primary_ips/${id}/actions/change_protection`,
      params
    );
    return res.data.action;
  }
}
