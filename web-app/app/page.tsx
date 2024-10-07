import Link from "next/link";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchDevices } from "@/lib/notehub";
import Header from "@/components/Header";

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
          <Link key={device.uid} href={`/${device.uid}`}>
            <Card>
              <CardHeader>
                <CardTitle>{device.serial_number}</CardTitle>
                <CardDescription>
                  UID: {device.uid}
                  <br />
                  SKU: {device.sku}
                  <br />
                  Last Activity:{" "}
                  {new Date(device.last_activity).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>hi</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
