import { AxiosResponse } from "axios";
import chalk from "chalk";
import client from "./client";
import {
  HSSHKey,
  SSHKeyCreateRequest,
  SSHKeyCreateResponse,
  SSHKeyGetAllRequest,
  SSHKeyGetAllResponse,
  SSHKeyGetResponse,
  SSHKeyUpdateRequest,
  SSHKeyUpdateResponse,
} from "./types/sshkey";

// Cloud API - SSH Keys
// https://docs.hetzner.cloud/#ssh-keys

export interface ISSHKeyAPI {
  getAllSSHKeys(params?: SSHKeyGetAllRequest): Promise<HSSHKey[]>;
  createSSHKey(params: SSHKeyCreateRequest): Promise<SSHKeyCreateResponse>;
  deleteSSHKey(id: number): Promise<void>;
  getSSHKey(id: number): Promise<SSHKeyGetResponse>;
  updateSSHKey(
    id: number,
    params: SSHKeyUpdateRequest
  ): Promise<SSHKeyUpdateResponse>;
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

  async deleteSSHKey(id: number): Promise<void> {
    await client.delete(`/ssh_keys/${id}`);
  }

  async getSSHKey(id: number): Promise<SSHKeyGetResponse> {
    const res: AxiosResponse<SSHKeyGetResponse> = await client.get(
      `/ssh_keys/${id}`
    );
    return res.data;
  }

  async updateSSHKey(
    id: number,
    params: SSHKeyUpdateRequest
  ): Promise<SSHKeyUpdateResponse> {
    const currentData = await this.getSSHKey(id);
    if (
      (!params.name || currentData.ssh_key.name == params.name) &&
      (!params.labels || currentData.ssh_key.labels == params.labels)
    ) {
      console.log(chalk.gray("[SSHKey] Nothing to update"));
      return currentData;
    }

    const res: AxiosResponse<SSHKeyUpdateResponse> = await client.put(
      `/ssh_keys/${id}`,
      params
    );
    return res.data;
  }
}
