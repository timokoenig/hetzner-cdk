import {
  HPrimaryIP,
  PrimaryIPCreateRequest,
  PrimaryIPCreateResponse,
  PrimaryIPGetAllRequest,
  PrimaryIPGetResponse,
  PrimaryIPProtectionRequest,
  PrimaryIPProtectionResponse,
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

  async deletePrimaryIP(id: number): Promise<void> {
    const res = await this._serverApi.getPrimaryIP(id);
    if (res.primary_ip.protection.delete) {
      // Primary IP is protected
      return;
    }
    this._cdk.changeset.push({
      operation: Operation.DELETE,
      type: ResourceType.PrimaryIP,
      id: res.primary_ip.name,
    });
  }

  async getPrimaryIP(id: number): Promise<PrimaryIPGetResponse> {
    try {
      return await this._serverApi.getPrimaryIP(id);
    } catch {
      return { primary_ip: HPrimaryIPMock };
    }
  }

  async updatePrimaryIP(
    id: number,
    params: PrimaryIPUpdateRequest
  ): Promise<PrimaryIPUpdateResponse> {
    const currentData = await this._serverApi.getPrimaryIP(id);
    let valueOld: string[] = [];
    let valueNew: string[] = [];
    if (params.name && currentData.primary_ip.name != params.name) {
      valueOld.push(`name: ${currentData.primary_ip.name}`);
      valueNew.push(`name: ${params.name}`);
    }
    if (
      params.auto_delete &&
      currentData.primary_ip.auto_delete != params.auto_delete
    ) {
      valueOld.push(`auto_delete: ${currentData.primary_ip.auto_delete}`);
      valueNew.push(`description: ${params.auto_delete}`);
    }
    if (
      params.labels &&
      JSON.stringify(currentData.primary_ip.labels) !=
        JSON.stringify(params.labels)
    ) {
      valueOld.push(`labels: ${JSON.stringify(currentData.primary_ip.labels)}`);
      valueNew.push(`labels: ${JSON.stringify(params.labels)}`);
    }

    if (valueOld.length > 0) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.PrimaryIP,
        id: currentData.primary_ip.name,
        value_old: valueOld.join("\n"),
        value_new: valueNew.join("\n"),
      });
    }

    return {
      primary_ip: HPrimaryIPMock,
    };
  }

  async changeProtection(
    id: number,
    params: PrimaryIPProtectionRequest
  ): Promise<PrimaryIPProtectionResponse> {
    const currentData = await this._serverApi.getPrimaryIP(id);
    if (currentData.primary_ip.protection.delete != params.delete) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.PrimaryIP,
        id: currentData.primary_ip.name,
        value_old: `protection: ${currentData.primary_ip.protection.delete}`,
        value_new: `protection: ${params.delete}`,
      });
    }

    return {
      action: HActionMock,
    };
  }
}
