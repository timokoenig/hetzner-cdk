// Sleep for x seconds
export function sleep(seconds: number) {
  if (process.env.NODE_ENV === "test") {
    // Do not sleep in unit tests
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
