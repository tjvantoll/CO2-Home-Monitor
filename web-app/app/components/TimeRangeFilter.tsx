type TimeRange = "24h" | "3d" | "7d" | "14d" | "30d";

interface TimeRangeFilterProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const ranges = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "3d", label: "Last 3 Days" },
  { value: "7d", label: "Last 7 Days" },
  { value: "14d", label: "Last 2 Weeks" },
  { value: "30d", label: "Last Month" },
] as const;

export default function TimeRangeFilter({
  selectedRange,
  onRangeChange,
}: TimeRangeFilterProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700">Time Range:</span>
      <div className="flex gap-2">
        {ranges.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onRangeChange(value as TimeRange)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors
              ${
                selectedRange === value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { TimeRange };
