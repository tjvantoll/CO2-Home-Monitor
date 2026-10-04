export interface NotehubEvent {
  uid: string;
  when: number;
  file: string;
  body: {
    co2?: number;
    temp?: number;
    humidity?: number;
    voltage?: number;
    [key: string]: number | undefined;
  };
  device: string;
  sn: string;
  best_id: string;
  transport?: string;
  product?: string;
  app?: string;
  received?: number;
  req?: string;
  fleets?: string[];
}

export interface NotehubEventsResponse {
  has_more: boolean;
  events: NotehubEvent[];
}
