import { HActionMock } from "../mocks/action";
import { HServerMock } from "../mocks/server";
import { IServerAPI } from "../server";
import { HAction } from "../types/action";
import {
  HServer,
  ServerCreateRequest,
  ServerGetAllRequest,
  ServerProtectionRequest,
  ServerUpdateRequest,
} from "../types/server";

export class ServerAPIMock implements IServerAPI {
  getAllServersResult: Promise<HServer[]> = Promise.resolve([]);
  async getAllServers(params?: ServerGetAllRequest): Promise<HServer[]> {
    return this.getAllServersResult;
  }

  createServerResult: Promise<HServer> = Promise.resolve(HServerMock);
  async createServer(params: ServerCreateRequest): Promise<HServer> {
    return this.createServerResult;
  }

  deleteServerResult: boolean = true;
  async deleteServer(id: number): Promise<boolean> {
    return this.deleteServerResult;
  }

  getServerResult: Promise<HServer> = Promise.resolve(HServerMock);
  async getServer(id: number): Promise<HServer> {
    return this.getServerResult;
  }

  updateServerResult: Promise<HServer> = Promise.resolve(HServerMock);
  async updateServer(
    id: number,
    params: ServerUpdateRequest
  ): Promise<HServer> {
    return this.updateServerResult;
  }

  changeProtectionResult: Promise<HAction> = Promise.resolve(HActionMock);
  async changeProtection(
    id: number,
    params: ServerProtectionRequest
  ): Promise<HAction> {
    return this.changeProtectionResult;
  }
}
