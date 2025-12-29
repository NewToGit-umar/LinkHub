import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../../services/api'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts'

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics','aggregate'],
    queryFn: async () => {
      const r = await analyticsAPI.aggregate()
      return r.data
    },
    staleTime: 1000 * 60 * 5,
  })

  const totals = data?.totals || []
  const topPosts = data?.topPosts || []
  const monthly = data?.monthly || []

  const barData = totals.map(t => ({ platform: t.platform, likes: t.likes || 0, shares: t.shares || 0, comments: t.comments || 0 }))

  const lineData = monthly.map(m => ({
    name: `${m._id.month}/${m._id.year}`,
    likes: m.likes || 0,
    shares: m.shares || 0,
    comments: m.comments || 0
  }))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>

      {isLoading ? (
        <div>Loading analytics…</div>
      ) : (
        <div className="space-y-6">
          <div className="p-3 border rounded bg-white">
            <h2 className="text-lg font-semibold mb-3">Totals by Platform</h2>
            {barData.length === 0 ? (
              <div className="text-gray-600">No analytics available.</div>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="likes" stackId="a" fill="#1f77b4" />
                    <Bar dataKey="shares" stackId="a" fill="#ff7f0e" />
                    <Bar dataKey="comments" stackId="a" fill="#2ca02c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="p-3 border rounded bg-white">
            <h2 className="text-lg font-semibold mb-3">Monthly Trends</h2>
            {lineData.length === 0 ? (
              <div className="text-gray-600">No monthly data available.</div>
            ) : (
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="likes" stroke="#1f77b4" />
                    <Line type="monotone" dataKey="shares" stroke="#ff7f0e" />
                    <Line type="monotone" dataKey="comments" stroke="#2ca02c" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="p-3 border rounded bg-white">
            <h2 className="text-lg font-semibold mb-3">Top Posts</h2>
            <div className="space-y-3">
              {topPosts.length === 0 && <div className="text-gray-600">No top posts available.</div>}
              {topPosts.map(p => (
                <div key={p.postId || Math.random()} className="p-3 border rounded bg-white">
                  <div className="text-sm text-gray-800 mb-1">Post: {String(p.postId).slice(0,8)}</div>
                  <div className="text-xs text-gray-600">Engagement score: {p.score || 0}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
}
