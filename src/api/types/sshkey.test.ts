import { HSSHKeySort } from "./sshkey";

describe("SSHKEY", () => {
  test("check enum values", async () => {
    expect(Object.keys(HSSHKeySort).length).toBe(9);
    expect(HSSHKeySort.ID).toBe("id");
    expect(HSSHKeySort.ID_ASC).toBe("id:asc");
    expect(HSSHKeySort.ID_DESC).toBe("id:desc");
    expect(HSSHKeySort.NAME).toBe("name");
    expect(HSSHKeySort.NAME_ASC).toBe("name:asc");
    expect(HSSHKeySort.NAME_DESC).toBe("name:desc");
    expect(HSSHKeySort.CREATED).toBe("created");
    expect(HSSHKeySort.CREATED_ASC).toBe("created:asc");
    expect(HSSHKeySort.CREATED_DESC).toBe("created:desc");
  });
});
