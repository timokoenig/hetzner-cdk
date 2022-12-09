import { ICDK } from "../cdk/cdk";
import { Operation, ResourceType } from "../cdk/classes/resource";
import { HSSHKeyMock } from "./mocks/sshkey";
import { ISSHKeyAPI } from "./sshkey";
import {
  HSSHKey,
  SSHKeyCreateRequest,
  SSHKeyCreateResponse,
  SSHKeyGetAllRequest,
  SSHKeyGetResponse,
  SSHKeyUpdateRequest,
  SSHKeyUpdateResponse,
} from "./types/sshkey";

export class SSHKeyAPIChangeset implements ISSHKeyAPI {
  private _cdk: ICDK;
  private _sshkeyApi: ISSHKeyAPI;

  constructor(cdk: ICDK, sshkeyApi: ISSHKeyAPI) {
    this._cdk = cdk;
    this._sshkeyApi = sshkeyApi;
  }

  async getAllSSHKeys(params?: SSHKeyGetAllRequest): Promise<HSSHKey[]> {
    return this._sshkeyApi.getAllSSHKeys(params);
  }

  async createSSHKey(
    params: SSHKeyCreateRequest
  ): Promise<SSHKeyCreateResponse> {
    this._cdk.changeset.push({
      operation: Operation.ADD,
      type: ResourceType.SSHKEY,
      id: params.name,
    });
    return {
      ssh_key: HSSHKeyMock,
    };
  }

  async deleteSSHKey(id: number): Promise<void> {
    const res = await this._sshkeyApi.getSSHKey(id);
    this._cdk.changeset.push({
      operation: Operation.DELETE,
      type: ResourceType.SSHKEY,
      id: res.ssh_key.name,
    });
  }

  async getSSHKey(id: number): Promise<SSHKeyGetResponse> {
    try {
      return this._sshkeyApi.getSSHKey(id);
    } catch {
      return { ssh_key: HSSHKeyMock };
    }
  }

  async updateSSHKey(
    id: number,
    _: SSHKeyUpdateRequest
  ): Promise<SSHKeyUpdateResponse> {
    const res = await this._sshkeyApi.getSSHKey(id);
    this._cdk.changeset.push({
      operation: Operation.MODIFY,
      type: ResourceType.SSHKEY,
      id: res.ssh_key.name,
      value_old: "placeholder for old values",
      value_new: "placeholder for new values",
    });
    return {
      ssh_key: HSSHKeyMock,
    };
  }
}
