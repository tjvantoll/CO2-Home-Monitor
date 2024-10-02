import {
  BatteryCharging,
  Droplet,
  LucideIcon,
  Thermometer,
} from "lucide-react";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchDevices } from "@/lib/notehub";

const DashboardCard = ({
  title,
  icon: Icon,
  value,
}: {
  title: string;
  icon: LucideIcon;
  value: string | number;
}) => (
  <Card className="flex-1">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default async function Home() {
  const devices = await fetchDevices();

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
              <div className="flex flex-row w-full gap-x-4">
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
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
