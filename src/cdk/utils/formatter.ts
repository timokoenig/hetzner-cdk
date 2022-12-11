import axios from "axios";
import chalk from "chalk";
import { Operation, ResourceChangeset } from "../classes/resource";

// Convert changeset to table row
export function formatChangesetTableRow(
  changeset: ResourceChangeset
): string[] {
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
  console.log(chalk.red("An error occurred"));
  console.log(chalk.red(err));
  if (axios.isAxiosError(err)) {
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(err.response.data);
      console.log(err.response.status);
      console.log(err.response.headers);
    } else if (err.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(err.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", err.message);
    }
  }
}

// Format resource name to ID
export function resourceNameFormatter(namespace: string, name: string): string {
  if (namespace == "") {
    console.log(chalk.red("Missing namespace"));
    process.exit(1);
  }
  return `${namespace}-${name
    .toLowerCase()
    .replace(" ", "-")
    .replace("_", "-")}`;
}
