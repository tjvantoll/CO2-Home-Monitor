import * as NotehubJs from "@blues-inc/notehub-js";

const projectUID = process.env.PROJECT_UID;
const defaultClient = NotehubJs.ApiClient.instance;
const api_key = defaultClient.authentications["api_key"];
api_key.apiKey = process.env.NOTEHUB_API_KEY;

const deviceApi = new NotehubJs.DeviceApi();
const eventApi = new NotehubJs.EventApi();

export type Device = {
  uid: string;
  serial_number: string;
  provisioned: string;
  product_uid: string;
  fleet_uid: string[];
  last_activity: string;
  sku: string;
  events?: Event[];
};
export type Event = {
  event: string;
  best_id: string;
  device: string;
  when: number;
  file: string;
  body: {
    co2: number;
    humidity: number;
    temp: number;
    voltage: number;
  };
};

export async function fetchDevices(): Promise<Device[]> {
  try {
    const data = await deviceApi.getProjectDevices(projectUID, {});
    const deviceUIDs = data.devices.map((device: Device) => device.uid);
    const events = await fetchEvents(deviceUIDs);

    data.devices.forEach((device: Device) => {
      device.events = events.filter((event) => event.device === device.uid);
    });

    return data.devices;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchDevice(deviceUID: string): Promise<Device | null> {
  try {
    const data = await deviceApi.getDevice(projectUID, deviceUID);
    data.events = await fetchEvents([deviceUID]);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchEvents(deviceUIDs: string[]): Promise<Event[]> {
  try {
    const data = await eventApi.getProjectEvents(projectUID, {
      files: "data.qo",
      deviceUID: deviceUIDs,
      sortBy: "captured",
      sortOrder: "desc",
      pageSize: 24 * deviceUIDs.length,
    });
    return data.events;
  } catch (error) {
    console.error(error);
    return [];
  }
}
