import { HPlacementGroupType } from "./placementgroup";

describe("PLACEMENTGROUP", () => {
  test("check enum values", async () => {
    expect(Object.keys(HPlacementGroupType).length).toBe(1);
    expect(HPlacementGroupType.SPREAD).toBe("spread");
  });
});
