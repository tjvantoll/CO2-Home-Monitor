import {
  BatteryCharging,
  Droplet,
  Thermometer,
} from "lucide-react";
import React from "react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DashboardCharts from "@/components/dashboard/DashboardChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { fetchDevices } from "@/lib/notehub";

export default async function Home() {
  const devices = await fetchDevices();

  /*
  const daMap = devices[0].events.map((event) => {
    return {
      co2: event.body.co2,
      temp: event.body.temp,
      voltage: event.body.voltage,
      when: device.events
    };
  });
*/

  return (
    <div className="p-4">
      {devices.map((device) => (
        <Card key={device.uid}>
          <CardHeader>
            <CardTitle>{device.serial_number}</CardTitle>
            <CardDescription>
              {device.uid}, {device.sku}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {device.events && (
              <>
                <div className="flex flex-row w-full gap-x-4 mb-4">
                  <DashboardCard
                    title="CO2"
                    icon={Droplet}
                    value={device.events[0].body.co2}
                  />
                  <DashboardCard
                    title="Temperature"
                    icon={Thermometer}
                    value={device.events[0].body.temp}
                  />
                  <DashboardCard
                    title="Voltage"
                    icon={BatteryCharging}
                    value={device.events[0].body.voltage}
                  />
                </div>

                <DashboardCharts data={device.events.map((event) => {
                  return {
                    co2: event.body.co2,
                    temp: event.body.temp,
                    voltage: event.body.voltage,
                    when: event.when,
                  };
                })} />
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
