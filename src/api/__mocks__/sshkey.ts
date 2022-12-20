import { ISSHKeyAPI } from "../sshkey/sshkey";
import {
  HSSHKey,
  SSHKeyCreateRequest,
  SSHKeyGetAllRequest,
  SSHKeyUpdateRequest,
} from "../types/sshkey";
import { HSSHKeyMock } from "../types/__mocks__/sshkey-mock";

export class SSHKeyAPIMock implements ISSHKeyAPI {
  getAllSSHKeysResult: Promise<HSSHKey[]> = Promise.resolve([]);
  async getAllSSHKeys(params?: SSHKeyGetAllRequest): Promise<HSSHKey[]> {
    return this.getAllSSHKeysResult;
  }

  createSSHKeyResult: Promise<HSSHKey> = Promise.resolve(HSSHKeyMock);
  async createSSHKey(params: SSHKeyCreateRequest): Promise<HSSHKey> {
    return this.createSSHKeyResult;
  }

  deleteSSHKeyResult: Promise<boolean> = Promise.resolve(true);
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
