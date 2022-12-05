import { HError } from "./error";
import { HResource } from "./resource";

export enum HActionStatus {
  SUCCESS = "success",
  RUNNING = "sunning",
  ERROR = "error",
}

export type HAction = {
  command: string;
  error: HError | null;
  finished: string | null;
  id: number;
  progress: string;
  resources: HResource | HResource[];
  sorted: string;
  status: HActionStatus;
};
