import chalk from "chalk";

export function logInfo(msg: string): void {
  log(chalk.yellow(msg));
}

export function logDebug(msg: string): void {
  log(chalk.gray(msg));
}

export function logSuccess(msg: string): void {
  log(chalk.green(msg));
}

export function logError(msg: string): void {
  log(chalk.red(msg));
}

function log(msg: string): void {
  const loggerEnabled = process.env.CDK_DEBUG === "1";
  if (loggerEnabled) {
    console.log(msg);
  }
}
