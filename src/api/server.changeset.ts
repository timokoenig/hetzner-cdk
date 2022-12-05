import {
  HServer,
  ServerCreateRequest,
  ServerCreateResponse,
  ServerDeleteRequest,
  ServerDeleteResponse,
  ServerGetAllRequest,
  ServerGetRequest,
  ServerGetResponse,
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

  async deleteServer(
    params: ServerDeleteRequest
  ): Promise<ServerDeleteResponse> {
    const res = await this._serverApi.getServer({ id: params.id });
    this._cdk.changeset.push({
      operation: Operation.DELETE,
      type: ResourceType.SERVER,
      id: res.server.name,
    });
    return { action: HActionMock };
  }

  async getServer(params: ServerGetRequest): Promise<ServerGetResponse> {
    return this._serverApi.getServer(params);
  }

  async updateServer(
    params: ServerUpdateRequest
  ): Promise<ServerUpdateResponse> {
    const res = await this._serverApi.getServer({ id: params.id });
    this._cdk.changeset.push({
      operation: Operation.MODIFY,
      type: ResourceType.SERVER,
      id: res.server.name,
      value_old: "placeholder for old values",
      value_new: "placeholder for new values",
    });
    return {
      server: HServerMock,
    };
  }
}
