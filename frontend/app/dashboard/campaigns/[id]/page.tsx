'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import AdGrid from '@/components/AdGrid'
import type { Campaign, AdVariation } from '@/lib/types'

export default function CampaignDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const campaignId = params.id as string
  const shouldGenerate = searchParams.get('generating') === 'true'

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [ads, setAds] = useState<AdVariation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(shouldGenerate)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCampaign()
  }, [campaignId])

  useEffect(() => {
    if (shouldGenerate && campaign) {
      generateAds()
    }
  }, [shouldGenerate, campaign])

  const loadCampaign = async () => {
    try {
      const [campaignData, adsData] = await Promise.all([
        api.campaigns.get(campaignId),
        api.ads.list(campaignId)
      ])

      setCampaign(campaignData)
      setAds(adsData)
    } catch (error: any) {
      console.error('Error loading campaign:', error)
      setError('Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  const generateAds = async () => {
    setGenerating(true)
    setError('')

    try {
      const result = await api.generation.generateAds(campaignId)

      // Reload ads
      const adsData = await api.ads.list(campaignId)
      setAds(adsData)

      // Update URL to remove generating param
      router.replace(`/dashboard/campaigns/${campaignId}`)
    } catch (error: any) {
      console.error('Error generating ads:', error)
      setError(error.response?.data?.detail || 'Failed to generate ads')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign not found</h1>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
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
              <Link href="/dashboard" className="text-primary-600 hover:underline text-sm mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold">{campaign.name || campaign.product_name}</h1>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span className="capitalize">{campaign.traffic_source}</span>
                <span>•</span>
                <span className="capitalize">{campaign.niche}</span>
                <span>•</span>
                <span className="capitalize">{campaign.tone} tone</span>
              </div>
            </div>
            {ads.length === 0 && !generating && (
              <button onClick={generateAds} className="btn-primary">
                Generate Ads
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Campaign Info */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Campaign Details</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Product:</span> {campaign.product_name}
            </div>
            <div>
              <span className="font-semibold">Target Audience:</span> {campaign.target_audience || 'General'}
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold">Description:</span> {campaign.product_description}
            </div>
            {campaign.primary_benefit && (
              <div className="md:col-span-2">
                <span className="font-semibold">Primary Benefit:</span> {campaign.primary_benefit}
              </div>
            )}
            {campaign.special_notes && (
              <div className="md:col-span-2">
                <span className="font-semibold">Special Notes:</span> {campaign.special_notes}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Generating State */}
        {generating && (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Generating Your Ads...</h3>
            <p className="text-gray-600">
              Creating 10 high-CTR headlines and matching images. This usually takes 30-60 seconds.
            </p>
          </div>
        )}

        {/* Ad Grid */}
        {!generating && <AdGrid ads={ads} campaignId={campaignId} />}
      </div>
    </div>
  )
}
