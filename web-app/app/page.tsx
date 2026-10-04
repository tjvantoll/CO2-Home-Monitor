import EventList from "./components/EventList";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Real-time environmental metrics from your sensors
        </p>
      </div>
      <EventList />
    </div>
  );
}
