import { HFirewallType } from "./firewall";

describe("FIREWALL", () => {
  test("check enum values", async () => {
    expect(Object.keys(HFirewallType).length).toBe(2);
    expect(HFirewallType.APPLIED).toBe("applied");
    expect(HFirewallType.PENDING).toBe("pending");
  });
});
