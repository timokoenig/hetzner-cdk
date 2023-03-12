import * as yaml from "yaml";
import { ServerOptions } from "../resource/server";

function createDockerComposeData(options: ServerOptions): string {
  return Buffer.from(
    `version: "2"

services:
  web:
    image: ${options.dockerImage}
    restart: always
    expose:
      - ${options.dockerPort}
    environment:
      - VIRTUAL_HOST=${options.ssl?.host}
      - VIRTUAL_PORT=${options.dockerPort}
      - LETSENCRYPT_HOST=${options.ssl?.host}
      - LETSENCRYPT_EMAIL=${options.ssl?.letsEncryptEmail}

  nginx-proxy:
    image: nginxproxy/nginx-proxy:latest
    restart: always
    depends_on:
      - web
    ports:
      - 80:80
      - 443:443
    volumes:
      - certs:/etc/nginx/certs
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - /var/run/docker.sock:/tmp/docker.sock:ro
    environment:
      - DEFAULT_HOST=${options.ssl?.host}

  nginx-proxy-acme:
    image: nginxproxy/acme-companion
    restart: always
    depends_on:
      - nginx-proxy
    volumes_from:
      - nginx-proxy
    volumes:
      - certs:/etc/nginx/certs:rw
      - acme:/etc/acme.sh
      - /var/run/docker.sock:/var/run/docker.sock:ro

volumes:
  vhost:
  html:
  certs:
  acme:

`
  ).toString("base64");
}

export function defaultCloudConfig(options: ServerOptions): string {
  const dockerComposeData = createDockerComposeData(options);
  let commands = [
    "ufw default deny incoming",
    "ufw default allow outgoing",
    "ufw allow 80",
    "ufw allow 443",
    "ufw allow ssh",
    'sed -i "$ a DEFAULT_FORWARD_POLICY=\\"ACCEPT\\"" /etc/default/ufw',
    "ufw enable",
    "ufw reload",
    "mkdir app && cd app",
    `echo "${dockerComposeData}" | base64 -d > docker-compose.yml`,
  ];

  // Sign into Docker to access private repositories
  const dockerUsername = process.env.HETZNER_DOCKER_USERNAME;
  const dockerToken = process.env.HETZNER_DOCKER_TOKEN;
  const dockerRegistry = process.env.HETZNER_DOCKER_REGISTRY ?? "";
  if (dockerUsername && dockerToken) {
    commands.push(`docker login -u ${dockerUsername} -p ${dockerToken} ${dockerRegistry}`);
  }

  commands.push("docker-compose up -d");

  const configYaml = yaml.stringify(
    {
      packages: ["ufw", "docker", "docker-compose"],
      package_update: true,
      package_upgrade: true,
      runcmd: commands,
    },
    { lineWidth: -1 }
  );

  return `#cloud-config\n${configYaml}`;
}
