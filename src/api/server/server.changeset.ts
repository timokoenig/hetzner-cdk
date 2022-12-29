import { ICDK } from "../../cdk/cdk";
import { Operation, ResourceType } from "../../cdk/resource/resource";
import { HAction } from "../types/action";
import {
  HServer,
  ServerCreateRequest,
  ServerGetAllRequest,
  ServerProtectionRequest,
  ServerUpdateRequest,
} from "../types/server";
import { HActionMock } from "../types/__mocks__/action-mock";
import { HServerMock } from "../types/__mocks__/server-mock";
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

  async createServer(params: ServerCreateRequest): Promise<HServer> {
    this._cdk.changeset.push({
      operation: Operation.ADD,
      type: ResourceType.SERVER,
      id: params.name,
    });
    return HServerMock;
  }

  async deleteServer(id: number): Promise<boolean> {
    const res = await this._serverApi.getServer(id);
    if (res.protection.delete) {
      // Server is protected
      return false;
    }
    this._cdk.changeset.push({
      operation: Operation.DELETE,
      type: ResourceType.SERVER,
      id: res.name,
    });
    return true;
  }

  async getServer(id: number): Promise<HServer> {
    try {
      return await this._serverApi.getServer(id);
    } catch {
      return HServerMock;
    }
  }

  async updateServer(id: number, params: ServerUpdateRequest): Promise<HServer> {
    const currentData = await this._serverApi.getServer(id);
    let valueOld: string[] = [];
    let valueNew: string[] = [];
    if (params.name && currentData.name != params.name) {
      valueOld.push(`name: ${currentData.name}`);
      valueNew.push(`name: ${params.name}`);
    }
    if (params.labels && JSON.stringify(currentData.labels) != JSON.stringify(params.labels)) {
      valueOld.push(`labels: ${JSON.stringify(currentData.labels)}`);
      valueNew.push(`labels: ${JSON.stringify(params.labels)}`);
    }

    if (valueOld.length > 0) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.SERVER,
        id: currentData.name,
        value_old: valueOld.join("\n"),
        value_new: valueNew.join("\n"),
      });
    }

    return HServerMock;
  }

  async changeProtection(id: number, params: ServerProtectionRequest): Promise<HAction> {
    const currentData = await this._serverApi.getServer(id);
    if (currentData.protection.delete != params.delete) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.SERVER,
        id: currentData.name,
        value_old: `protection: ${currentData.protection.delete}`,
        value_new: `protection: ${params.delete}`,
      });
    }

    return HActionMock;
  }
}
