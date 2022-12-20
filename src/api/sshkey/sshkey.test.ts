import mockAxios from "../../__mocks__/axios";
import { HSSHKeyMock } from "../types/__mocks__/sshkey-mock";
import { SSHKeyAPI } from "./sshkey";

describe("SSHKeyAPI", () => {
  let sut = new SSHKeyAPI();

  describe("getAllSSHKeys", () => {
    test("succeeds with array", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { ssh_keys: [HSSHKeyMock] },
      });
      const res = await sut.getAllSSHKeys();
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(HSSHKeyMock);
    });

    test("succeeds with object", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { ssh_keys: HSSHKeyMock },
      });
      const res = await sut.getAllSSHKeys({});
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(HSSHKeyMock);
    });
  });

  describe("createSSHKey", () => {
    test("succeeds", async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { ssh_key: HSSHKeyMock },
      });
      const res = await sut.createSSHKey({
        name: "foo",
        public_key: "pubkey",
      });
      expect(res).toMatchObject(HSSHKeyMock);
    });
  });

  describe("deleteSSHKey", () => {
    test("succeeds", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { ssh_key: HSSHKeyMock },
      });
      mockAxios.delete.mockResolvedValueOnce({
        data: { ssh_key: HSSHKeyMock },
      });
      const res = await sut.deleteSSHKey(1);
      expect(res).toBeTruthy();
    });
  });

  describe("getSSHKey", () => {
    test("succeeds", async () => {
      mockAxios.get.mockResolvedValue({
        data: { ssh_key: HSSHKeyMock },
      });
      const res = await sut.getSSHKey(1);
      expect(res).toMatchObject(HSSHKeyMock);
    });
  });

  describe("updateSSHKey", () => {
    test("succeeds with updated name", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { ssh_key: { ...HSSHKeyMock, name: "old" } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { ssh_key: HSSHKeyMock },
      });
      const res = await sut.updateSSHKey(1, {
        name: "foo",
      });
      expect(res).toMatchObject(HSSHKeyMock);
    });
    test("succeeds with updated labels", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { ssh_key: { ...HSSHKeyMock, labels: { foo: "bar" } } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { ssh_key: HSSHKeyMock },
      });
      const res = await sut.updateSSHKey(1, {
        labels: { foo: "bar" },
      });
      expect(res).toMatchObject(HSSHKeyMock);
    });
    test("fails with same data", async () => {
      const existingData = { ...HSSHKeyMock, name: "old" };
      mockAxios.get.mockResolvedValueOnce({
        data: { ssh_key: { ...HSSHKeyMock, name: "old" } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { ssh_key: HSSHKeyMock },
      });
      const res = await sut.updateSSHKey(1, {
        name: "old",
      });
      expect(res).toMatchObject(existingData);
    });
    test("fails without data", async () => {
      const existingData = { ...HSSHKeyMock, name: "old" };
      mockAxios.get.mockResolvedValueOnce({
        data: { ssh_key: existingData },
      });
      mockAxios.put.mockResolvedValueOnce({});
      const res = await sut.updateSSHKey(1, {
        name: "old",
      });
      expect(res).toMatchObject(existingData);
    });
  });
});
