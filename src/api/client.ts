import axios, { AxiosResponse } from "axios";
import { exit } from "process";
const chalk = require("chalk");

const authToken = process.env.HETZNER_AUTH_TOKEN;
if (!authToken) {
  console.log(chalk.red(`Missing environment variable 'HETZNER_AUTH_TOKEN'`));
  exit(1);
}

// Set config defaults when creating the instance
const client = axios.create({
  baseURL: "https://api.hetzner.cloud/v1",
});

// Alter defaults after instance has been created
client.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

// Response interceptor to log requests
client.interceptors.response.use((response: AxiosResponse) => {
  if (response.status >= 400) {
    console.log(
      chalk.red(
        `[${response.request?.method}]`,
        response.status,
        response.request?.path,
        response.statusText
      )
    );
  } else {
    if (process.env.CDK_DEBUG == "1") {
      console.log(
        chalk.gray(
          `[${response.request?.method}]`,
          response.status,
          response.request?.path
        )
      );
    }
  }
  return response;
});

export default client;
