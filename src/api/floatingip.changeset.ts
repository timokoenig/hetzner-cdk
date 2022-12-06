import {
  HFloatingIP,
  FloatingIPCreateRequest,
  FloatingIPCreateResponse,
  FloatingIPDeleteRequest,
  FloatingIPDeleteResponse,
  FloatingIPGetAllRequest,
  FloatingIPGetRequest,
  FloatingIPGetResponse,
  FloatingIPUpdateRequest,
  FloatingIPUpdateResponse,
} from "./types/floatingip";
import { HFloatingIPMock } from "./mocks/floatingip";
import { ICDK } from "../cdk/cdk";
import { Operation, ResourceType } from "../cdk/classes/resource";
import { HActionMock } from "./mocks/action";
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

  async deleteFloatingIP(
    params: FloatingIPDeleteRequest
  ): Promise<FloatingIPDeleteResponse> {
    const res = await this._serverApi.getFloatingIP({ id: params.id });
    this._cdk.changeset.push({
      operation: Operation.DELETE,
      type: ResourceType.FLOATINGIP,
      id: res.floating_ip.name,
    });
    return { floating_ip: HFloatingIPMock };
  }

  async getFloatingIP(
    params: FloatingIPGetRequest
  ): Promise<FloatingIPGetResponse> {
    try {
      return await this._serverApi.getFloatingIP(params);
    } catch {
      return { floating_ip: HFloatingIPMock };
    }
  }

  async updateFloatingIP(
    params: FloatingIPUpdateRequest
  ): Promise<FloatingIPUpdateResponse> {
    const res = await this._serverApi.getFloatingIP({ id: params.id });
    this._cdk.changeset.push({
      operation: Operation.MODIFY,
      type: ResourceType.FLOATINGIP,
      id: res.floating_ip.name,
      value_old: "placeholder for old values",
      value_new: "placeholder for new values",
    });
    return {
      floating_ip: HFloatingIPMock,
    };
  }
}
