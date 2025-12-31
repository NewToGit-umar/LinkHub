import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  BarChart3, 
  Users, 
  Link2, 
  Plus,
  Eye,
  Share2,
  MessageCircle
} from 'lucide-react'
import { dashboardAPI } from '../../services/api'
import StatCard from './StatCard'

const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardAPI.getDashboardData,
    staleTime: 0,
    cacheTime: 1000 * 60 * 5,
    refetchInterval: 300000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = dashboardData?.stats || {
    totalPosts: 0,
    scheduledPosts: 0,
    connectedAccounts: 0,
    totalEngagement: 0
  }

  const recentPosts = dashboardData?.recentPosts || [
    { id: 1, content: 'Just launched our new feature!', status: 'published', engagement: 245 },
    { id: 2, content: 'Weekly tips for social media growth', status: 'scheduled', engagement: 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mt-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/posts"
          className="btn-primary inline-flex items-center mr-4 mt-2"
        >
          <Plus className="w-4 h-4 mr-2 mt-1" />
          New Post
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduledPosts}
          icon={Calendar}
          trend={{ value: 5, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Connected Accounts"
          value={stats.connectedAccounts}
          icon={Users}
          trend={{ value: 2, isPositive: true }}
          color="purple"
        />
        <StatCard
          title="Total Engagement"
          value={stats.totalEngagement.toLocaleString()}
          icon={BarChart3}
          trend={{ value: 8, isPositive: true }}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentPosts.map(post => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{post.content}</p>
                  <p className="text-xs text-gray-500 capitalize">{post.status}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {post.engagement}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/accounts"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <span className="text-sm font-medium">Connect Accounts</span>
            </Link>
            <Link
              to="/analytics"
              className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
            >
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <span className="text-sm font-medium">View Analytics</span>
            </Link>
            <Link
              to="/links"
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
            >
              <Link2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <span className="text-sm font-medium">Manage Links</span>
            </Link>
            <Link
              to="/team"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
            >
              <Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <span className="text-sm font-medium">Team</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard