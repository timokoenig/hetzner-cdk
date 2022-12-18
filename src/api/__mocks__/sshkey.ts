import { HSSHKeyMock } from "../mocks/sshkey";
import { ISSHKeyAPI } from "../sshkey";
import {
  HSSHKey,
  SSHKeyCreateRequest,
  SSHKeyGetAllRequest,
  SSHKeyUpdateRequest,
} from "../types/sshkey";

export class SSHKeyAPIMock implements ISSHKeyAPI {
  getAllSSHKeysResult: Promise<HSSHKey[]> = Promise.resolve([]);
  async getAllSSHKeys(params?: SSHKeyGetAllRequest): Promise<HSSHKey[]> {
    return this.getAllSSHKeysResult;
  }

  createSSHKeyResult: Promise<HSSHKey> = Promise.resolve(HSSHKeyMock);
  async createSSHKey(params: SSHKeyCreateRequest): Promise<HSSHKey> {
    return this.createSSHKeyResult;
  }

  deleteSSHKeyResult: boolean = true;
  async deleteSSHKey(id: number): Promise<boolean> {
    return this.deleteSSHKeyResult;
  }

  getSSHKeyResult: Promise<HSSHKey> = Promise.resolve(HSSHKeyMock);
  async getSSHKey(id: number): Promise<HSSHKey> {
    return this.getSSHKeyResult;
  }

  updateSSHKeyResult: Promise<HSSHKey> = Promise.resolve(HSSHKeyMock);
  async updateSSHKey(
    id: number,
    params: SSHKeyUpdateRequest
  ): Promise<HSSHKey> {
    return this.updateSSHKeyResult;
  }
}
