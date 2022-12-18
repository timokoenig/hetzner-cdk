import { ICDK } from "../cdk/cdk";
import { Operation, ResourceType } from "../cdk/classes/resource";
import { CDKMock } from "../cdk/__mocks__/cdk";
import { HActionMock } from "./mocks/action";
import { HServerMock } from "./mocks/server";
import { ServerAPIChangeset } from "./server.changeset";
import { ServerAPIMock } from "./__mocks__/server";

describe("ServerAPIChangeset", () => {
  let cdk: ICDK;
  let api: ServerAPIMock;
  let sut: ServerAPIChangeset;

  beforeEach(() => {
    cdk = new CDKMock();
    api = new ServerAPIMock();
    sut = new ServerAPIChangeset(cdk, api);
  });

  describe("getAllServers", () => {
    test("succeeds with array", async () => {
      api.getAllServersResult = Promise.resolve([HServerMock]);
      const res = await sut.getAllServers();
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(HServerMock);
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("createServer", () => {
    test("succeeds", async () => {
      const res = await sut.createServer({
        image: "iamge",
        name: "foo",
        server_type: "",
      });
      expect(res).toMatchObject(HServerMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.ADD,
        type: ResourceType.SERVER,
        id: "foo",
      });
    });
  });

  describe("deleteServer", () => {
    test("succeeds", async () => {
      const res = await sut.deleteServer(1);
      expect(res).toBeTruthy();
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.DELETE,
        type: ResourceType.SERVER,
        id: "space-server",
      });
    });

    test("fails with protection", async () => {
      api.getServerResult = Promise.resolve({
        ...HServerMock,
        protection: { delete: true, rebuild: true },
      });
      const res = await sut.deleteServer(1);
      expect(res).toBeFalsy();
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("getServer", () => {
    test("succeeds", async () => {
      const res = await sut.getServer(1);
      expect(res).toMatchObject(HServerMock);
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("updateServer", () => {
    test("succeeds with updated name", async () => {
      api.getServerResult = Promise.resolve(HServerMock);
      const res = await sut.updateServer(1, {
        name: "new",
      });
      expect(res).toMatchObject(HServerMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.MODIFY,
        type: ResourceType.SERVER,
        id: "space-server",
        value_old: "name: space-server",
        value_new: "name: new",
      });
    });
    test("succeeds with updated labels", async () => {
      api.getServerResult = Promise.resolve({
        ...HServerMock,
        labels: { foo: "old" },
      });
      const res = await sut.updateServer(1, {
        labels: { foo: "new" },
      });
      expect(res).toMatchObject(HServerMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.MODIFY,
        type: ResourceType.SERVER,
        id: "space-server",
        value_old: 'labels: {"foo":"old"}',
        value_new: 'labels: {"foo":"new"}',
      });
    });
    test("fails with same data", async () => {
      const existingData = { ...HServerMock, name: "old" };
      api.getServerResult = Promise.resolve(existingData);
      const res = await sut.updateServer(1, {
        name: "old",
      });
      expect(res).toMatchObject(HServerMock);
      expect(cdk.changeset.length).toBe(0);
    });
    test("fails without data", async () => {
      const existingData = { ...HServerMock, name: "old" };
      api.getServerResult = Promise.resolve(existingData);
      const res = await sut.updateServer(1, {});
      expect(res).toMatchObject(HServerMock);
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("changeProtection", () => {
    test("succeeds", async () => {
      const res = await sut.changeProtection(1, {
        delete: true,
        rebuild: true,
      });
      expect(res).toMatchObject(HActionMock);
    });
  });
});
