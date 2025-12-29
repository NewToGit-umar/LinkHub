import { useQuery } from "@tanstack/react-query";
import { engagementAPI } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

export default function LinkEngagement({ bioPageId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["engagement", bioPageId],
    queryFn: async () => {
      const res = await engagementAPI.getBioPageEngagement(bioPageId, {
        days: 30,
      });
      return res.data;
    },
    enabled: !!bioPageId,
  });

  if (!bioPageId)
    return (
      <p className="text-gray-500 text-sm">
        Select a bio page to view engagement
      </p>
    );
  if (isLoading)
    return <p className="text-gray-500 text-sm">Loading engagement data...</p>;
  if (error)
    return (
      <p className="text-red-500 text-sm">Failed to load engagement data</p>
    );

  const { summary, clicksOverTime, topCountries, deviceBreakdown, linkStats } =
    data || {};

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Clicks" value={summary?.totalClicks || 0} />
        <StatCard
          label="Unique Visitors"
          value={summary?.totalUniqueVisitors || 0}
        />
        <StatCard label="Top Links" value={linkStats?.length || 0} />
        <StatCard label="Countries" value={topCountries?.length || 0} />
      </div>

      {/* Clicks Over Time Chart */}
      {clicksOverTime && clicksOverTime.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Clicks Over Time (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={clicksOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#6366f1"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="uniqueVisitors"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Device Breakdown */}
        {deviceBreakdown && deviceBreakdown.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Device Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={deviceBreakdown}
                  dataKey="clicks"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ device, percent }) =>
                    `${device} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {deviceBreakdown.map((entry, index) => (
                    <Cell
                      key={entry.device}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Countries */}
        {topCountries && topCountries.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Top Countries
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topCountries} layout="vertical">
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="country"
                  width={60}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip />
                <Bar dataKey="clicks" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Performing Links */}
      {linkStats && linkStats.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Link Performance
          </h3>
          <div className="space-y-2">
            {linkStats.slice(0, 10).map((link, idx) => (
              <div
                key={link.linkId}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <span className="text-sm text-gray-600">
                  #{idx + 1} Link {link.linkId.toString().slice(-6)}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">
                    {link.uniqueVisitors} unique
                  </span>
                  <span className="font-medium text-indigo-600">
                    {link.clicks} clicks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!clicksOverTime || clicksOverTime.length === 0) &&
        (!linkStats || linkStats.length === 0) && (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500">
              No engagement data yet. Share your bio page to start tracking
              clicks!
            </p>
          </div>
        )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow text-center">
      <p className="text-2xl font-bold text-indigo-600">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
