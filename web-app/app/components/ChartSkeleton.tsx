export default function ChartSkeleton() {
  return (
    <div role="status" aria-label="Loading sensor data" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-hidden="true">
        {["CO₂", "Humidity", "Temperature", "Voltage"].map((metric) => (
          <div key={metric} className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-gray-900 tracking-tight">{metric}</h3>
            <div className="h-[350px] rounded bg-gray-100 motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
