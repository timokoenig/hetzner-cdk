import { defaultCloudConfig } from "./cloudconfig";

describe("defaultCloudConfig", () => {
  test("succeeds", () => {
    const sut = defaultCloudConfig("docker.io/library/httpd:latest");
    expect(sut).toBe(`#cloud-config
packages:
  - ufw
  - podman
package_update: true
package_upgrade: true
runcmd:
  - ufw default deny incoming
  - ufw default allow outgoing
  - ufw allow 80
  - ufw allow ssh
  - sed -i "$ a DEFAULT_FORWARD_POLICY=\\"ACCEPT\\"" /etc/default/ufw
  - ufw enable
  - ufw reload
  - podman pull docker.io/library/httpd:latest
  - podman run -dt -p 80:80/tcp docker.io/library/httpd:latest
`);
  });
});
