import chalk from "chalk";
import Table from "cli-table";
import { program } from "commander";
import * as yaml from "yaml";
import yesno from "yesno";
import { getAllDatacenters } from "../api/datacenter/datacenter";
import { APIFactory, APIFactoryChangeset, IAPIFactory } from "../api/factory";
import { DATACENTER, HDatacenter } from "../api/types/datacenter";
import { FloatingIP } from "./resource/floatingip";
import { PrimaryIP } from "./resource/primaryip";
import { Resource, ResourceChangeset } from "./resource/resource";
import { Server } from "./resource/server";
import { SSHKey } from "./resource/sshkey";
import { formatChangesetTableRow, showError } from "./utils/formatter";
import { logError, logInfo, logSuccess } from "./utils/logger";

const CDK_VERSION = "__packageJsonVersion__";

const ALL_AVAILABLE_RESOURCES = [PrimaryIP, FloatingIP, Server, SSHKey];

export enum CDKMode {
  DIFF,
  DEPLOY,
}

export interface ICDK {
  mode: CDKMode;
  namespace: string;
  datacenter: HDatacenter;
  changeset: ResourceChangeset[];
  run(): void;
  runDiff(options?: { debug?: boolean }): Promise<void>;
  runDeploy(options?: { debug?: boolean; force?: boolean }): Promise<void>;
  runDestroy(options?: { debug?: boolean; all?: boolean }): Promise<void>;
  add(resource: Resource): void;
  export(): Promise<string>;
}

type Config = {
  namespace: string;
  datacenter: DATACENTER;
};

export class CDK implements ICDK {
  private _resources: Resource[] = [];
  mode: CDKMode = CDKMode.DIFF;
  namespace: string;
  datacenterName: string;
  datacenter: HDatacenter;
  changeset: ResourceChangeset[] = [];

  private constructor(namespace: string, datacenterName: string, datacenter: HDatacenter) {
    this.namespace = namespace;
    this.datacenterName = datacenterName;
    this.datacenter = datacenter;
  }

  static async init(config: Config): Promise<CDK> {
    const datacenter = await CDK.loadDatacenter(config.datacenter);
    return new CDK(config.namespace, config.datacenter, datacenter);
  }

  run(): void {
    console.log("🛠 ", chalk.bold("Hetzner Cloud Development Kit (CDK)"));
    console.log(`Version ${CDK_VERSION}\n`);

    program.name("cdk");

    program
      .command("deploy")
      .description("deploy infrastructure")
      .option("--debug", "enable debug output")
      .option("--force", "force deployment without users confirmation")
      .action((options: { debug?: boolean; force?: boolean }) =>
        this.runDeploy(options).catch(showError)
      );

    program
      .command("destroy")
      .description("destroy infrastructure")
      .option("--all", "delete everything within the namespace")
      .option("--debug", "enable debug output")
      .action((options: { all?: boolean; debug?: boolean }) =>
        this.runDestroy(options).catch(showError)
      );

    program
      .command("diff")
      .description("show diff of new and existing infrastructure")
      .option("--debug", "enable debug output")
      .action((options: { debug?: boolean }) => this.runDiff(options).catch(showError));

    program.parse();
  }

  runDiff(options?: { debug?: boolean }): Promise<void> {
    this._enableDebug(options?.debug);
    return this._runDiff();
  }

  runDeploy(options?: { debug?: boolean; force?: boolean }): Promise<void> {
    this._enableDebug(options?.debug);
    this._enableForce(options?.force);
    return this._runDeploy();
  }

  runDestroy(options?: { debug?: boolean; all?: boolean }): Promise<void> {
    this._enableDebug(options?.debug);
    return this._runDestroy(options?.all);
  }

  // Add resource to cdk
  add(resource: Resource): void {
    resource.cdk = this;
    this._resources.push(resource);
  }

  static async import(template: string): Promise<CDK> {
    const obj = yaml.parse(template);
    if (obj.version !== "0.1.0") throw new Error("Unsupported template version");
    const cdk = await CDK.init({
      namespace: obj.namespace,
      datacenter: obj.datacenter,
    });
    cdk._resources = await Promise.all(
      obj.resources.map((resource: any) => {
        if (resource.resourceType === "Server") {
          return Server.import(cdk, resource);
        } else if (resource.resourceType === "SSHKey") {
          return SSHKey.import(cdk, resource);
        } else if (resource.resourceType === "PrimaryIP") {
          return PrimaryIP.import(cdk, resource);
        } else if (resource.resourceType === "FloatingIP") {
          return FloatingIP.import(cdk, resource);
        } else {
          throw new Error("[CDK] Unsupported resource type");
        }
      })
    );
    return cdk;
  }

  async export(): Promise<string> {
    const resources = await Promise.all(this._resources.map((resource) => resource.export()));
    return yaml.stringify({
      version: "0.1.0",
      namespace: this.namespace,
      datacenter: this.datacenterName,
      resources,
    });
  }

  // Deploy infrastructure
  private async _runDeploy(): Promise<void> {
    logSuccess(`[CDK] Start deployment of ${chalk.bold(this.namespace)}`);
    try {
      // Skip deployment changeset when user enables force option
      if (process.env.CDK_FORCE == "1") {
        logInfo("[CDK] Skip changeset due to --force");
      } else {
        logInfo("[CDK] Generate changeset");

        const res = await this._generateChangesetDeployment();
        if (!res) return; // do not continue without change

        const ok = await yesno({
          question: chalk.yellow("Do you want to deploy the changes? (y/n)"),
        });
        if (!ok) return;
      }

      logInfo("[CDK] Start applying changes");
      const apiFactory = new APIFactory();
      await Promise.all(this._resources.map((obj) => obj.apply(apiFactory)));

      logInfo("[CDK] Delete unused resources");
      await this._deleteUnusedResources(apiFactory);

      logSuccess("[CDK] Deployment complete");
      await this._showPublicServerIPs();
    } catch (err: unknown) {
      logError("[CDK] Deployment failed");
      showError(err as Error);
    }
  }

  // Destory infrastructure
  private async _runDestroy(all: boolean | undefined): Promise<void> {
    logSuccess(`[CDK] Start destroying ${chalk.bold(this.namespace)}`);

    const apiFactory = new APIFactory();
    let localResources: Resource[] = [];

    if (all) {
      // *all* will delete everything within the namespace
      // TODO add implementation
      logError("Not implemented");
      process.exit(1);
    } else {
      logInfo("[CDK] Delete only given resources");
      // Only delete resources from given project
      localResources = this._resources
        .map((obj) => [obj, ...obj.getAttachedResources()])
        .flatMap((obj) => obj)
        .sort((a, b) => {
          // Delete FloatingIP after Server
          if (a instanceof Server && b instanceof FloatingIP) {
            return -1;
          }
          // Delete PrimaryIP after Server
          if (a instanceof Server && b instanceof PrimaryIP) {
            return -1;
          }
          // Delete SSHKey after Server
          if (a instanceof Server && b instanceof SSHKey) {
            return -1;
          }
          return 0;
        });
    }

    logInfo("[CDK] Generate changeset");

    const res = await this._generateChangesetDestroy(localResources);
    if (!res) {
      logSuccess("[CDK] Done");
      return; // do not continue without change
    }

    const ok = await yesno({
      question: chalk.yellow("Do you want to destroy the resources? (y/n)"),
    });
    if (!ok) {
      logError("[CDK] Abort");
      return;
    }

    logInfo("[CDK] Start deleting resources");
    for (const localResource of localResources) {
      await localResource.delete(apiFactory);
    }

    logSuccess("[CDK] Done");
  }

  // Show diff of new and existing infrastructure
  private async _runDiff(): Promise<void> {
    logInfo("[CDK] Generate changeset");
    await this._generateChangesetDeployment();
  }

  // Generate changeset for deployment
  private async _generateChangesetDeployment(): Promise<boolean> {
    // Disable logger for changeset
    const previousDebugMode = process.env.CDK_DEBUG;
    process.env.CDK_DEBUG = "0";

    // Use APIFactoryChangeset to mock all create/update/delete functions and create changeset entries
    const apiFactoryChangeset = new APIFactoryChangeset(this, new APIFactory());
    await Promise.all(this._resources.map((obj) => obj.apply(apiFactoryChangeset)));
    await this._deleteUnusedResources(apiFactoryChangeset);

    // Reset logger to previous mode
    process.env.CDK_DEBUG = previousDebugMode;

    if (this.changeset.length == 0) {
      logSuccess("[CDK] Heztner Cloud Infrastructure is up-to-date");
      return false;
    }

    // Print changeset table
    var table = new Table({
      head: ["Operation", "ID", "Resource", "Old", "New"].map((obj) => chalk.white(obj)),
    });
    this.changeset.map(formatChangesetTableRow).forEach((obj) => table.push(obj));
    console.log(table.toString());

    return true;
  }

  // Generate changeset for all resources that are about the get destroyed
  private async _generateChangesetDestroy(localResources: Resource[]): Promise<boolean> {
    // Disable logger for changeset
    const previousDebugMode = process.env.CDK_DEBUG;
    process.env.CDK_DEBUG = "0";

    // Use APIFactoryChangeset to mock all create/update/delete functions and create changeset entries
    const apiFactoryChangeset = new APIFactoryChangeset(this, new APIFactory());
    await Promise.all(localResources.map((obj) => obj.delete(apiFactoryChangeset)));

    // Reset logger to previous mode
    process.env.CDK_DEBUG = previousDebugMode;

    if (this.changeset.length == 0) {
      logSuccess("[CDK] Nothing to destroy");
      return false;
    }

    // Print changeset table
    var table = new Table({
      head: ["Operation", "ID", "Resource", "Old", "New"].map((obj) => chalk.white(obj)),
    });
    this.changeset.map(formatChangesetTableRow).forEach((obj) => table.push(obj));
    console.log(table.toString());

    return true;
  }

  // Enable or disable debug output
  private _enableDebug(debug: boolean | undefined): void {
    logInfo(`[CDK] ${debug ? "Debug enabled" : "Debug disabled"}`);
    process.env.CDK_DEBUG = debug ? "1" : "0";

    if (!debug) {
      console.log(chalk.yellow("[CDK] Please wait...\n"));
    }
  }

  // Enable force deployment that disables the users input
  private _enableForce(force: boolean | undefined): void {
    logInfo(`[CDK] ${force ? "Force enabled" : "Force disabled"}`);
    process.env.CDK_FORCE = force ? "1" : "0";
  }

  // Load selected datacenter
  private static async loadDatacenter(name: DATACENTER): Promise<HDatacenter> {
    logInfo(`[CDK] Load Datacenter ${name}`);
    const allDatacenters = await getAllDatacenters();
    const datacenter = allDatacenters.datacenters.find((obj) => obj.description.includes(name));
    if (!datacenter) throw new Error(`Datacenter '${name}' not found`);
    return datacenter;
  }

  // Delete all resources that are not used anymore
  private async _deleteUnusedResources(apiFactory: IAPIFactory): Promise<void> {
    const localResources = this._resources
      .map((obj) => [obj, ...obj.getAttachedResources()])
      .flatMap((obj) => obj);

    await Promise.all(
      ALL_AVAILABLE_RESOURCES.map((resourceClass) =>
        resourceClass.deleteUnusedResources(
          localResources
            .filter((obj) => (obj as Object).constructor.name == resourceClass.name)
            .map((obj) => obj.getName()),
          this.namespace,
          apiFactory
        )
      )
    );
  }

  // Show all public server IPs
  private async _showPublicServerIPs(): Promise<void> {
    logInfo(`[CDK] Retrieve public IPs from the server`);

    const factory = new APIFactory();
    const servers = await factory.server.getAllServers({
      label_selector: `namespace=${this.namespace}`,
    });

    // Print IP table
    console.log(`\n${chalk.bold("Public IPs")}`);
    var table = new Table({
      head: ["Name", "IP", "Type"].map((obj) => chalk.white(obj)),
    });
    servers.forEach((obj) => {
      if (obj.public_net.ipv4) {
        table.push([obj.name, obj.public_net.ipv4.ip, "ipv4"]);
      }
      if (obj.public_net.ipv6) {
        table.push([obj.name, obj.public_net.ipv6.ip, "ipv6"]);
      }
    });
    console.log(table.toString());
  }
}
