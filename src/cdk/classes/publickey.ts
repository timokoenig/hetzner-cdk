const fs = require("fs");

export class PublicKey {
  key: string;

  constructor(key: string) {
    this.key = key;
  }

  static fromFile(file: string): PublicKey {
    const buffer = fs.readFileSync(file);
    const fileContent = buffer.toString();
    return new PublicKey(fileContent);
  }
}
