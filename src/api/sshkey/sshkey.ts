import { AxiosResponse } from "axios";
import { logDebug } from "../../cdk/utils/logger";
import client from "../client";
import {
  HSSHKey,
  SSHKeyCreateRequest,
  SSHKeyCreateResponse,
  SSHKeyGetAllRequest,
  SSHKeyGetAllResponse,
  SSHKeyGetResponse,
  SSHKeyUpdateRequest,
  SSHKeyUpdateResponse,
} from "../types/sshkey";

// Cloud API - SSH Keys
// https://docs.hetzner.cloud/#ssh-keys

export interface ISSHKeyAPI {
  getAllSSHKeys(params?: SSHKeyGetAllRequest): Promise<HSSHKey[]>;
  createSSHKey(params: SSHKeyCreateRequest): Promise<HSSHKey>;
  deleteSSHKey(id: number): Promise<boolean>;
  getSSHKey(id: number): Promise<HSSHKey>;
  updateSSHKey(id: number, params: SSHKeyUpdateRequest): Promise<HSSHKey>;
}

export class SSHKeyAPI implements ISSHKeyAPI {
  async getAllSSHKeys(params?: SSHKeyGetAllRequest): Promise<HSSHKey[]> {
    const res: AxiosResponse<SSHKeyGetAllResponse> = await client.get("/ssh_keys", { params });
    if (Array.isArray(res.data.ssh_keys)) return res.data.ssh_keys;
    return [res.data.ssh_keys];
  }

  async createSSHKey(params: SSHKeyCreateRequest): Promise<HSSHKey> {
    const res: AxiosResponse<SSHKeyCreateResponse> = await client.post("/ssh_keys", params);
    return res.data.ssh_key;
  }

  async deleteSSHKey(id: number): Promise<boolean> {
    await client.delete(`/ssh_keys/${id}`);
    return true;
  }

  async getSSHKey(id: number): Promise<HSSHKey> {
    const res: AxiosResponse<SSHKeyGetResponse> = await client.get(`/ssh_keys/${id}`);
    return res.data.ssh_key;
  }

  async updateSSHKey(id: number, params: SSHKeyUpdateRequest): Promise<HSSHKey> {
    const currentData = await this.getSSHKey(id);
    if (
      (!params.name || currentData.name == params.name) &&
      (!params.labels || currentData.labels == params.labels)
    ) {
      logDebug("[SSHKey] Nothing to update");
      return currentData;
    }

    const res: AxiosResponse<SSHKeyUpdateResponse> = await client.put(`/ssh_keys/${id}`, params);
    return res.data.ssh_key;
  }
}
