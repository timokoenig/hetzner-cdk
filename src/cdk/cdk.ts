import chalk from "chalk";
import Table from "cli-table";
import { program } from "commander";
import yesno from "yesno";
import { getAllDatacenters } from "../api/datacenter";
import { APIFactory, APIFactoryChangeset, IAPIFactory } from "../api/factory";
import { DATACENTER, HDatacenter } from "../api/types/datacenter";
import { FloatingIP } from "./classes/floatingip";
import { PrimaryIP } from "./classes/primaryip";
import { Resource, ResourceChangeset } from "./classes/resource";
import { Server } from "./classes/server";
import { SSHKey } from "./classes/sshkey";
import { formatChangesetTableRow, showError } from "./utils/formatter";

const CDK_VERSION = "0.1.0";

const ALL_AVAILABLE_RESOURCES = [Server, SSHKey, PrimaryIP, FloatingIP];

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
  add(resource: Resource): void;
}

type Config = {
  namespace: string;
  datacenter: DATACENTER;
};

export class CDK implements ICDK {
  private _resources: Resource[] = [];
  mode: CDKMode = CDKMode.DIFF;
  namespace: string;
  datacenter: HDatacenter;
  changeset: ResourceChangeset[] = [];

  private constructor(namespace: string, datacenter: HDatacenter) {
    this.namespace = namespace;
    this.datacenter = datacenter;
  }

  static async init(config: Config): Promise<CDK> {
    const datacenter = await CDK.loadDatacenter(config.datacenter);
    return new CDK(config.namespace, datacenter);
  }

  run(): void {
    console.log("🛠 ", chalk.bold("Hetzner Cloud Development Kit (CDK)"));
    console.log(`Version ${CDK_VERSION}\n`);

    program.name("cdk");

    program
      .command("deploy")
      .description("deploy infrastructure")
      .option("--debug", "enable debug output")
      .action((options: { debug?: boolean }) => {
        this._enableDebug(options.debug);
        this._runDeploy().catch(showError);
      });

    program
      .command("destroy")
      .description("destroy infrastructure")
      .option("--all", "delete everything within the namespace")
      .option("--debug", "enable debug output")
      .action((options: { all?: boolean; debug?: boolean }) => {
        this._enableDebug(options.debug);
        this._runDestroy(options.all).catch(showError);
      });

    program
      .command("diff")
      .description("show diff of new and existing infrastructure")
      .option("--debug", "enable debug output")
      .action((options: { debug?: boolean }) => {
        this._enableDebug(options.debug);
        this._runDiff().catch(showError);
      });

    program.parse();
  }

  // Add resource to cdk
  add(resource: Resource): void {
    resource.cdk = this;
    this._resources.push(resource);
  }

  // Deploy infrastructure
  private async _runDeploy(): Promise<void> {
    console.log(
      chalk.green(`Start deployment of ${chalk.bold(this.namespace)}`)
    );
    try {
      const res = await this._generateChangesetDeployment();
      if (!res) return; // do not continue without change

      const ok = await yesno({
        question: chalk.yellow("Do you want to deploy the changes?"),
      });
      if (!ok) return;

      const apiFactory = new APIFactory();
      await Promise.all(this._resources.map((obj) => obj.apply(apiFactory)));
      await this._deleteUnusedResources(apiFactory);

      console.log(chalk.green("Deployment complete"));
      await this._showPublicServerIPs();
    } catch (err: unknown) {
      console.log(chalk.red("Deployment failed"));
      showError(err as Error);
    }
  }

  // Destory infrastructure
  private async _runDestroy(all: boolean | undefined): Promise<void> {
    const apiFactory = new APIFactory();
    let localResources: Resource[] = [];

    if (all) {
      // *all* will delete everything within the namespace
      // TODO add implementation
      console.log(chalk.yellow("Not implemented"));
      process.exit(1);
    } else {
      // Only delete resources from given project
      localResources = this._resources
        .map((obj) => [obj, ...obj.getAttachedResources()])
        .flatMap((obj) => obj);
    }

    const res = await this._generateChangesetDestroy(localResources);
    if (!res) return; // do not continue without change

    const ok = await yesno({
      question: chalk.yellow("Do you want to destroy the resources?"),
    });
    if (!ok) return;

    // First delete servers and ssh keys
    const otherResources = localResources.filter(
      (obj) => !(obj instanceof FloatingIP) && !(obj instanceof PrimaryIP)
    );
    await Promise.all(otherResources.map((obj) => obj.delete(apiFactory)));

    // Then delete the IPs
    const ipResources = localResources.filter(
      (obj) => obj instanceof FloatingIP || obj instanceof PrimaryIP
    );
    await Promise.all(ipResources.map((obj) => obj.delete(apiFactory)));

    console.log(chalk.green("Done"));
  }

  // Show diff of new and existing infrastructure
  private async _runDiff(): Promise<void> {
    await this._generateChangesetDeployment();
  }

  // Generate changeset for deployment
  private async _generateChangesetDeployment(): Promise<boolean> {
    // Use APIFactoryChangeset to mock all create/update/delete functions and create changeset entries
    const apiFactoryChangeset = new APIFactoryChangeset(this);
    await Promise.all(
      this._resources.map((obj) => obj.apply(apiFactoryChangeset))
    );
    await this._deleteUnusedResources(apiFactoryChangeset);

    if (this.changeset.length == 0) {
      console.log(chalk.green("Heztner Cloud Infrastructure is up-to-date"));
      return false;
    }

    // Print changeset table
    var table = new Table({
      head: ["Operation", "ID", "Resource", "Old", "New"].map((obj) =>
        chalk.white(obj)
      ),
    });
    this.changeset
      .map(formatChangesetTableRow)
      .forEach((obj) => table.push(obj));
    console.log(table.toString());

    return true;
  }

  // Generate changeset for all resources that are about the get destroyed
  private async _generateChangesetDestroy(
    localResources: Resource[]
  ): Promise<boolean> {
    // Use APIFactoryChangeset to mock all create/update/delete functions and create changeset entries
    const apiFactoryChangeset = new APIFactoryChangeset(this);
    await Promise.all(
      localResources.map((obj) => obj.delete(apiFactoryChangeset))
    );

    if (this.changeset.length == 0) {
      console.log(chalk.green("Nothing to destroy"));
      return false;
    }

    // Print changeset table
    var table = new Table({
      head: ["Operation", "ID", "Resource", "Old", "New"].map((obj) =>
        chalk.white(obj)
      ),
    });
    this.changeset
      .map(formatChangesetTableRow)
      .forEach((obj) => table.push(obj));
    console.log(table.toString());

    return true;
  }

  // Enable or disable debug output
  private _enableDebug(debug: boolean | undefined): void {
    process.env.CDK_DEBUG = debug ? "1" : "0";
  }

  // Load selected datacenter
  private static async loadDatacenter(name: DATACENTER): Promise<HDatacenter> {
    const allDatacenters = await getAllDatacenters();
    const datacenter = allDatacenters.datacenters.find((obj) =>
      obj.description.includes(name)
    );
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
            .filter(
              (obj) => (obj as Object).constructor.name == resourceClass.name
            )
            .map((obj) => obj.getName()),
          this.namespace,
          apiFactory
        )
      )
    );
  }

  // Show all public server IPs
  private async _showPublicServerIPs(): Promise<void> {
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
