"use client";

import { useServiceProviders } from "@/hooks/useServiceProviders";

export function StatsBlock() {
  const { providers } = useServiceProviders();

  const totalJobs = providers.reduce((sum, p) => sum + p.totalJobs, 0);
  const averageRating =
    providers.length > 0
      ? (
          providers.reduce((sum, p) => sum + p.rating, 0) / providers.length
        ).toFixed(1)
      : "4.8";

  return (
    <div className="rounded-xl bg-white p-8 shadow-md">
      <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
        <div>
          <div className="mb-2 text-3xl font-bold text-green-600">
            {providers.length}+
          </div>
          <div className="text-gray-600">Verified Professionals</div>
        </div>
        <div>
          <div className="mb-2 text-3xl font-bold text-blue-600">
            {totalJobs}+
          </div>
          <div className="text-gray-600">Jobs Completed</div>
        </div>
        <div>
          <div className="mb-2 text-3xl font-bold text-purple-600">
            {averageRating}
          </div>
          <div className="text-gray-600">Average Rating</div>
        </div>
      </div>
    </div>
  );
}
