import { PublicKey } from "./publickey";

describe("PublicKey", () => {
  test("import public key from file", async () => {
    const sut = PublicKey.fromFile("./package.json");
    expect(sut.key.length).not.toBe(0);
  });
  test("fails import with missing file", async () => {
    try {
      const sut = PublicKey.fromFile("./missing-file.ts");
      fail("should fail with missing file");
    } catch (err: unknown) {
      expect(`${err}`).toBe(
        "Error: ENOENT: no such file or directory, open './missing-file.ts'"
      );
    }
  });
});
