import { HDatacenterMock } from "../api/types/__mocks__/datacenter-mock";
import mockAxios from "../__mocks__/axios";
import { CDK } from "./cdk";

describe("CDK", () => {
  test("import & export without resources", async () => {
    // Given
    mockAxios.get.mockResolvedValueOnce({
      data: { datacenters: [HDatacenterMock], recommendation: 1 },
    });
    const template = `version: 0.1.0
namespace: test
datacenter: Falkenstein
resources: []
`;

    // When Import
    const sut = await CDK.import(template);

    // Then
    expect(sut.namespace).toBe("test");
    expect(sut.datacenterName).toBe("Falkenstein");

    // When
    const res = await sut.export();

    // Then
    expect(res).toBe(template);
  });
  test("import & export with resources", async () => {
    // Given
    mockAxios.get.mockResolvedValueOnce({
      data: { datacenters: [HDatacenterMock], recommendation: 1 },
    });
    const template = `version: 0.1.0
namespace: test
datacenter: Falkenstein
resources:
  - resourceType: PrimaryIP
    name: primaryip
    type: ipv4
`;

    // When Import
    const sut = await CDK.import(template);

    // Then
    expect(sut.namespace).toBe("test");
    expect(sut.datacenterName).toBe("Falkenstein");

    // When
    const res = await sut.export();

    // Then
    expect(res).toBe(template);
  });
  test("fails import with unsupported version", async () => {
    // Given
    mockAxios.get.mockResolvedValueOnce({
      data: { datacenters: [HDatacenterMock], recommendation: 1 },
    });
    const template = `version: 0
namespace: test
datacenter: Falkenstein
resources: []
`;

    // When
    try {
      const sut = await CDK.import(template);
    } catch (error: unknown) {
      // Then
      expect(`${error}`).toBe("Error: Unsupported template version");
    }
  });
});
