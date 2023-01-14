# Webserver With Password

This Hetzner CDK example will deploy an httpd webserver that is accessible with a password that Hetzner will send you via email.

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
