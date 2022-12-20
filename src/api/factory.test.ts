import { CDKMock } from "../cdk/__mocks__/cdk";
import { APIFactory, APIFactoryChangeset } from "./factory";
import { FloatingIPAPI } from "./floatingip";
import { FloatingIPAPIChangeset } from "./floatingip.changeset";
import { PrimaryIPAPI } from "./primaryip";
import { PrimaryIPAPIChangeset } from "./primaryip.changeset";
import { ServerAPI } from "./server";
import { ServerAPIChangeset } from "./server.changeset";
import { SSHKeyAPI } from "./sshkey";
import { SSHKeyAPIChangeset } from "./sshkey.changeset";

describe("APIFactory", () => {
  test("succeeds", async () => {
    const sut = new APIFactory();
    expect(sut.server).toBeInstanceOf(ServerAPI);
    expect(sut.sshkey).toBeInstanceOf(SSHKeyAPI);
    expect(sut.floatingip).toBeInstanceOf(FloatingIPAPI);
    expect(sut.primaryip).toBeInstanceOf(PrimaryIPAPI);
  });
});

describe("APIFactoryChangeset", () => {
  test("succeeds", async () => {
    const sut = new APIFactoryChangeset(new CDKMock(), new APIFactory());
    expect(sut.server).toBeInstanceOf(ServerAPIChangeset);
    expect(sut.sshkey).toBeInstanceOf(SSHKeyAPIChangeset);
    expect(sut.floatingip).toBeInstanceOf(FloatingIPAPIChangeset);
    expect(sut.primaryip).toBeInstanceOf(PrimaryIPAPIChangeset);
  });
});
