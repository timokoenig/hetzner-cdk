import { ICDK } from "../cdk/cdk";
import { Operation, ResourceType } from "../cdk/classes/resource";
import { CDKMock } from "../cdk/__mocks__/cdk";
import { HActionMock } from "./mocks/action";
import { HPrimaryIPMock } from "./mocks/primaryip";
import { PrimaryIPAPIChangeset } from "./primaryip.changeset";
import { HIPType } from "./types/floatingip";
import { HAssigneeType } from "./types/primaryip";
import { PrimaryIPAPIMock } from "./__mocks__/primaryip";

describe("PrimaryIPAPIChangeset", () => {
  let cdk: ICDK;
  let api: PrimaryIPAPIMock;
  let sut: PrimaryIPAPIChangeset;

  beforeEach(() => {
    cdk = new CDKMock();
    api = new PrimaryIPAPIMock();
    sut = new PrimaryIPAPIChangeset(cdk, api);
  });

  describe("getAllPrimaryIPs", () => {
    test("succeeds with array", async () => {
      api.getAllPrimaryIPsResult = Promise.resolve([HPrimaryIPMock]);
      const res = await sut.getAllPrimaryIPs();
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(HPrimaryIPMock);
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("createPrimaryIP", () => {
    test("succeeds", async () => {
      const res = await sut.createPrimaryIP({
        assignee_type: HAssigneeType.SERVER,
        name: "foo",
        type: HIPType.IPV4,
      });
      expect(res).toMatchObject(HPrimaryIPMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.ADD,
        type: ResourceType.PRIMARYIP,
        id: "foo",
      });
    });
  });

  describe("deletePrimaryIP", () => {
    test("succeeds", async () => {
      const res = await sut.deletePrimaryIP(1);
      expect(res).toBeTruthy();
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.DELETE,
        type: ResourceType.PRIMARYIP,
        id: "space-ip",
      });
    });

    test("fails with protection", async () => {
      api.getPrimaryIPResult = Promise.resolve({
        ...HPrimaryIPMock,
        protection: { delete: true },
      });
      const res = await sut.deletePrimaryIP(1);
      expect(res).toBeFalsy();
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("getPrimaryIP", () => {
    test("succeeds", async () => {
      const res = await sut.getPrimaryIP(1);
      expect(res).toMatchObject(HPrimaryIPMock);
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("updatePrimaryIP", () => {
    test("succeeds with updated name", async () => {
      api.getPrimaryIPResult = Promise.resolve(HPrimaryIPMock);
      const res = await sut.updatePrimaryIP(1, {
        name: "new",
      });
      expect(res).toMatchObject(HPrimaryIPMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.MODIFY,
        type: ResourceType.PRIMARYIP,
        id: "space-ip",
        value_old: "name: space-ip",
        value_new: "name: new",
      });
    });
    test("succeeds with updated auto_delete", async () => {
      api.getPrimaryIPResult = Promise.resolve({
        ...HPrimaryIPMock,
        auto_delete: false,
      });
      const res = await sut.updatePrimaryIP(1, {
        auto_delete: true,
      });
      expect(res).toMatchObject(HPrimaryIPMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.MODIFY,
        type: ResourceType.PRIMARYIP,
        id: "space-ip",
        value_old: "auto_delete: false",
        value_new: "auto_delete: true",
      });
    });
    test("succeeds with updated labels", async () => {
      api.getPrimaryIPResult = Promise.resolve({
        ...HPrimaryIPMock,
        labels: { foo: "old" },
      });
      const res = await sut.updatePrimaryIP(1, {
        labels: { foo: "new" },
      });
      expect(res).toMatchObject(HPrimaryIPMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.MODIFY,
        type: ResourceType.PRIMARYIP,
        id: "space-ip",
        value_old: 'labels: {"foo":"old"}',
        value_new: 'labels: {"foo":"new"}',
      });
    });
    test("fails with same data", async () => {
      const existingData = { ...HPrimaryIPMock, name: "old" };
      api.getPrimaryIPResult = Promise.resolve(existingData);
      const res = await sut.updatePrimaryIP(1, {
        name: "old",
      });
      expect(res).toMatchObject(HPrimaryIPMock);
      expect(cdk.changeset.length).toBe(0);
    });
    test("fails without data", async () => {
      const existingData = { ...HPrimaryIPMock, name: "old" };
      api.getPrimaryIPResult = Promise.resolve(existingData);
      const res = await sut.updatePrimaryIP(1, {});
      expect(res).toMatchObject(HPrimaryIPMock);
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("changeProtection", () => {
    test("succeeds", async () => {
      const res = await sut.changeProtection(1, {
        delete: true,
      });
      expect(res).toMatchObject(HActionMock);
    });
  });
});
