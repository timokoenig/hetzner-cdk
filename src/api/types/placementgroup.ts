export enum HPlacementGroupType {
  SPREAD = "spread",
}

export type HPlacementGroup = {
  created: string;
  id: number;
  labels: { [key: string]: string };
  name: string;
  servers: number[];
  type: HPlacementGroupType;
};
