import { AxiosResponse } from "axios";
import {
  HServer,
  ServerCreateRequest,
  ServerCreateResponse,
  ServerDeleteResponse,
  ServerGetAllRequest,
  ServerGetAllResponse,
  ServerGetResponse,
  ServerUpdateRequest,
  ServerUpdateResponse,
} from "./types/server";
import client from "./client";
import chalk = require("chalk");

// Cloud API - Servers
// https://docs.hetzner.cloud/#servers

export interface IServerAPI {
  getAllServers(params?: ServerGetAllRequest): Promise<HServer[]>;
  createServer(params: ServerCreateRequest): Promise<ServerCreateResponse>;
  deleteServer(id: number): Promise<ServerDeleteResponse>;
  getServer(id: number): Promise<ServerGetResponse>;
  updateServer(
    id: number,
    params: ServerUpdateRequest
  ): Promise<ServerUpdateResponse>;
}

export class ServerAPI implements IServerAPI {
  async getAllServers(params?: ServerGetAllRequest): Promise<HServer[]> {
    const res: AxiosResponse<ServerGetAllResponse> = await client.get(
      "/servers",
      { params }
    );
    return res.data.servers;
  }

  async createServer(
    params: ServerCreateRequest
  ): Promise<ServerCreateResponse> {
    const res: AxiosResponse<ServerCreateResponse> = await client.post(
      "/servers",
      params
    );
    return res.data;
  }

  async deleteServer(id: number): Promise<ServerDeleteResponse> {
    const res: AxiosResponse<ServerDeleteResponse> = await client.delete(
      `/servers/${id}`
    );
    return res.data;
  }

  async getServer(id: number): Promise<ServerGetResponse> {
    const res: AxiosResponse<ServerGetResponse> = await client.get(
      `/servers/${id}`
    );
    return res.data;
  }

  async updateServer(
    id: number,
    params: ServerUpdateRequest
  ): Promise<ServerUpdateResponse> {
    const currentData = await this.getServer(id);
    if (
      (!params.name || currentData.server.name == params.name) &&
      (!params.labels || currentData.server.labels == params.labels)
    ) {
      console.log(chalk.gray("[Server] Nothing to update"));
      return currentData;
    }

    const res: AxiosResponse<ServerUpdateResponse> = await client.put(
      `/servers/${id}`,
      params
    );
    return res.data;
  }
}
