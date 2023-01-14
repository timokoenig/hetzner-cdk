import { CDK } from "hetzner-cdk";

const CLOUD_TEMPLATE = `version: 0.1.0
namespace: space
datacenter: Falkenstein
resources:
  - resourceType: Server
    name: spaceserver
    image: ubuntu-22.04
    serverType: cx11
    dockerImage: docker.io/library/httpd
    dockerPort: "80"
    healthCheck:
      intervalInSeconds: 5
      statusCode: 200
    attachedResources:
      - resourceType: PrimaryIP
        name: spaceip
        type: ipv4
`;

async function main() {
  const cdk = await CDK.import(CLOUD_TEMPLATE);
  cdk.run();
}

main().catch(console.log);
