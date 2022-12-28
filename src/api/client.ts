import axios, { AxiosResponse } from "axios";
import dotenv from "dotenv";
import { logDebug, logError } from "../cdk/utils/logger";

dotenv.config();

const authToken = process.env.HETZNER_AUTH_TOKEN;
if (!authToken) {
  logError(`Missing environment variable 'HETZNER_AUTH_TOKEN'`);
  process.exit(1);
}

// Set config defaults when creating the instance
const client = axios.create({
  baseURL: "https://api.hetzner.cloud/v1",
});

// Alter defaults after instance has been created
client.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

// Request interceptor to log request
client.interceptors.request.use(
  (config) => {
    logDebug(`[Axios] ${config.method?.toUpperCase()}: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to log response
client.interceptors.response.use((response: AxiosResponse) => {
  if (response.status >= 400) {
    logError(
      `[${response.request?.method}] ${response.status} ${response.request?.path} ${response.statusText}`
    );
  }
  return response;
});

export default client;
