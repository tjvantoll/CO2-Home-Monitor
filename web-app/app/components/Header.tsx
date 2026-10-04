import { FaWind } from "react-icons/fa";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <FaWind className="h-8 w-8 text-blue-500" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  CO2 Monitor
                </span>
              </div>
            </div>
            <div className="ml-4">
              <span className="text-sm text-gray-500">
                Real-time Monitoring
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
