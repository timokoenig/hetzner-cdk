import * as yaml from "yaml";

export function defaultCloudConfig(dockerImage: string): string {
  const configYaml = yaml.stringify({
    packages: ["ufw", "podman"],
    package_update: true,
    package_upgrade: true,
    runcmd: [
      "ufw default deny incoming",
      "ufw default allow outgoing",
      "ufw allow 80",
      "ufw allow ssh",
      'sed -i "$ a DEFAULT_FORWARD_POLICY=\\"ACCEPT\\"" /etc/default/ufw',
      "ufw enable",
      "ufw reload",
      `podman pull ${dockerImage}`,
      `podman run -dt -p 80:80/tcp ${dockerImage}`,
    ],
  });

  return `#cloud-config\n${configYaml}`;
}
