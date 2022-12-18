import { HActionMock } from "../mocks/action";
import { HPrimaryIPMock } from "../mocks/primaryip";
import { IPrimaryIPAPI } from "../primaryip";
import { HAction } from "../types/action";
import {
  HPrimaryIP,
  PrimaryIPCreateRequest,
  PrimaryIPGetAllRequest,
  PrimaryIPProtectionRequest,
  PrimaryIPUpdateRequest,
} from "../types/primaryip";

export class PrimaryIPAPIMock implements IPrimaryIPAPI {
  getAllPrimaryIPsResult: Promise<HPrimaryIP[]> = Promise.resolve([]);
  async getAllPrimaryIPs(
    params?: PrimaryIPGetAllRequest
  ): Promise<HPrimaryIP[]> {
    return this.getAllPrimaryIPsResult;
  }

  createPrimaryIPResult: Promise<HPrimaryIP> = Promise.resolve(HPrimaryIPMock);
  async createPrimaryIP(params: PrimaryIPCreateRequest): Promise<HPrimaryIP> {
    return this.createPrimaryIPResult;
  }

  deletePrimaryIPResult: boolean = true;
  async deletePrimaryIP(id: number): Promise<boolean> {
    return this.deletePrimaryIPResult;
  }

  getPrimaryIPResult: Promise<HPrimaryIP> = Promise.resolve(HPrimaryIPMock);
  async getPrimaryIP(id: number): Promise<HPrimaryIP> {
    return this.getPrimaryIPResult;
  }

  updatePrimaryIPResult: Promise<HPrimaryIP> = Promise.resolve(HPrimaryIPMock);
  async updatePrimaryIP(
    id: number,
    params: PrimaryIPUpdateRequest
  ): Promise<HPrimaryIP> {
    return this.updatePrimaryIPResult;
  }

  changeProtectionResult: Promise<HAction> = Promise.resolve(HActionMock);
  async changeProtection(
    id: number,
    params: PrimaryIPProtectionRequest
  ): Promise<HAction> {
    return this.changeProtectionResult;
  }
}
