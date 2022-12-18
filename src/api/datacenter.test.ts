import mockAxios from "../__mocks__/axios";
import { getAllDatacenters } from "./datacenter";
import { HDatacenterMock } from "./mocks/datacenter";

describe("Datacenter", () => {
  describe("getAllDatacenters", () => {
    test("succeeds with array", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: { datacenters: [HDatacenterMock], recommendation: 1 },
      });
      const res = await getAllDatacenters();
      expect(res.datacenters.length).toBe(1);
      expect(res.datacenters[0]).toMatchObject(HDatacenterMock);
      expect(res.recommendation).toBe(1);
    });
  });
});
