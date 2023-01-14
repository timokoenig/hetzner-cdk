# Cloud Template IMport

This Hetzner CDK example will import a given cloud template and deploy an httpd webserver.

First create a `.env` file and add your Hetzner API Token.

```
HETZNER_AUTH_TOKEN=kxxx
```

Then run the following commands to deploy the webserver.

```
npm install
npm run build
node dist/index.js deploy
```

After the deployment is done, the CDK will give you the public IP of that server.
