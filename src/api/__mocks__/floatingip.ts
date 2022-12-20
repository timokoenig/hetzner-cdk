import { IFloatingIPAPI } from "../floatingip/floatingip";
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

export class FloatingIPAPIMock implements IFloatingIPAPI {
  getAllFloatingIPsResult: Promise<HFloatingIP[]> = Promise.resolve([]);
  async getAllFloatingIPs(
    params?: FloatingIPGetAllRequest
  ): Promise<HFloatingIP[]> {
    return this.getAllFloatingIPsResult;
  }

  createFloatingIPResult: Promise<HFloatingIP> =
    Promise.resolve(HFloatingIPMock);
  async createFloatingIP(
    params: FloatingIPCreateRequest
  ): Promise<HFloatingIP> {
    return this.createFloatingIPResult;
  }

  deleteFloatingIPResult: Promise<boolean> = Promise.resolve(true);
  async deleteFloatingIP(id: number): Promise<boolean> {
    return this.deleteFloatingIPResult;
  }

  getFloatingIPResult: Promise<HFloatingIP> = Promise.resolve(HFloatingIPMock);
  async getFloatingIP(id: number): Promise<HFloatingIP> {
    return this.getFloatingIPResult;
  }

  updateFloatingIPResult: Promise<HFloatingIP> =
    Promise.resolve(HFloatingIPMock);
  async updateFloatingIP(
    id: number,
    params: FloatingIPUpdateRequest
  ): Promise<HFloatingIP> {
    return this.updateFloatingIPResult;
  }

  changeProtectionResult: Promise<HAction> = Promise.resolve(HActionMock);
  async changeProtection(
    id: number,
    params: FloatingIPProtectionRequest
  ): Promise<HAction> {
    return this.changeProtectionResult;
  }
}
