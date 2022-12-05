# Hetzner Cloud Development Kit

Unofficial Cloud Development Kit for Hetzner Cloud

## Getting Started

```ts
const cdk = await CDK.init({
    namespace: "space",
    datacenter: DATACENTER.FALKENSTEIN,
});

const server = new Server({
    name: "spaceserver",
    image: "ubuntu-20.04",
    serverType: "cx11",
});
cdk.add(server);

const publicKey = PublicKey.fromFile("id_ed25519.pub");
const sshKey = new SSHKey({
    name: "spacekey",
    publicKey,
});
server.addSSHKey(sshKey);

cdk.run();
```

- Show Diff `index.js diff`
- Deploy to Hetzner Cloud `index.js deploy`
- Destroy from Hetzner Cloud `index.js destroy`

## TODOs
- [ ] Implement pagination for all requests
- [ ] Add option to either destroy only given resources or everything within the namespace
- [ ] Improve axios error handling