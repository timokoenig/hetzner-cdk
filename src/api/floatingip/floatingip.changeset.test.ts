import { ICDK } from "../../cdk/cdk";
import { Operation, ResourceType } from "../../cdk/resource/resource";
import { CDKMock } from "../../cdk/__mocks__/cdk";
import { HIPType } from "../types/floatingip";
import { HActionMock } from "../types/__mocks__/action-mock";
import { HFloatingIPMock } from "../types/__mocks__/floatingip-mock";
import { FloatingIPAPIMock } from "../__mocks__/floatingip";
import { FloatingIPAPIChangeset } from "./floatingip.changeset";

describe("FloatingIPAPIChangeset", () => {
  let cdk: ICDK;
  let api: FloatingIPAPIMock;
  let sut: FloatingIPAPIChangeset;

  beforeEach(() => {
    cdk = new CDKMock();
    api = new FloatingIPAPIMock();
    sut = new FloatingIPAPIChangeset(cdk, api);
  });

  describe("getAllFloatingIPs", () => {
    test("succeeds with array", async () => {
      api.getAllFloatingIPsResult = Promise.resolve([HFloatingIPMock]);
      const res = await sut.getAllFloatingIPs();
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(HFloatingIPMock);
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("createFloatingIP", () => {
    test("succeeds", async () => {
      const res = await sut.createFloatingIP({
        name: "foo",
        type: HIPType.IPV4,
      });
      expect(res).toMatchObject(HFloatingIPMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.ADD,
        type: ResourceType.FLOATINGIP,
        id: "foo",
      });
    });
  });

  describe("deleteFloatingIP", () => {
    test("succeeds", async () => {
      const res = await sut.deleteFloatingIP(1);
      expect(res).toBeTruthy();
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.DELETE,
        type: ResourceType.FLOATINGIP,
        id: "space-ip",
      });
    });

    test("fails with protection", async () => {
      api.getFloatingIPResult = Promise.resolve({
        ...HFloatingIPMock,
        protection: { delete: true },
      });
      const res = await sut.deleteFloatingIP(1);
      expect(res).toBeFalsy();
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("getFloatingIP", () => {
    test("succeeds", async () => {
      const res = await sut.getFloatingIP(1);
      expect(res).toMatchObject(HFloatingIPMock);
      expect(cdk.changeset.length).toBe(0);
    });
    test("fails with mock fallback", async () => {
      api.getFloatingIPResult = Promise.reject("error");
      const res = await sut.getFloatingIP(1);
      expect(res).toMatchObject(HFloatingIPMock);
      expect(cdk.changeset.length).toBe(0);
    });
  });

  describe("updateFloatingIP", () => {
    test("succeeds with updated name", async () => {
      api.getFloatingIPResult = Promise.resolve(HFloatingIPMock);
      const res = await sut.updateFloatingIP(1, {
        name: "new",
      });
      expect(res).toMatchObject(HFloatingIPMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.MODIFY,
        type: ResourceType.FLOATINGIP,
        id: "space-ip",
        value_old: "name: space-ip",
        value_new: "name: new",
      });
    });
    test("succeeds with updated description", async () => {
      api.getFloatingIPResult = Promise.resolve({
        ...HFloatingIPMock,
        description: "old",
      });
      const res = await sut.updateFloatingIP(1, {
        description: "new",
      });
      expect(res).toMatchObject(HFloatingIPMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.MODIFY,
        type: ResourceType.FLOATINGIP,
        id: "space-ip",
        value_old: "description: old",
        value_new: "description: new",
      });
    });
    test("succeeds with updated labels", async () => {
      api.getFloatingIPResult = Promise.resolve({
        ...HFloatingIPMock,
        labels: { foo: "old" },
      });
      const res = await sut.updateFloatingIP(1, {
        labels: { foo: "new" },
      });
      expect(res).toMatchObject(HFloatingIPMock);
      expect(cdk.changeset.length).toBe(1);
      expect(cdk.changeset[0]).toMatchObject({
        operation: Operation.MODIFY,
        type: ResourceType.FLOATINGIP,
        id: "space-ip",
        value_old: 'labels: {"foo":"old"}',
        value_new: 'labels: {"foo":"new"}',
      });
    });
    test("fails with same data", async () => {
      const existingData = { ...HFloatingIPMock, name: "old" };
      api.getFloatingIPResult = Promise.resolve(existingData);
      const res = await sut.updateFloatingIP(1, {
        name: "old",
      });
      expect(res).toMatchObject(HFloatingIPMock);
      expect(cdk.changeset.length).toBe(0);
    });
    test("fails without data", async () => {
      const existingData = { ...HFloatingIPMock, name: "old" };
      api.getFloatingIPResult = Promise.resolve(existingData);
      const res = await sut.updateFloatingIP(1, {});
      expect(res).toMatchObject(HFloatingIPMock);
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
