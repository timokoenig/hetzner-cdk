import { DATACENTER } from "./datacenter";

describe("DATACENTER", () => {
  test("check enum values", async () => {
    expect(Object.keys(DATACENTER).length).toBe(4);
    expect(DATACENTER.ASHBURN).toBe("Ashburn");
    expect(DATACENTER.FALKENSTEIN).toBe("Falkenstein");
    expect(DATACENTER.HELSINKI).toBe("Helsinki");
    expect(DATACENTER.NUREMBERG).toBe("Nuremberg");
  });
});
