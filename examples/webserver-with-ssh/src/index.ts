import { CDK, DATACENTER, PrimaryIP, PublicKey, Server, SSHKey } from "hetzner-cdk";

async function main() {
  const cdk = await CDK.init({
    namespace: "space",
    datacenter: DATACENTER.FALKENSTEIN,
  });

  const server = new Server({
    name: "spaceserver",
    image: "ubuntu-22.04",
    serverType: "cx11",
    dockerImage: "docker.io/library/httpd",
    dockerPort: "80",
    healthCheck: {
      intervalInSeconds: 5,
      statusCode: 200,
    },
  });
  cdk.add(server);

  const publicKey = PublicKey.fromFile("id_ed25519.pub");
  const sshKey = new SSHKey({
    name: "spacekey",
    publicKey,
  });
  server.addSSHKey(sshKey);

  const ipv4 = new PrimaryIP({
    name: "spaceip",
    type: "ipv4",
  });
  server.addPrimaryIP(ipv4);

  cdk.run();
}

main().catch(console.log);
