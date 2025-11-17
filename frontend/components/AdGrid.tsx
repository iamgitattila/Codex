'use client'

import React, { useState } from 'react'
import AdCard from './AdCard'
import { downloadFile } from '@/lib/utils'
import api from '@/lib/api'
import type { AdVariation } from '@/lib/types'

interface AdGridProps {
  ads: AdVariation[]
  campaignId: string
}

export default function AdGrid({ ads, campaignId }: AdGridProps) {
  const [selectedAds, setSelectedAds] = useState<string[]>([])
  const [downloading, setDownloading] = useState(false)

  const handleSelectAd = (adId: string) => {
    setSelectedAds(prev =>
      prev.includes(adId)
        ? prev.filter(id => id !== adId)
        : [...prev, adId]
    )
  }

  const handleSelectAll = () => {
    if (selectedAds.length === ads.length) {
      setSelectedAds([])
    } else {
      setSelectedAds(ads.map(ad => ad.id))
    }
  }

  const handleDownloadSelected = async () => {
    if (selectedAds.length === 0) return

    setDownloading(true)
    try {
      const blob = await api.export.downloadCampaign(campaignId, selectedAds)
      downloadFile(blob, `ads-${campaignId}.zip`)
    } catch (error) {
      console.error('Error downloading ads:', error)
      alert('Failed to download ads. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  if (ads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No ads generated yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Ad Variations</h2>
          <p className="text-gray-600 mt-1">
            {ads.length} variations generated
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSelectAll}
            className="btn-secondary"
          >
            {selectedAds.length === ads.length ? 'Deselect All' : 'Select All'}
          </button>

          <button
            onClick={handleDownloadSelected}
            disabled={selectedAds.length === 0 || downloading}
            className="btn-primary"
          >
            {downloading ? (
              'Downloading...'
            ) : (
              `Download Selected (${selectedAds.length})`
            )}
          </button>
        </div>
      </div>

      {/* Sort/Filter Options */}
      <div className="flex gap-4 text-sm">
        <button className="text-primary-600 font-medium">
          Sort by CTR Score
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          Sort by Angle
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          Sort by Length
        </button>
      </div>

      {/* Ad Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map(ad => (
          <AdCard
            key={ad.id}
            ad={ad}
            isSelected={selectedAds.includes(ad.id)}
            onSelect={() => handleSelectAd(ad.id)}
          />
        ))}
      </div>
    </div>
  )
}
