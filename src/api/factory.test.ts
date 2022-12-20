import { CDKMock } from "../cdk/__mocks__/cdk";
import { APIFactory, APIFactoryChangeset } from "./factory";
import { FloatingIPAPI } from "./floatingip/floatingip";
import { FloatingIPAPIChangeset } from "./floatingip/floatingip.changeset";
import { PrimaryIPAPI } from "./primaryip/primaryip";
import { PrimaryIPAPIChangeset } from "./primaryip/primaryip.changeset";
import { ServerAPI } from "./server/server";
import { ServerAPIChangeset } from "./server/server.changeset";
import { SSHKeyAPI } from "./sshkey/sshkey";
import { SSHKeyAPIChangeset } from "./sshkey/sshkey.changeset";

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
