import {
  BatteryCharging,
  Droplet,
  Thermometer,
  Wind,
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
    <div className="p-4">
      {devices.map((device) => (
        <Card key={device.uid}>
          <CardHeader>
            <CardTitle>{device.serial_number}</CardTitle>
            <CardDescription>
              UID: {device.uid}
              <br />
              SKU: {device.sku}
              <br />
              Last Activity: {new Date(device.last_activity).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {device.events && (
              <>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 sm:grid-cols-2">
                  <DashboardCard
                    title="CO2"
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

                <hr className="my-8" />

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 sm:grid-cols-2">
                  <DashboardCharts data={device.events.map((event) => {
                    return {
                      co2: event.body.co2,
                      temp: event.body.temp,
                      humidity: event.body.humidity,
                      voltage: event.body.voltage,
                      when: event.when,
                    };
                  })} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
