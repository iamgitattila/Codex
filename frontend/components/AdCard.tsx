'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { copyToClipboard } from '@/lib/utils'
import type { AdVariation } from '@/lib/types'

interface AdCardProps {
  ad: AdVariation
  isSelected: boolean
  onSelect: () => void
}

export default function AdCard({ ad, isSelected, onSelect }: AdCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(ad.headline)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Get CTR color based on score
  const getCTRColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-blue-600 bg-blue-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <div
      className={`card relative ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      } hover:shadow-lg transition-shadow`}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 right-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
        />
      </div>

      {/* CTR Score Badge */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-4 ${getCTRColor(ad.ctr_score)}`}>
        CTR Score: {ad.ctr_score}/100
      </div>

      {/* Headline */}
      <h3 className="text-lg font-semibold mb-3 pr-8">
        {ad.headline}
      </h3>

      {/* Metadata */}
      <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600">
        <span className="bg-gray-100 px-2 py-1 rounded">
          {ad.angle_type.replace('_', ' ').toUpperCase()}
        </span>
        <span className="bg-gray-100 px-2 py-1 rounded">
          {ad.character_count} chars
        </span>
        <span className="bg-gray-100 px-2 py-1 rounded">
          {ad.platform_optimized}
        </span>
      </div>

      {/* Reasoning */}
      {ad.reasoning && (
        <p className="text-sm text-gray-600 mb-4 italic">
          "{ad.reasoning}"
        </p>
      )}

      {/* Images */}
      {ad.images && ad.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {ad.images.map((image) => (
            <div key={image.id} className="relative aspect-square rounded overflow-hidden border border-gray-200">
              <Image
                src={image.image_url}
                alt={ad.headline}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1">
                {image.image_style.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Headline'}
        </button>
        {ad.images && ad.images.length > 0 && (
          <a
            href={ad.images[0].image_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-100 hover:bg-primary-200 px-4 py-2 rounded text-sm font-medium text-primary-700 transition-colors"
          >
            Download
          </a>
        )}
      </div>
    </div>
  )
}
