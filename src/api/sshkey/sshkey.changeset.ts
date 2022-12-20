import { ICDK } from "../../cdk/cdk";
import { Operation, ResourceType } from "../../cdk/classes/resource";
import {
  HSSHKey,
  SSHKeyCreateRequest,
  SSHKeyGetAllRequest,
  SSHKeyUpdateRequest,
} from "../types/sshkey";
import { HSSHKeyMock } from "../types/__mocks__/sshkey-mock";
import { ISSHKeyAPI } from "./sshkey";

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

  async createSSHKey(params: SSHKeyCreateRequest): Promise<HSSHKey> {
    this._cdk.changeset.push({
      operation: Operation.ADD,
      type: ResourceType.SSHKEY,
      id: params.name,
    });
    return HSSHKeyMock;
  }

  async deleteSSHKey(id: number): Promise<boolean> {
    const res = await this._sshkeyApi.getSSHKey(id);
    this._cdk.changeset.push({
      operation: Operation.DELETE,
      type: ResourceType.SSHKEY,
      id: res.name,
    });
    return true;
  }

  async getSSHKey(id: number): Promise<HSSHKey> {
    try {
      return await this._sshkeyApi.getSSHKey(id);
    } catch {
      return HSSHKeyMock;
    }
  }

  async updateSSHKey(
    id: number,
    params: SSHKeyUpdateRequest
  ): Promise<HSSHKey> {
    const currentData = await this._sshkeyApi.getSSHKey(id);
    let valueOld: string[] = [];
    let valueNew: string[] = [];
    if (params.name && currentData.name != params.name) {
      valueOld.push(`name: ${currentData.name}`);
      valueNew.push(`name: ${params.name}`);
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
        type: ResourceType.SSHKEY,
        id: currentData.name,
        value_old: valueOld.join("\n"),
        value_new: valueNew.join("\n"),
      });
    }

    return HSSHKeyMock;
  }
}
