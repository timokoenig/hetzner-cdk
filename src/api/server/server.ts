import { AxiosResponse } from "axios";
import chalk from "chalk";
import client from "../client";
import { HAction } from "../types/action";
import {
  HServer,
  ServerCreateRequest,
  ServerCreateResponse,
  ServerGetAllRequest,
  ServerGetAllResponse,
  ServerGetResponse,
  ServerProtectionRequest,
  ServerProtectionResponse,
  ServerUpdateRequest,
  ServerUpdateResponse,
} from "../types/server";

// Cloud API - Servers
// https://docs.hetzner.cloud/#servers

export interface IServerAPI {
  getAllServers(params?: ServerGetAllRequest): Promise<HServer[]>;
  createServer(params: ServerCreateRequest): Promise<HServer>;
  deleteServer(id: number): Promise<boolean>;
  getServer(id: number): Promise<HServer>;
  updateServer(id: number, params: ServerUpdateRequest): Promise<HServer>;
  changeProtection(
    id: number,
    params: ServerProtectionRequest
  ): Promise<HAction>;
}

export class ServerAPI implements IServerAPI {
  async getAllServers(params?: ServerGetAllRequest): Promise<HServer[]> {
    const res: AxiosResponse<ServerGetAllResponse> = await client.get(
      "/servers",
      { params }
    );
    return res.data.servers;
  }

  async createServer(params: ServerCreateRequest): Promise<HServer> {
    const res: AxiosResponse<ServerCreateResponse> = await client.post(
      "/servers",
      params
    );
    return res.data.server;
  }

  async deleteServer(id: number): Promise<boolean> {
    const obj = await this.getServer(id);
    if (obj.protection.delete) {
      // Server is protected
      return false;
    }
    await client.delete(`/servers/${id}`);
    return true;
  }

  async getServer(id: number): Promise<HServer> {
    const res: AxiosResponse<ServerGetResponse> = await client.get(
      `/servers/${id}`
    );
    return res.data.server;
  }

  async updateServer(
    id: number,
    params: ServerUpdateRequest
  ): Promise<HServer> {
    const currentData = await this.getServer(id);
    if (
      (!params.name || currentData.name == params.name) &&
      (!params.labels || currentData.labels == params.labels)
    ) {
      console.log(chalk.gray("[Server] Nothing to update"));
      return currentData;
    }

    const res: AxiosResponse<ServerUpdateResponse> = await client.put(
      `/servers/${id}`,
      params
    );
    return res.data.server;
  }

  async changeProtection(
    id: number,
    params: ServerProtectionRequest
  ): Promise<HAction> {
    const res: AxiosResponse<ServerProtectionResponse> = await client.post(
      `/servers/${id}/actions/change_protection`,
      params
    );
    return res.data.action;
  }
}
