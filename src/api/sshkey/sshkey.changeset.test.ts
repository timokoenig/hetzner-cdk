import { ICDK } from "../../cdk/cdk";
import { Operation, ResourceType } from "../../cdk/resource/resource";
import { CDKMock } from "../../cdk/__mocks__/cdk";
import { HSSHKeyMock } from "../types/__mocks__/sshkey-mock";
import { SSHKeyAPIMock } from "../__mocks__/sshkey";
import { SSHKeyAPIChangeset } from "./sshkey.changeset";

describe("SSHKeyAPIChangeset", () => {
  let cdk: ICDK;
  let api: SSHKeyAPIMock;
  let sut: SSHKeyAPIChangeset;

  beforeEach(() => {
    cdk = new CDKMock();
    api = new SSHKeyAPIMock();
    sut = new SSHKeyAPIChangeset(cdk, api);
  });

  describe("getAllSSHKeys", () => {
    test("succeeds with array", async () => {
      api.getAllSSHKeysResult = Promise.resolve([HSSHKeyMock]);
      const res = await sut.getAllSSHKeys();
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(HSSHKeyMock);
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("createSSHKey", () => {
    test("succeeds", async () => {
      const res = await sut.createSSHKey({
        name: "foo",
        public_key: "pubkey",
      });
      expect(res).toMatchObject(HSSHKeyMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.ADD,
        type: ResourceType.SSHKEY,
        id: "foo",
      });
    });
  });

  describe("deleteSSHKey", () => {
    test("succeeds", async () => {
      const res = await sut.deleteSSHKey(1);
      expect(res).toBeTruthy();
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.DELETE,
        type: ResourceType.SSHKEY,
        id: "space-key",
      });
    });
  });

  describe("getSSHKey", () => {
    test("succeeds", async () => {
      const res = await sut.getSSHKey(1);
      expect(res).toMatchObject(HSSHKeyMock);
      expect(cdk.changeset.length).toBe(0);
    });
    test("fails with mock fallback", async () => {
      api.getSSHKeyResult = Promise.reject("error");
      const res = await sut.getSSHKey(1);
      expect(res).toMatchObject(HSSHKeyMock);
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("updateSSHKey", () => {
    test("succeeds with updated name", async () => {
      api.getSSHKeyResult = Promise.resolve(HSSHKeyMock);
      const res = await sut.updateSSHKey(1, {
        name: "new",
      });
      expect(res).toMatchObject(HSSHKeyMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.MODIFY,
        type: ResourceType.SSHKEY,
        id: "space-key",
        value_old: "name: space-key",
        value_new: "name: new",
      });
    });
    test("succeeds with updated labels", async () => {
      api.getSSHKeyResult = Promise.resolve({
        ...HSSHKeyMock,
        labels: { foo: "old" },
      });
      const res = await sut.updateSSHKey(1, {
        labels: { foo: "new" },
      });
      expect(res).toMatchObject(HSSHKeyMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.MODIFY,
        type: ResourceType.SSHKEY,
        id: "space-key",
        value_old: 'labels: {"foo":"old"}',
        value_new: 'labels: {"foo":"new"}',
      });
    });
    test("fails with same data", async () => {
      const existingData = { ...HSSHKeyMock, name: "old" };
      api.getSSHKeyResult = Promise.resolve(existingData);
      const res = await sut.updateSSHKey(1, {
        name: "old",
      });
      expect(res).toMatchObject(HSSHKeyMock);
      expect(cdk.changeset.length).toBe(0);
    });
    test("fails without data", async () => {
      const existingData = { ...HSSHKeyMock, name: "old" };
      api.getSSHKeyResult = Promise.resolve(existingData);
      const res = await sut.updateSSHKey(1, {});
      expect(res).toMatchObject(HSSHKeyMock);
      expect(cdk.changeset.length).toBe(0);
    });
  });
});
