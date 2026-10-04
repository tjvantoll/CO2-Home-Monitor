export interface NotehubEvent {
  when: number;
  body: {
    co2?: number;
    temp?: number;
    humidity?: number;
    voltage?: number;
    [key: string]: number | undefined;
  };
  device: string;
  best_id?: string;
}

export interface NotehubEventsResponse {
  has_more: boolean;
  events: NotehubEvent[];
}
