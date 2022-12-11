import { ICDK } from "../cdk/cdk";
import { Operation, ResourceType } from "../cdk/classes/resource";
import { IFloatingIPAPI } from "./floatingip";
import { HActionMock } from "./mocks/action";
import { HFloatingIPMock } from "./mocks/floatingip";
import {
  FloatingIPCreateRequest,
  FloatingIPCreateResponse,
  FloatingIPDeleteResponse,
  FloatingIPGetAllRequest,
  FloatingIPGetResponse,
  FloatingIPProtectionRequest,
  FloatingIPProtectionResponse,
  FloatingIPUpdateRequest,
  FloatingIPUpdateResponse,
  HFloatingIP,
} from "./types/floatingip";

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
  ): Promise<FloatingIPCreateResponse> {
    this._cdk.changeset.push({
      operation: Operation.ADD,
      type: ResourceType.FLOATINGIP,
      id: params.name,
    });
    return {
      action: HActionMock,
      floating_ip: HFloatingIPMock,
    };
  }

  async deleteFloatingIP(id: number): Promise<FloatingIPDeleteResponse | null> {
    const res = await this._serverApi.getFloatingIP(id);
    if (res.floating_ip.protection.delete) {
      // Floating IP is protected
      return null;
    }
    this._cdk.changeset.push({
      operation: Operation.DELETE,
      type: ResourceType.FLOATINGIP,
      id: res.floating_ip.name,
    });
    return { floating_ip: HFloatingIPMock };
  }

  async getFloatingIP(id: number): Promise<FloatingIPGetResponse> {
    try {
      return await this._serverApi.getFloatingIP(id);
    } catch {
      return { floating_ip: HFloatingIPMock };
    }
  }

  async updateFloatingIP(
    id: number,
    params: FloatingIPUpdateRequest
  ): Promise<FloatingIPUpdateResponse> {
    const currentData = await this._serverApi.getFloatingIP(id);
    let valueOld: string[] = [];
    let valueNew: string[] = [];
    if (params.name && currentData.floating_ip.name != params.name) {
      valueOld.push(`name: ${currentData.floating_ip.name}`);
      valueNew.push(`name: ${params.name}`);
    }
    if (
      params.description &&
      currentData.floating_ip.description != params.description
    ) {
      valueOld.push(`description: ${currentData.floating_ip.description}`);
      valueNew.push(`description: ${params.description}`);
    }
    if (
      params.labels &&
      JSON.stringify(currentData.floating_ip.labels) !=
        JSON.stringify(params.labels)
    ) {
      valueOld.push(
        `labels: ${JSON.stringify(currentData.floating_ip.labels)}`
      );
      valueNew.push(`labels: ${JSON.stringify(params.labels)}`);
    }

    if (valueOld.length > 0) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.FLOATINGIP,
        id: currentData.floating_ip.name,
        value_old: valueOld.join("/n"),
        value_new: valueNew.join("/n"),
      });
    }

    return {
      floating_ip: HFloatingIPMock,
    };
  }

  async changeProtection(
    id: number,
    params: FloatingIPProtectionRequest
  ): Promise<FloatingIPProtectionResponse> {
    const currentData = await this._serverApi.getFloatingIP(id);
    if (currentData.floating_ip.protection.delete != params.delete) {
      this._cdk.changeset.push({
        operation: Operation.MODIFY,
        type: ResourceType.FLOATINGIP,
        id: currentData.floating_ip.name,
        value_old: `protection: ${currentData.floating_ip.protection.delete}`,
        value_new: `protection: ${params.delete}`,
      });
    }

    return {
      action: HActionMock,
    };
  }
}
