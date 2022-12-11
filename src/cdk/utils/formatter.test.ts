import chalk from "chalk";
import { Operation } from "../classes/resource";
import { formatChangesetTableRow, resourceNameFormatter } from "./formatter";

describe("formatChangesetTableRow", () => {
  test("ADD", () => {
    expect(
      formatChangesetTableRow({
        id: "1",
        operation: Operation.ADD,
        type: "type",
        value_old: undefined,
        value_new: undefined,
      })
    ).toStrictEqual([
      chalk.green("+ add"),
      chalk.green("1"),
      chalk.green("type"),
      "",
      "",
    ]);
  });
  test("MODIFY", () => {
    expect(
      formatChangesetTableRow({
        id: "1",
        operation: Operation.MODIFY,
        type: "type",
        value_old: "1",
        value_new: "2",
      })
    ).toStrictEqual([
      chalk.yellow("* modify"),
      chalk.yellow("1"),
      chalk.yellow("type"),
      chalk.yellow("1"),
      chalk.yellow("2"),
    ]);
  });
  test("DELETE", () => {
    expect(
      formatChangesetTableRow({
        id: "1",
        operation: Operation.DELETE,
        type: "type",
        value_old: undefined,
        value_new: undefined,
      })
    ).toStrictEqual([
      chalk.red("- delete"),
      chalk.red("1"),
      chalk.red("type"),
      "",
      "",
    ]);
  });
});

describe("resourceNameFormatter", () => {
  test("fails without namespace", () => {
    const mockExit = jest
      .spyOn(process, "exit")
      .mockImplementation((number) => {
        throw new Error("process.exit: " + number);
      });
    expect(() => resourceNameFormatter("", "foo")).toThrow();
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
  test("format name without special characters", () => {
    expect(resourceNameFormatter("space", "foo")).toBe("space-foo");
  });
  test("format name with special characters", () => {
    expect(resourceNameFormatter("space", "foo-bar_world")).toBe(
      "space-foo-bar-world"
    );
  });
});
