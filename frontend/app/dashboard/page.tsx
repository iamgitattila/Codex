'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Campaign, User } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [userData, campaignsData] = await Promise.all([
        api.auth.getCurrentUser(),
        api.campaigns.list()
      ])

      setUser(userData)
      setCampaigns(campaignsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Redirect to home if not authenticated
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name || user?.email}!</p>
            </div>
            <Link href="/dashboard/campaigns/new" className="btn-primary">
              + New Campaign
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Credits Remaining</h3>
            <div className="text-3xl font-bold text-primary-600">
              {user?.credits_remaining || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {user?.current_tier === 'starter' && '15 credits/month'}
              {user?.current_tier === 'growth' && '50 credits/month'}
              {user?.current_tier === 'pro' && '100 credits/month'}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Campaigns</h3>
            <div className="text-3xl font-bold text-gray-900">
              {campaigns.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">All time</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Current Plan</h3>
            <div className="text-3xl font-bold text-gray-900 capitalize">
              {user?.current_tier || 'Starter'}
            </div>
            <Link href="/pricing" className="text-sm text-primary-600 hover:underline mt-1 inline-block">
              Upgrade Plan
            </Link>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Campaigns</h2>
            <Link href="/dashboard/campaigns/new" className="text-primary-600 hover:underline text-sm font-medium">
              Create New →
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first campaign to start generating high-CTR ads
              </p>
              <Link href="/dashboard/campaigns/new" className="btn-primary">
                Create Your First Campaign
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Campaign</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Platform</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(campaign => (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold">{campaign.name || campaign.product_name}</div>
                        <div className="text-sm text-gray-600">{campaign.product_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'generated' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize">{campaign.traffic_source}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(campaign.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/campaigns/${campaign.id}`}
                          className="text-primary-600 hover:underline font-medium text-sm"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
