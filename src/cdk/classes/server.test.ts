import { HServerMock } from "../../api/types/__mocks__/server-mock";
import { APIFactoryMock } from "../../api/__mocks__/factory";
import { ServerAPIMock } from "../../api/__mocks__/server";
import { CDKMock } from "../__mocks__/cdk";
import { Server } from "./server";

describe("Server", () => {
  const cdk = new CDKMock();
  const sut = new Server({
    name: "server",
    image: "ubuntu-22.04",
    serverType: "cx11",
  });
  sut.cdk = cdk;

  test("getName", async () => {
    expect(sut.getName()).toBe("mock-server");
  });
  test("getAttachedResources", async () => {
    expect(sut.getAttachedResources().toString()).toBe([].toString());
  });
  describe("apply", () => {
    test("succeeds with new server", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.server as ServerAPIMock).getAllServersResult = Promise.resolve([HServerMock]);
      const res = await sut.apply(factoryMock);
      expect(res).toBe(0);
    });
    test("succeeds with existing server", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.server as ServerAPIMock).getAllServersResult = Promise.resolve([
        { ...HServerMock, name: "mock-server" },
      ]);
      const res = await sut.apply(factoryMock);
      expect(res).toBe(0);
    });
  });
  describe("delete", () => {
    test("succeeds with server", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.server as ServerAPIMock).getAllServersResult = Promise.resolve([
        { ...HServerMock, name: "mock-server" },
      ]);
      (factoryMock.server as ServerAPIMock).deleteServerResult = Promise.resolve(true);
      const res = await sut.delete(factoryMock);
      expect(res).toBeTruthy();
    });
    test("fails with no matching server", async () => {
      const factoryMock = new APIFactoryMock();
      const res = await sut.delete(factoryMock);
      expect(res).toBeFalsy();
    });
  });
  describe("deleteUnusedResources", () => {
    test("succeeds with existing servers", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.server as ServerAPIMock).getAllServersResult = Promise.resolve([
        { ...HServerMock, name: "mock-server" },
      ]);
      (factoryMock.server as ServerAPIMock).deleteServerResult = Promise.resolve(true);
      const res = await Server.deleteUnusedResources([], "mock", factoryMock);
      expect(res).toBeTruthy();
    });
    test("fails with local matches remote", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.server as ServerAPIMock).getAllServersResult = Promise.resolve([
        { ...HServerMock, name: "mock-server" },
      ]);
      (factoryMock.server as ServerAPIMock).deleteServerResult = Promise.resolve(true);
      const res = await Server.deleteUnusedResources(["mock-server"], "mock", factoryMock);
      expect(res).toBeFalsy();
    });
    test("fails without servers", async () => {
      const factoryMock = new APIFactoryMock();
      (factoryMock.server as ServerAPIMock).getAllServersResult = Promise.resolve([]);
      const res = await Server.deleteUnusedResources(["mock-server"], "mock", factoryMock);
      expect(res).toBeFalsy();
    });
  });
});
