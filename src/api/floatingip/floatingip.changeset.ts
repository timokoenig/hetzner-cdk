import { ICDK } from "../../cdk/cdk";
import { Operation, ResourceType } from "../../cdk/classes/resource";
import { HAction } from "../types/action";
import {
  FloatingIPCreateRequest,
  FloatingIPGetAllRequest,
  FloatingIPProtectionRequest,
  FloatingIPUpdateRequest,
  HFloatingIP,
} from "../types/floatingip";
import { HActionMock } from "../types/__mocks__/action-mock";
import { HFloatingIPMock } from "../types/__mocks__/floatingip-mock";
import { IFloatingIPAPI } from "./floatingip";

export class FloatingIPAPIChangeset implements IFloatingIPAPI {
  private _cdk: ICDK;
  private _serverApi: IFloatingIPAPI;

  constructor(cdk: ICDK, serverApi: IFloatingIPAPI) {
    this._cdk = cdk;
    this._serverApi = serverApi;
  }

  async getAllFloatingIPs(
    params?: FloatingIPGetAllRequest
  ): Promise<HFloatingIP[]> {
    return this._serverApi.getAllFloatingIPs(params);
  }

  async createFloatingIP(
    params: FloatingIPCreateRequest
  ): Promise<HFloatingIP> {
    this._cdk.changeset.push({
      operation: Operation.ADD,
      type: ResourceType.FLOATINGIP,
      id: params.name,
    });
    return HFloatingIPMock;
  }

  async deleteFloatingIP(id: number): Promise<boolean> {
    const res = await this._serverApi.getFloatingIP(id);
    if (res.protection.delete) {
      // Floating IP is protected
      return false;
    }
    this._cdk.changeset.push({
      operation: Operation.DELETE,
      type: ResourceType.FLOATINGIP,
      id: res.name,
    });
    return true;
  }

  async getFloatingIP(id: number): Promise<HFloatingIP> {
    try {
      return await this._serverApi.getFloatingIP(id);
    } catch {
      return HFloatingIPMock;
    }
  }

  async updateFloatingIP(
    id: number,
    params: FloatingIPUpdateRequest
  ): Promise<HFloatingIP> {
    const currentData = await this._serverApi.getFloatingIP(id);
    let valueOld: string[] = [];
    let valueNew: string[] = [];
    if (params.name && currentData.name != params.name) {
      valueOld.push(`name: ${currentData.name}`);
      valueNew.push(`name: ${params.name}`);
    }
    if (params.description && currentData.description != params.description) {
      valueOld.push(`description: ${currentData.description}`);
      valueNew.push(`description: ${params.description}`);
    }
    if (
      params.labels &&
      JSON.stringify(currentData.labels) != JSON.stringify(params.labels)
    ) {
      valueOld.push(`labels: ${JSON.stringify(currentData.labels)}`);
      valueNew.push(`labels: ${JSON.stringify(params.labels)}`);
    }

    if (valueOld.length > 0) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.FLOATINGIP,
        id: currentData.name,
        value_old: valueOld.join("/n"),
        value_new: valueNew.join("/n"),
      });
    }

    return HFloatingIPMock;
  }

  async changeProtection(
    id: number,
    params: FloatingIPProtectionRequest
  ): Promise<HAction> {
    const currentData = await this._serverApi.getFloatingIP(id);
    if (currentData.protection.delete != params.delete) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.FLOATINGIP,
        id: currentData.name,
        value_old: `protection: ${currentData.protection.delete}`,
        value_new: `protection: ${params.delete}`,
      });
    }

    return HActionMock;
  }
}
