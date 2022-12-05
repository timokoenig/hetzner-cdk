export enum HFirewallType {
  APPLIED = "applied",
  PENDING = "pending",
}

export type HFirewall = {
  id?: number;
  status?: HFirewallType;
};
