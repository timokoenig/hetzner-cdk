import { AxiosResponse } from "axios";
import client from "./client";
import {
  HSSHKey,
  SSHKeyCreateRequest,
  SSHKeyCreateResponse,
  SSHKeyDeleteRequest,
  SSHKeyGetAllRequest,
  SSHKeyGetAllResponse,
  SSHKeyGetRequest,
  SSHKeyGetResponse,
  SSHKeyUpdateRequest,
  SSHKeyUpdateResponse,
} from "./types/sshkey";

// Cloud API - SSH Keys
// https://docs.hetzner.cloud/#ssh-keys

export interface ISSHKeyAPI {
  getAllSSHKeys(params?: SSHKeyGetAllRequest): Promise<HSSHKey[]>;
  createSSHKey(params: SSHKeyCreateRequest): Promise<SSHKeyCreateResponse>;
  deleteSSHKey(params: SSHKeyDeleteRequest): Promise<void>;
  getSSHKey(params: SSHKeyGetRequest): Promise<SSHKeyGetResponse>;
  updateSSHKey(params: SSHKeyUpdateRequest): Promise<SSHKeyUpdateResponse>;
}

export class SSHKeyAPI implements ISSHKeyAPI {
  async getAllSSHKeys(params?: SSHKeyGetAllRequest): Promise<HSSHKey[]> {
    const res: AxiosResponse<SSHKeyGetAllResponse> = await client.get(
      "/ssh_keys",
      { params }
    );
    if (Array.isArray(res.data.ssh_keys)) return res.data.ssh_keys;
    return [res.data.ssh_keys];
  }

  async createSSHKey(
    params: SSHKeyCreateRequest
  ): Promise<SSHKeyCreateResponse> {
    const res: AxiosResponse<SSHKeyCreateResponse> = await client.post(
      "/ssh_keys",
      params
    );
    return res.data;
  }

  async deleteSSHKey(params: SSHKeyDeleteRequest): Promise<void> {
    await client.delete(`/ssh_keys/${params.id}`);
  }

  async getSSHKey(params: SSHKeyGetRequest): Promise<SSHKeyGetResponse> {
    const res: AxiosResponse<SSHKeyGetResponse> = await client.get(
      `/ssh_keys/${params.id}`
    );
    return res.data;
  }

  async updateSSHKey(
    params: SSHKeyUpdateRequest
  ): Promise<SSHKeyUpdateResponse> {
    const res: AxiosResponse<SSHKeyUpdateResponse> = await client.put(
      `/ssh_keys/${params.id}`,
      params
    );
    return res.data;
  }
}
