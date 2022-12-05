export type HPagination = {
  page: number;
  per_page: number;
  previous_page: number;
  next_page: number;
  last_page: number;
  total_entries: number;
};

export type HMeta = {
  pagination: HPagination;
};
