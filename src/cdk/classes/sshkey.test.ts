import { HSSHKeyMock } from "../../api/mocks/sshkey";
import { APIFactoryMock } from "../../api/__mocks__/factory";
import { SSHKeyAPIMock } from "../../api/__mocks__/sshkey";
import { CDKMock } from "../__mocks__/cdk";
import { PublicKey } from "./publickey";
import { SSHKey } from "./sshkey";

describe("SSHKey", () => {
  const cdk = new CDKMock();
  const sut = new SSHKey({ name: "key", publicKey: new PublicKey("") });
  sut.cdk = cdk;

  test("getName", async () => {
    expect(sut.getName()).toBe("mock-key");
  });
  test("getAttachedResources", async () => {
    expect(sut.getAttachedResources().toString()).toBe([].toString());
  });
  describe("apply", () => {
    test("succeeds with new key", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.sshkey as SSHKeyAPIMock).getAllSSHKeysResult =
        Promise.resolve([HSSHKeyMock]);
      const res = await sut.apply(factoryMock);
      expect(res).toBe(0);
    });
    test("succeeds with existing key", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.sshkey as SSHKeyAPIMock).getAllSSHKeysResult =
        Promise.resolve([{ ...HSSHKeyMock, name: "mock-key" }]);
      const res = await sut.apply(factoryMock);
      expect(res).toBe(0);
    });
  });
  describe("delete", () => {
    test("succeeds with ssh key", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.sshkey as SSHKeyAPIMock).getAllSSHKeysResult =
        Promise.resolve([{ ...HSSHKeyMock, name: "mock-key" }]);
      (factoryMock.sshkey as SSHKeyAPIMock).deleteSSHKeyResult =
        Promise.resolve(true);
      const res = await sut.delete(factoryMock);
      expect(res).toBeTruthy();
    });
    test("fails with no matching ssh key", async () => {
      const factoryMock = new APIFactoryMock();
      const res = await sut.delete(factoryMock);
      expect(res).toBeFalsy();
    });
  });
  describe("deleteUnusedResources", () => {
    test("succeeds with existing ssh keys", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.sshkey as SSHKeyAPIMock).getAllSSHKeysResult =
        Promise.resolve([{ ...HSSHKeyMock, name: "mock-key" }]);
      (factoryMock.sshkey as SSHKeyAPIMock).deleteSSHKeyResult =
        Promise.resolve(true);
      const res = await SSHKey.deleteUnusedResources([], "mock", factoryMock);
      expect(res).toBeTruthy();
    });
    test("fails with local matches remote", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.sshkey as SSHKeyAPIMock).getAllSSHKeysResult =
        Promise.resolve([{ ...HSSHKeyMock, name: "mock-key" }]);
      (factoryMock.sshkey as SSHKeyAPIMock).deleteSSHKeyResult =
        Promise.resolve(true);
      const res = await SSHKey.deleteUnusedResources(
        ["mock-key"],
        "mock",
        factoryMock
      );
      expect(res).toBeFalsy();
    });
    test("fails without ssh keys", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.sshkey as SSHKeyAPIMock).getAllSSHKeysResult =
        Promise.resolve([]);
      const res = await SSHKey.deleteUnusedResources(
        ["mock-key"],
        "mock",
        factoryMock
      );
      expect(res).toBeFalsy();
    });
  });
});
