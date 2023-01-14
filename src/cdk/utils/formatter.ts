import axios from "axios";
import chalk from "chalk";
import { Operation, ResourceChangeset } from "../resource/resource";
import { logError } from "./logger";

// Convert changeset to table row
export function formatChangesetTableRow(changeset: ResourceChangeset): string[] {
  const colorValue = (operation: Operation, value: string): string => {
    if (operation == Operation.ADD) {
      return chalk.green(value);
    }
    if (operation == Operation.MODIFY) {
      return chalk.yellow(value);
    }
    if (operation == Operation.DELETE) {
      return chalk.red(value);
    }
    return value;
  };

  let operation = changeset.operation.toString();
  if (operation == Operation.ADD) {
    operation = `+ ${operation}`;
  }
  if (operation == Operation.MODIFY) {
    operation = `* ${operation}`;
  }
  if (operation == Operation.DELETE) {
    operation = `- ${operation}`;
  }

  return [
    colorValue(changeset.operation, operation),
    colorValue(changeset.operation, changeset.id),
    colorValue(changeset.operation, changeset.type),
    colorValue(changeset.operation, changeset.value_old ?? ""),
    colorValue(changeset.operation, changeset.value_new ?? ""),
  ];
}

// Print error message
export function showError(err: Error): void {
  logError("An error occurred");
  if (axios.isAxiosError(err)) {
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logError(err.response.data);
      logError(`${err.response.status}`);
    } else if (err.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      logError(err.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      logError(`Error ${err.message}`);
    }
  } else {
    logError(`${err}`);
  }
}

// Format resource name to ID
export function resourceNameFormatter(namespace: string, name: string): string {
  if (namespace == "") {
    logError("[Formatter] Missing namespace");
    process.exit(1);
  }
  return `${namespace}-${name.toLowerCase().replace(" ", "-").replace("_", "-")}`;
}

// Format docker image to include version if it does not exist
export function formatDockerImage(dockerImage: string): string {
  const imageParts = dockerImage.split(":");
  let version = "latest";
  if (imageParts.length == 1) {
    dockerImage = `${dockerImage}:${version}`;
  } else if (imageParts.length == 2) {
    version = imageParts[1];
  } else if (imageParts.length > 2) {
    throw new Error("Invalid docker image version");
  }
  return dockerImage;
}

// Extract docker image version from string
export function extractDockerImageVersion(dockerImage: string): string {
  const imageParts = dockerImage.split(":");
  if (imageParts.length == 2) {
    return imageParts[1];
  }
  return "latest";
}
