
import React from "react";
import { BarChart3, ExternalLink } from "lucide-react";

const GoogleAnalytics = () => {
  // Apna Google Analytics URL yahan paste karein
  const ANALYTICS_URL =
    "https://analytics.google.com/analytics/web/#/pXXXXXXXX/";

  const openGoogleAnalytics = () => {
    window.open(
      ANALYTICS_URL,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={openGoogleAnalytics}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <BarChart3 size={20} />
        <span>Google Analytics</span>
        <ExternalLink size={16} />
      </button>
    </div>
  );
};

export default GoogleAnalytics;
