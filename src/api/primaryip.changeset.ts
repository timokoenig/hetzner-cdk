import {
  HPrimaryIP,
  PrimaryIPCreateRequest,
  PrimaryIPCreateResponse,
  PrimaryIPDeleteRequest,
  PrimaryIPGetAllRequest,
  PrimaryIPGetRequest,
  PrimaryIPGetResponse,
  PrimaryIPUpdateRequest,
  PrimaryIPUpdateResponse,
} from "./types/primaryip";
import { HPrimaryIPMock } from "./mocks/primaryip";
import { ICDK } from "../cdk/cdk";
import { Operation, ResourceType } from "../cdk/classes/resource";
import { HActionMock } from "./mocks/action";
import { IPrimaryIPAPI } from "./primaryip";

export class PrimaryIPAPIChangeset implements IPrimaryIPAPI {
  private _cdk: ICDK;
  private _serverApi: IPrimaryIPAPI;

  constructor(cdk: ICDK, serverApi: IPrimaryIPAPI) {
    this._cdk = cdk;
    this._serverApi = serverApi;
  }

  async getAllPrimaryIPs(
    params?: PrimaryIPGetAllRequest
  ): Promise<HPrimaryIP[]> {
    return this._serverApi.getAllPrimaryIPs(params);
  }

  async createPrimaryIP(
    params: PrimaryIPCreateRequest
  ): Promise<PrimaryIPCreateResponse> {
    this._cdk.changeset.push({
      operation: Operation.ADD,
      type: ResourceType.PrimaryIP,
      id: params.name,
    });
    return {
      action: HActionMock,
      primary_ip: HPrimaryIPMock,
    };
  }

  async deletePrimaryIP(params: PrimaryIPDeleteRequest): Promise<void> {
    const res = await this._serverApi.getPrimaryIP({ id: params.id });
    this._cdk.changeset.push({
      operation: Operation.DELETE,
      type: ResourceType.PrimaryIP,
      id: res.primary_ip.name,
    });
  }

  async getPrimaryIP(
    params: PrimaryIPGetRequest
  ): Promise<PrimaryIPGetResponse> {
    try {
      return await this._serverApi.getPrimaryIP(params);
    } catch {
      return { primary_ip: HPrimaryIPMock };
    }
  }

  async updatePrimaryIP(
    params: PrimaryIPUpdateRequest
  ): Promise<PrimaryIPUpdateResponse> {
    const res = await this._serverApi.getPrimaryIP({ id: params.id });
    this._cdk.changeset.push({
      operation: Operation.MODIFY,
      type: ResourceType.PrimaryIP,
      id: res.primary_ip.name,
      value_old: "placeholder for old values",
      value_new: "placeholder for new values",
    });
    return {
      primary_id: HPrimaryIPMock,
    };
  }
}
