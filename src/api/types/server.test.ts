import { HServerSort, HServerStatus } from "./server";

describe("Server", () => {
  test("check HServerStatus enum values", async () => {
    expect(Object.keys(HServerStatus).length).toBe(9);
    expect(HServerStatus.INITIALIZING).toBe("initializing");
    expect(HServerStatus.STARTING).toBe("starting");
    expect(HServerStatus.RUNNING).toBe("running");
    expect(HServerStatus.STOPPING).toBe("stopping");
    expect(HServerStatus.OFF).toBe("off");
    expect(HServerStatus.DELETING).toBe("deleting");
    expect(HServerStatus.REBUILDING).toBe("rebuilding");
    expect(HServerStatus.MIGRATING).toBe("migrating");
    expect(HServerStatus.UNKNOWN).toBe("unknown");
  });
  test("check HServerSort enum values", async () => {
    expect(Object.keys(HServerSort).length).toBe(9);
    expect(HServerSort.ID).toBe("id");
    expect(HServerSort.ID_ASC).toBe("id:asc");
    expect(HServerSort.ID_DESC).toBe("id:desc");
    expect(HServerSort.NAME).toBe("name");
    expect(HServerSort.NAME_ASC).toBe("name:asc");
    expect(HServerSort.NAME_DESC).toBe("name:desc");
    expect(HServerSort.CREATED).toBe("created");
    expect(HServerSort.CREATED_ASC).toBe("created:asc");
    expect(HServerSort.CREATED_DESC).toBe("created:desc");
  });
});
