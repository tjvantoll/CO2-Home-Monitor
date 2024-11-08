import { Link } from "next-view-transitions";
import React from "react";
import {
  BatteryCharging,
  ChevronRight,
  Droplet,
  Thermometer,
  Wind,
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DashboardCharts from "@/components/dashboard/DashboardChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/Header";
import { fetchDevice } from "@/lib/notehub";
import { formatDate } from "@/lib/utils";

interface DevicePageProps {
  params: {
    deviceUID: string;
  };
}

export default async function DevicePage({ params }: DevicePageProps) {
  const { deviceUID } = params;
  const decodedDeviceUID = decodeURIComponent(deviceUID);
  const device = await fetchDevice(decodeURIComponent(decodedDeviceUID));

  if (!device) {
    return <div>Device not found</div>;
  }

  // Round the temperature and humidity values to two decimal places
  if (device && device.events) {
    device.events.forEach((event) => {
      event.body.temp = Math.round(event.body.temp * 100) / 100;
      event.body.humidity = Math.round(event.body.humidity * 100) / 100;
    });
  }

  return (
    <div>
      <Header />

      <div className="mx-4 mt-4">
        <nav aria-label="breadcrumb">
          <ol className="list-none p-0 inline-flex items-center gap-x-2 text-gray-500">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4" />
            </li>
            <li>
              <Link href={`/${device.uid}`} className="hover:underline">
                {device.serial_number}
              </Link>
            </li>
          </ol>
        </nav>
      </div>

      {device.events && device.events.length === 0 && (
        <div className="m-4">No data found for this device.</div>
      )}

      {device.events && device.events.length > 0 && (
        <Card key={device.uid} className="m-4">
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
            {device.events && (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

                <hr className="my-8" />

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 sm:grid-cols-2">
                  <DashboardCharts
                    data={device.events.map((event) => {
                      return {
                        co2: event.body.co2,
                        temp: event.body.temp,
                        humidity: event.body.humidity,
                        voltage: event.body.voltage,
                        when: event.when,
                      };
                    })}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
