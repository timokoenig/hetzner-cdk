import mockAxios from "../__mocks__/axios";
import { HActionMock } from "./mocks/action";
import { HServerMock } from "./mocks/server";
import { ServerAPI } from "./server";

describe("ServerAPI", () => {
  let sut = new ServerAPI();

  describe("getAllServers", () => {
    test("succeeds with array", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { servers: [HServerMock] },
      });
      const res = await sut.getAllServers();
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(HServerMock);
    });
  });

  describe("createServer", () => {
    test("succeeds", async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { server: HServerMock },
      });
      const res = await sut.createServer({
        image: "iamge",
        name: "foo",
        server_type: "",
      });
      expect(res).toMatchObject(HServerMock);
    });
  });

  describe("deleteServer", () => {
    test("succeeds", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { server: HServerMock },
      });
      mockAxios.delete.mockResolvedValueOnce({
        data: { server: HServerMock },
      });
      const res = await sut.deleteServer(1);
      expect(res).toBeTruthy();
    });

    test("fails with protection", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: {
          server: { ...HServerMock, protection: { delete: true } },
        },
      });
      mockAxios.delete.mockResolvedValueOnce({
        data: { server: HServerMock },
      });
      const res = await sut.deleteServer(1);
      expect(res).toBeFalsy();
    });
  });

  describe("getServer", () => {
    test("succeeds", async () => {
      mockAxios.get.mockResolvedValue({
        data: { server: HServerMock },
      });
      const res = await sut.getServer(1);
      expect(res).toMatchObject(HServerMock);
    });
  });

  describe("updateServer", () => {
    test("succeeds with updated name", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { server: { ...HServerMock, name: "old" } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { server: HServerMock },
      });
      const res = await sut.updateServer(1, {
        name: "foo",
      });
      expect(res).toMatchObject(HServerMock);
    });
    test("succeeds with updated labels", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { server: { ...HServerMock, labels: { foo: "bar" } } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { server: HServerMock },
      });
      const res = await sut.updateServer(1, {
        labels: { foo: "bar" },
      });
      expect(res).toMatchObject(HServerMock);
    });
    test("fails with same data", async () => {
      const existingData = { ...HServerMock, name: "old" };
      mockAxios.get.mockResolvedValueOnce({
        data: { server: { ...HServerMock, name: "old" } },
      });
      mockAxios.put.mockResolvedValueOnce({
        data: { server: HServerMock },
      });
      const res = await sut.updateServer(1, {
        name: "old",
      });
      expect(res).toMatchObject(existingData);
    });
    test("fails without data", async () => {
      const existingData = { ...HServerMock, name: "old" };
      mockAxios.get.mockResolvedValueOnce({
        data: { server: existingData },
      });
      mockAxios.put.mockResolvedValueOnce({});
      const res = await sut.updateServer(1, {
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
        rebuild: true,
      });
      expect(res).toMatchObject(HActionMock);
    });
  });
});
