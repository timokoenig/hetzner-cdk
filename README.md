# Hetzner Cloud Development Kit

Unofficial Cloud Development Kit for [Hetzner Cloud](https://www.hetzner.com/cloud)

## Getting Started

### .env
```
HETZNER_AUTH_TOKEN=xxx
```

### index.js
```ts
const cdk = await CDK.init({
    namespace: "space",
    datacenter: DATACENTER.FALKENSTEIN,
});

const server = new Server({
    name: "spaceserver",
    image: "ubuntu-20.04",
    serverType: "cx11",
    dockerImage: "docker.io/library/httpd",
    healthCheck: {
      intervalInSeconds: 5,
      statusCode: 200,
    },
});
cdk.add(server);

cdk.run();
```

- Show Diff `index.js diff`
- Deploy to Hetzner Cloud `index.js deploy`
- Destroy on Hetzner Cloud `index.js destroy`

### Add SSH key to server

By default the server will create a root password that is send to you via email. It is recommended to set an SSH key to access the server.

```ts
const publicKey = PublicKey.fromFile("id_ed25519.pub");
const sshKey = new SSHKey({
    name: "spacekey",
    publicKey,
});
server.addSSHKey(sshKey);
```

### Add IP to server

By default a server will automatically create an IPv4 address, but you will be able to attach an existing Primary IP as well.

```ts
const ipv4 = new PrimaryIP({
    name: "spaceip",
    type: "ipv4"
})
server.addPrimaryIP(ipv4)
```

### Add Floating IP to server

By default a server will automatically create an IPv4 address, but you will be able to attach an existing Floating IP as well.

❗️ NOTE: Currently not implemented properly!

```ts
const ipv4 = new FloatingIP({
    name: "spaceip",
    type: "ipv4"
})
server.addFloatingIP(ipv4)
```

### Options

In some cases you might want to deploy your stack to hetzner without getting the users confirmation. In that case you can append the `--force` option to the deploy command.
