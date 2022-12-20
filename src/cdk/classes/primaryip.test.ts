import { HPrimaryIPMock } from "../../api/mocks/primaryip";
import { APIFactoryMock } from "../../api/__mocks__/factory";
import { PrimaryIPAPIMock } from "../../api/__mocks__/primaryip";
import { CDKMock } from "../__mocks__/cdk";
import { PrimaryIP } from "./primaryip";

describe("PrimaryIP", () => {
  const cdk = new CDKMock();
  const sut = new PrimaryIP({
    name: "primaryip",
    type: "ipv4",
  });
  sut.cdk = cdk;

  test("getName", async () => {
    expect(sut.getName()).toBe("mock-primaryip");
  });
  test("getAttachedResources", async () => {
    expect(sut.getAttachedResources().toString()).toBe([].toString());
  });
  describe("apply", () => {
    test("succeeds with new primaryip", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.primaryip as PrimaryIPAPIMock).getAllPrimaryIPsResult =
        Promise.resolve([HPrimaryIPMock]);
      const res = await sut.apply(factoryMock);
      expect(res).toBe(0);
    });
    test("succeeds with existing primaryip", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.primaryip as PrimaryIPAPIMock).getAllPrimaryIPsResult =
        Promise.resolve([{ ...HPrimaryIPMock, name: "mock-primaryip" }]);
      const res = await sut.apply(factoryMock);
      expect(res).toBe(0);
    });
  });
  describe("delete", () => {
    test("succeeds with primaryip", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.primaryip as PrimaryIPAPIMock).getAllPrimaryIPsResult =
        Promise.resolve([{ ...HPrimaryIPMock, name: "mock-primaryip" }]);
      (factoryMock.primaryip as PrimaryIPAPIMock).deletePrimaryIPResult =
        Promise.resolve(true);
      const res = await sut.delete(factoryMock);
      expect(res).toBeTruthy();
    });
    test("fails with no matching primaryip", async () => {
      const factoryMock = new APIFactoryMock();
      const res = await sut.delete(factoryMock);
      expect(res).toBeFalsy();
    });
  });
  describe("deleteUnusedResources", () => {
    test("succeeds with existing primaryips", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.primaryip as PrimaryIPAPIMock).getAllPrimaryIPsResult =
        Promise.resolve([{ ...HPrimaryIPMock, name: "mock-primaryip" }]);
      (factoryMock.primaryip as PrimaryIPAPIMock).deletePrimaryIPResult =
        Promise.resolve(true);
      const res = await PrimaryIP.deleteUnusedResources(
        [],
        "mock",
        factoryMock
      );
      expect(res).toBeTruthy();
    });
    test("fails with local matches remote", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.primaryip as PrimaryIPAPIMock).getAllPrimaryIPsResult =
        Promise.resolve([{ ...HPrimaryIPMock, name: "mock-primaryip" }]);
      (factoryMock.primaryip as PrimaryIPAPIMock).deletePrimaryIPResult =
        Promise.resolve(true);
      const res = await PrimaryIP.deleteUnusedResources(
        ["mock-primaryip"],
        "mock",
        factoryMock
      );
      expect(res).toBeFalsy();
    });
    test("fails without primaryips", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.primaryip as PrimaryIPAPIMock).getAllPrimaryIPsResult =
        Promise.resolve([]);
      const res = await PrimaryIP.deleteUnusedResources(
        ["mock-primaryip"],
        "mock",
        factoryMock
      );
      expect(res).toBeFalsy();
    });
  });
});
