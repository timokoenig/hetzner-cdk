import mockAxios from "../__mocks__/axios";
import { FloatingIPAPI } from "./floatingip";
import { HActionMock } from "./mocks/action";
import { HFloatingIPMock } from "./mocks/floatingip";
import { HIPType } from "./types/floatingip";

describe("FloatingIPAPI", () => {
  let sut = new FloatingIPAPI();

  describe("getAllFloatingIPs", () => {
    test("succeeds with array", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { floating_ips: [HFloatingIPMock] },
      });
      const res = await sut.getAllFloatingIPs();
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(HFloatingIPMock);
    });

    test("succeeds with object", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { floating_ips: HFloatingIPMock },
      });
      const res = await sut.getAllFloatingIPs({});
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(HFloatingIPMock);
    });
  });

  describe("createFloatingIP", () => {
    test("succeeds", async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { floating_ip: HFloatingIPMock },
      });
      const res = await sut.createFloatingIP({
        name: "foo",
        type: HIPType.IPV4,
      });
      expect(res).toMatchObject(HFloatingIPMock);
    });
  });

  describe("deleteFloatingIP", () => {
    test("succeeds", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { floating_ip: HFloatingIPMock },
      });
      mockAxios.delete.mockResolvedValueOnce({
        data: { floating_ip: HFloatingIPMock },
      });
      const res = await sut.deleteFloatingIP(1);
      expect(res).toBeTruthy();
    });

    test("fails with protection", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: {
          floating_ip: { ...HFloatingIPMock, protection: { delete: true } },
        },
      });
      mockAxios.delete.mockResolvedValueOnce({
        data: { floating_ip: HFloatingIPMock },
      });
      const res = await sut.deleteFloatingIP(1);
      expect(res).toBeFalsy();
    });
  });

  describe("getFloatingIP", () => {
    test("succeeds", async () => {
      mockAxios.get.mockResolvedValue({
        data: { floating_ip: HFloatingIPMock },
      });
      const res = await sut.getFloatingIP(1);
      expect(res).toMatchObject(HFloatingIPMock);
    });
  });

  describe("updateFloatingIP", () => {
    test("succeeds with updated name", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { floating_ip: { ...HFloatingIPMock, name: "old" } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { floating_ip: HFloatingIPMock },
      });
      const res = await sut.updateFloatingIP(1, {
        name: "foo",
      });
      expect(res).toMatchObject(HFloatingIPMock);
    });
    test("succeeds with updated description", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { floating_ip: { ...HFloatingIPMock, description: "old" } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { floating_ip: HFloatingIPMock },
      });
      const res = await sut.updateFloatingIP(1, {
        description: "foo",
      });
      expect(res).toMatchObject(HFloatingIPMock);
    });
    test("succeeds with updated labels", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { floating_ip: { ...HFloatingIPMock, labels: { foo: "bar" } } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { floating_ip: HFloatingIPMock },
      });
      const res = await sut.updateFloatingIP(1, {
        labels: { foo: "bar" },
      });
      expect(res).toMatchObject(HFloatingIPMock);
    });
    test("fails with same data", async () => {
      const existingData = { ...HFloatingIPMock, name: "old" };
      mockAxios.get.mockResolvedValueOnce({
        data: { floating_ip: { ...HFloatingIPMock, name: "old" } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { floating_ip: HFloatingIPMock },
      });
      const res = await sut.updateFloatingIP(1, {
        name: "old",
      });
      expect(res).toMatchObject(existingData);
    });
    test("fails without data", async () => {
      const existingData = { ...HFloatingIPMock, name: "old" };
      mockAxios.get.mockResolvedValueOnce({
        data: { floating_ip: existingData },
      });
      mockAxios.put.mockResolvedValueOnce({});
      const res = await sut.updateFloatingIP(1, {
        name: "old",
      });
      expect(res).toMatchObject(existingData);
    });
  });

  describe("changeProtection", () => {
    test("succeeds", async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { action: HActionMock },
      });
      const res = await sut.changeProtection(1, {
        delete: true,
      });
      expect(res).toMatchObject(HActionMock);
    });
  });
});
