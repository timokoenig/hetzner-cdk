import { AxiosResponse } from "axios";
import {
  HServer,
  ServerCreateRequest,
  ServerCreateResponse,
  ServerDeleteRequest,
  ServerDeleteResponse,
  ServerGetAllRequest,
  ServerGetAllResponse,
  ServerGetRequest,
  ServerGetResponse,
  ServerUpdateRequest,
  ServerUpdateResponse,
} from "./types/server";
import client from "./client";
import { HServerMock } from "./mocks/server";
import { ICDK } from "../cdk/cdk";
import { Operation, ResourceType } from "../cdk/classes/resource";
import { HActionMock } from "./mocks/action";

// Cloud API - Servers
// https://docs.hetzner.cloud/#servers

export interface IServerAPI {
  getAllServers(params?: ServerGetAllRequest): Promise<HServer[]>;
  createServer(params: ServerCreateRequest): Promise<ServerCreateResponse>;
  deleteServer(params: ServerDeleteRequest): Promise<ServerDeleteResponse>;
  getServer(params: ServerGetRequest): Promise<ServerGetResponse>;
  updateServer(params: ServerUpdateRequest): Promise<ServerUpdateResponse>;
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

  async deleteServer(
    params: ServerDeleteRequest
  ): Promise<ServerDeleteResponse> {
    const res: AxiosResponse<ServerDeleteResponse> = await client.delete(
      `/servers/${params.id}`
    );
    return res.data;
  }

  async getServer(params: ServerGetRequest): Promise<ServerGetResponse> {
    const res: AxiosResponse<ServerGetResponse> = await client.get(
      `/servers/${params.id}`
    );
    return res.data;
  }

  async updateServer(
    params: ServerUpdateRequest
  ): Promise<ServerUpdateResponse> {
    const res: AxiosResponse<ServerUpdateResponse> = await client.put(
      `/servers/${params.id}`,
      params
    );
    return res.data;
  }
}
