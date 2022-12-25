import { ICDK } from "../../cdk/cdk";
import { Operation, ResourceType } from "../../cdk/classes/resource";
import { HAction } from "../types/action";
import {
  HPrimaryIP,
  PrimaryIPCreateRequest,
  PrimaryIPGetAllRequest,
  PrimaryIPProtectionRequest,
  PrimaryIPUpdateRequest,
} from "../types/primaryip";
import { HActionMock } from "../types/__mocks__/action-mock";
import { HPrimaryIPMock } from "../types/__mocks__/primaryip-mock";
import { IPrimaryIPAPI } from "./primaryip";

export class PrimaryIPAPIChangeset implements IPrimaryIPAPI {
  private _cdk: ICDK;
  private _serverApi: IPrimaryIPAPI;

  constructor(cdk: ICDK, serverApi: IPrimaryIPAPI) {
    this._cdk = cdk;
    this._serverApi = serverApi;
  }

  async getAllPrimaryIPs(params?: PrimaryIPGetAllRequest): Promise<HPrimaryIP[]> {
    return this._serverApi.getAllPrimaryIPs(params);
  }

  async createPrimaryIP(params: PrimaryIPCreateRequest): Promise<HPrimaryIP> {
    this._cdk.changeset.push({
      operation: Operation.ADD,
      type: ResourceType.PRIMARYIP,
      id: params.name,
    });
    return HPrimaryIPMock;
  }

  async deletePrimaryIP(id: number): Promise<boolean> {
    const res = await this._serverApi.getPrimaryIP(id);
    if (res.protection.delete) {
      // Primary IP is protected
      return false;
    }
    this._cdk.changeset.push({
      operation: Operation.DELETE,
      type: ResourceType.PRIMARYIP,
      id: res.name,
    });
    return true;
  }

  async getPrimaryIP(id: number): Promise<HPrimaryIP> {
    try {
      return await this._serverApi.getPrimaryIP(id);
    } catch {
      return HPrimaryIPMock;
    }
  }

  async updatePrimaryIP(id: number, params: PrimaryIPUpdateRequest): Promise<HPrimaryIP> {
    const currentData = await this._serverApi.getPrimaryIP(id);
    let valueOld: string[] = [];
    let valueNew: string[] = [];
    if (params.name && currentData.name != params.name) {
      valueOld.push(`name: ${currentData.name}`);
      valueNew.push(`name: ${params.name}`);
    }
    if (params.auto_delete && currentData.auto_delete != params.auto_delete) {
      valueOld.push(`auto_delete: ${currentData.auto_delete}`);
      valueNew.push(`auto_delete: ${params.auto_delete}`);
    }
    if (params.labels && JSON.stringify(currentData.labels) != JSON.stringify(params.labels)) {
      valueOld.push(`labels: ${JSON.stringify(currentData.labels)}`);
      valueNew.push(`labels: ${JSON.stringify(params.labels)}`);
    }

    if (valueOld.length > 0) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.PRIMARYIP,
        id: currentData.name,
        value_old: valueOld.join("\n"),
        value_new: valueNew.join("\n"),
      });
    }

    return HPrimaryIPMock;
  }

  async changeProtection(id: number, params: PrimaryIPProtectionRequest): Promise<HAction> {
    const currentData = await this._serverApi.getPrimaryIP(id);
    if (currentData.protection.delete != params.delete) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.PRIMARYIP,
        id: currentData.name,
        value_old: `protection: ${currentData.protection.delete}`,
        value_new: `protection: ${params.delete}`,
      });
    }

    return HActionMock;
  }
}
