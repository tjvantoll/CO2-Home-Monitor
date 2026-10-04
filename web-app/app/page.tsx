import MetricCharts from "./components/MetricCharts";
import { getEvents } from "./utils/notehub";

export default async function Home() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Real-time environmental metrics from your sensors
        </p>
      </div>
      <MetricCharts events={events} />
    </div>
  );
}
