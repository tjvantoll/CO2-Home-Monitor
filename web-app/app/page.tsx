import { Wind, Thermometer, Droplet, BatteryCharging } from "lucide-react";
import { Link } from "next-view-transitions";
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
    <div>
      <Header />
      <div className="m-4">
        {devices.map((device) => (
          <div
            key={device.uid}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"
          >
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
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
