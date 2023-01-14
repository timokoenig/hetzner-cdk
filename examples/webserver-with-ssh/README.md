# Webserver With SSH

This Hetzner CDK example will deploy an httpd webserver that is accessible via SSH.

First create a `.env` file and add your Hetzner API Token.

```
HETZNER_AUTH_TOKEN=kxxx
```

Then copy your public SSH key into this folder and adjust the file name in `src/index.ts`.

Finally run the following commands to deploy the webserver.

```
npm install
npm run build
node dist/index.js deploy
```

After the deployment is done, the CDK will give you the public IP of that server.

To access the server type in `ssh root@[SERVER-IP]`.
