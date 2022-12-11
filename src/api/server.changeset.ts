import {
  HServer,
  ServerCreateRequest,
  ServerCreateResponse,
  ServerDeleteResponse,
  ServerGetAllRequest,
  ServerGetResponse,
  ServerProtectionRequest,
  ServerProtectionResponse,
  ServerUpdateRequest,
  ServerUpdateResponse,
} from "./types/server";
import { HServerMock } from "./mocks/server";
import { ICDK } from "../cdk/cdk";
import { Operation, ResourceType } from "../cdk/classes/resource";
import { HActionMock } from "./mocks/action";
import { IServerAPI } from "./server";

export class ServerAPIChangeset implements IServerAPI {
  private _cdk: ICDK;
  private _serverApi: IServerAPI;

  constructor(cdk: ICDK, serverApi: IServerAPI) {
    this._cdk = cdk;
    this._serverApi = serverApi;
  }

  async getAllServers(params?: ServerGetAllRequest): Promise<HServer[]> {
    return this._serverApi.getAllServers(params);
  }

  async createServer(
    params: ServerCreateRequest
  ): Promise<ServerCreateResponse> {
    this._cdk.changeset.push({
      operation: Operation.ADD,
      type: ResourceType.SERVER,
      id: params.name,
    });
    return {
      action: HActionMock,
      next_action: [],
      root_password: null,
      server: HServerMock,
    };
  }

  async deleteServer(id: number): Promise<ServerDeleteResponse | null> {
    const res = await this._serverApi.getServer(id);
    if (res.server.protection.delete) {
      // Server is protected
      return null;
    }
    this._cdk.changeset.push({
      operation: Operation.DELETE,
      type: ResourceType.SERVER,
      id: res.server.name,
    });
    return { action: HActionMock };
  }

  async getServer(id: number): Promise<ServerGetResponse> {
    try {
      return this._serverApi.getServer(id);
    } catch {
      return { server: HServerMock };
    }
  }

  async updateServer(
    id: number,
    params: ServerUpdateRequest
  ): Promise<ServerUpdateResponse> {
    const currentData = await this._serverApi.getServer(id);
    let valueOld: string[] = [];
    let valueNew: string[] = [];
    if (params.name && currentData.server.name != params.name) {
      valueOld.push(`name: ${currentData.server.name}`);
      valueNew.push(`name: ${params.name}`);
    }
    if (
      params.labels &&
      JSON.stringify(currentData.server.labels) != JSON.stringify(params.labels)
    ) {
      valueOld.push(`labels: ${JSON.stringify(currentData.server.labels)}`);
      valueNew.push(`labels: ${JSON.stringify(params.labels)}`);
    }

    if (valueOld.length > 0) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.SERVER,
        id: currentData.server.name,
        value_old: valueOld.join("\n"),
        value_new: valueNew.join("\n"),
      });
    }

    return {
      server: HServerMock,
    };
  }

  async changeProtection(
    id: number,
    params: ServerProtectionRequest
  ): Promise<ServerProtectionResponse> {
    const currentData = await this._serverApi.getServer(id);
    if (currentData.server.protection.delete != params.delete) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.SERVER,
        id: currentData.server.name,
        value_old: `protection: ${currentData.server.protection.delete}`,
        value_new: `protection: ${params.delete}`,
      });
    }

    return {
      action: HActionMock,
    };
  }
}
