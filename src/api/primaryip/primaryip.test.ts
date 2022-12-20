import mockAxios from "../../__mocks__/axios";
import { HIPType } from "../types/floatingip";
import { HAssigneeType } from "../types/primaryip";
import { HActionMock } from "../types/__mocks__/action-mock";
import { HPrimaryIPMock } from "../types/__mocks__/primaryip-mock";
import { PrimaryIPAPI } from "./primaryip";

describe("PrimaryIPAPI", () => {
  let sut = new PrimaryIPAPI();

  describe("getAllPrimaryIPs", () => {
    test("succeeds with array", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { primary_ips: [HPrimaryIPMock] },
      });
      const res = await sut.getAllPrimaryIPs();
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(HPrimaryIPMock);
    });

    test("succeeds with object", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { primary_ips: HPrimaryIPMock },
      });
      const res = await sut.getAllPrimaryIPs({});
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(HPrimaryIPMock);
    });
  });

  describe("createPrimaryIP", () => {
    test("succeeds", async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { primary_ip: HPrimaryIPMock },
      });
      const res = await sut.createPrimaryIP({
        assignee_type: HAssigneeType.SERVER,
        name: "foo",
        type: HIPType.IPV4,
      });
      expect(res).toMatchObject(HPrimaryIPMock);
    });
  });

  describe("deletePrimaryIP", () => {
    test("succeeds", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { primary_ip: HPrimaryIPMock },
      });
      mockAxios.delete.mockResolvedValueOnce({
        data: { primary_ip: HPrimaryIPMock },
      });
      const res = await sut.deletePrimaryIP(1);
      expect(res).toBeTruthy();
    });

    test("fails with protection", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: {
          primary_ip: { ...HPrimaryIPMock, protection: { delete: true } },
        },
      });
      mockAxios.delete.mockResolvedValueOnce({
        data: { primary_ip: HPrimaryIPMock },
      });
      const res = await sut.deletePrimaryIP(1);
      expect(res).toBeFalsy();
    });
  });

  describe("getPrimaryIP", () => {
    test("succeeds", async () => {
      mockAxios.get.mockResolvedValue({
        data: { primary_ip: HPrimaryIPMock },
      });
      const res = await sut.getPrimaryIP(1);
      expect(res).toMatchObject(HPrimaryIPMock);
    });
  });

  describe("updatePrimaryIP", () => {
    test("succeeds with updated name", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { primary_ip: { ...HPrimaryIPMock, name: "old" } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { primary_ip: HPrimaryIPMock },
      });
      const res = await sut.updatePrimaryIP(1, {
        name: "foo",
      });
      expect(res).toMatchObject(HPrimaryIPMock);
    });
    test("succeeds with updated auto_delete", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { primary_ip: { ...HPrimaryIPMock, auto_delete: false } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { primary_ip: HPrimaryIPMock },
      });
      const res = await sut.updatePrimaryIP(1, {
        auto_delete: true,
      });
      expect(res).toMatchObject(HPrimaryIPMock);
    });
    test("succeeds with updated labels", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { primary_ip: { ...HPrimaryIPMock, labels: { foo: "bar" } } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { primary_ip: HPrimaryIPMock },
      });
      const res = await sut.updatePrimaryIP(1, {
        labels: { foo: "bar" },
      });
      expect(res).toMatchObject(HPrimaryIPMock);
    });
    test("fails with same data", async () => {
      const existingData = { ...HPrimaryIPMock, name: "old" };
      mockAxios.get.mockResolvedValueOnce({
        data: { primary_ip: { ...HPrimaryIPMock, name: "old" } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { primary_ip: HPrimaryIPMock },
      });
      const res = await sut.updatePrimaryIP(1, {
        name: "old",
      });
      expect(res).toMatchObject(existingData);
    });
    test("fails without data", async () => {
      const existingData = { ...HPrimaryIPMock, name: "old" };
      mockAxios.get.mockResolvedValueOnce({
        data: { primary_ip: existingData },
      });
      mockAxios.put.mockResolvedValueOnce({});
      const res = await sut.updatePrimaryIP(1, {
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
