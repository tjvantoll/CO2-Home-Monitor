import { Wind, Thermometer, Droplet, BatteryCharging } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardCard from "@/components/dashboard/DashboardCard";
import Header from "@/components/Header";
import { fetchDevices } from "@/lib/notehub";
import { formatDate } from "@/lib/utils";
import DashboardChartAll from "@/components/dashboard/DashboardChartAll";

// The number of seconds to wait before busting the cache and
// re-fetching the data from the server.
export const revalidate = 0;

const serialNumberMap: { [key: string]: string } = {};

export default async function Home() {
  const devices = await fetchDevices();

  devices.forEach((device) => {
    serialNumberMap[device.uid] = device.serial_number;
  });

  const eventsForChart = devices
    .map((device) => device.events)
    .flat()
    .map((event) => ({
      device: serialNumberMap[event?.device || ""],
      value: event?.body.co2 || 0,
      when: event?.when || 0,
    }));

  // Round the temperature and humidity values to two decimal places
  devices.forEach((device) => {
    if (device.events) {
      device.events.forEach((event) => {
        event.body.temp = Math.round(event.body.temp * 100) / 100;
        event.body.humidity = Math.round(event.body.humidity * 100) / 100;
      });
    }
  });

  return (
    <div>
      <Header />
      <div className="m-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {devices.map((device) => (
          <div key={device.uid}>
            <Link href={`/${device.uid}`}>
              <Card>
                <CardHeader>
                  <CardTitle>{device.serial_number}</CardTitle>
                  <CardDescription>
                    UID: {device.uid}
                    <br />
                    SKU: {device.sku}
                    <br />
                    Last Activity: {formatDate(device.last_activity)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {device.events && device.events.length > 0 && (
                    <div className="grid gap-4 grid-cols-2 xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-4">
                      <DashboardCard
                        title="CO²"
                        icon={Wind}
                        value={device.events[0].body.co2}
                      />
                      <DashboardCard
                        title="Temperature"
                        icon={Thermometer}
                        value={device.events[0].body.temp}
                      />
                      <DashboardCard
                        title="Humidity"
                        icon={Droplet}
                        value={device.events[0].body.humidity}
                      />
                      <DashboardCard
                        title="Voltage"
                        icon={BatteryCharging}
                        value={device.events[0].body.voltage}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      <hr className="my-8 mx-4" />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
        <DashboardChartAll events={eventsForChart} />
      </div>
    </div>
  );
}
