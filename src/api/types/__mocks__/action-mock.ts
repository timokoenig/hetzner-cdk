import { HAction, HActionStatus } from "../action";

export const HActionMock: HAction = {
  command: "create",
  error: null,
  finished: null,
  id: 0,
  progress: "100",
  resources: [],
  sorted: "asc",
  status: HActionStatus.SUCCESS,
};
