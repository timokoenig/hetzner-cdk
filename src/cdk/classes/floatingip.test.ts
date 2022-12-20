import { HFloatingIPMock } from "../../api/types/__mocks__/floatingip-mock";
import { APIFactoryMock } from "../../api/__mocks__/factory";
import { FloatingIPAPIMock } from "../../api/__mocks__/floatingip";
import { CDKMock } from "../__mocks__/cdk";
import { FloatingIP } from "./floatingip";

describe("FloatingIP", () => {
  const cdk = new CDKMock();
  const sut = new FloatingIP({
    name: "floatingip",
    type: "ipv4",
  });
  sut.cdk = cdk;

  test("getName", async () => {
    expect(sut.getName()).toBe("mock-floatingip");
  });
  test("getAttachedResources", async () => {
    expect(sut.getAttachedResources().toString()).toBe([].toString());
  });
  describe("apply", () => {
    test("succeeds with new floatingip", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.floatingip as FloatingIPAPIMock).getAllFloatingIPsResult =
        Promise.resolve([HFloatingIPMock]);
      const res = await sut.apply(factoryMock);
      expect(res).toBe(0);
    });
    test("succeeds with existing floatingip", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.floatingip as FloatingIPAPIMock).getAllFloatingIPsResult =
        Promise.resolve([{ ...HFloatingIPMock, name: "mock-floatingip" }]);
      const res = await sut.apply(factoryMock);
      expect(res).toBe(0);
    });
  });
  describe("delete", () => {
    test("succeeds with floatingip", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.floatingip as FloatingIPAPIMock).getAllFloatingIPsResult =
        Promise.resolve([{ ...HFloatingIPMock, name: "mock-floatingip" }]);
      (factoryMock.floatingip as FloatingIPAPIMock).deleteFloatingIPResult =
        Promise.resolve(true);
      const res = await sut.delete(factoryMock);
      expect(res).toBeTruthy();
    });
    test("fails with no matching floatingip", async () => {
      const factoryMock = new APIFactoryMock();
      const res = await sut.delete(factoryMock);
      expect(res).toBeFalsy();
    });
  });
  describe("deleteUnusedResources", () => {
    test("succeeds with existing floatingips", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.floatingip as FloatingIPAPIMock).getAllFloatingIPsResult =
        Promise.resolve([{ ...HFloatingIPMock, name: "mock-floatingip" }]);
      (factoryMock.floatingip as FloatingIPAPIMock).deleteFloatingIPResult =
        Promise.resolve(true);
      const res = await FloatingIP.deleteUnusedResources(
        [],
        "mock",
        factoryMock
      );
      expect(res).toBeTruthy();
    });
    test("fails with local matches remote", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.floatingip as FloatingIPAPIMock).getAllFloatingIPsResult =
        Promise.resolve([{ ...HFloatingIPMock, name: "mock-floatingip" }]);
      (factoryMock.floatingip as FloatingIPAPIMock).deleteFloatingIPResult =
        Promise.resolve(true);
      const res = await FloatingIP.deleteUnusedResources(
        ["mock-floatingip"],
        "mock",
        factoryMock
      );
      expect(res).toBeFalsy();
    });
    test("fails without floatingips", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.floatingip as FloatingIPAPIMock).getAllFloatingIPsResult =
        Promise.resolve([]);
      const res = await FloatingIP.deleteUnusedResources(
        ["mock-floatingip"],
        "mock",
        factoryMock
      );
      expect(res).toBeFalsy();
    });
  });
});
