'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function CampaignForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    product_name: '',
    product_description: '',
    primary_benefit: '',
    target_audience: '',
    niche: 'saas',
    traffic_source: 'facebook',
    tone: 'professional',
    special_notes: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create campaign
      const campaign = await api.campaigns.create(formData)

      // Start generation immediately
      router.push(`/dashboard/campaigns/${campaign.id}?generating=true`)
    } catch (err: any) {
      console.error('Error creating campaign:', err)
      setError(err.response?.data?.detail || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Campaign</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Product Name *
          </label>
          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            placeholder="e.g., WordPress SEO Plugin"
            required
            className="input-field"
          />
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Product Description *
          </label>
          <textarea
            name="product_description"
            value={formData.product_description}
            onChange={handleChange}
            placeholder="What does your product do?"
            rows={3}
            required
            className="input-field"
          />
        </div>

        {/* Primary Benefit */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Primary Benefit
          </label>
          <input
            type="text"
            name="primary_benefit"
            value={formData.primary_benefit}
            onChange={handleChange}
            placeholder="e.g., Rank #1 on Google in 30 days"
            className="input-field"
          />
          <p className="text-sm text-gray-500 mt-1">
            What's the main result or transformation your audience wants?
          </p>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Target Audience
          </label>
          <input
            type="text"
            name="target_audience"
            value={formData.target_audience}
            onChange={handleChange}
            placeholder="e.g., Small business owners"
            className="input-field"
          />
        </div>

        {/* Niche and Traffic Source Row */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Niche *
            </label>
            <select
              name="niche"
              value={formData.niche}
              onChange={handleChange}
              className="input-field"
            >
              <option value="saas">SaaS</option>
              <option value="ecommerce">eCommerce</option>
              <option value="lead_gen">Lead Generation</option>
              <option value="crypto">Crypto</option>
              <option value="health">Health & Fitness</option>
              <option value="education">Education</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing Tools</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Traffic Source *
            </label>
            <select
              name="traffic_source"
              value={formData.traffic_source}
              onChange={handleChange}
              className="input-field"
            >
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="google">Google Ads</option>
              <option value="native">Native Ads</option>
            </select>
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tone *
          </label>
          <select
            name="tone"
            value={formData.tone}
            onChange={handleChange}
            className="input-field"
          >
            <option value="professional">Professional</option>
            <option value="funny">Funny / Casual</option>
            <option value="urgent">Urgent / Compelling</option>
            <option value="curious">Curious / Intriguing</option>
            <option value="bold">Bold / Provocative</option>
          </select>
        </div>

        {/* Special Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Special Notes (Optional)
          </label>
          <textarea
            name="special_notes"
            value={formData.special_notes}
            onChange={handleChange}
            placeholder="Any specific requirements? e.g., 'Include pricing', 'Avoid medical claims', etc."
            rows={2}
            className="input-field"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-lg py-4"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Campaign...
            </span>
          ) : (
            'Generate Ads & Images'
          )}
        </button>

        <p className="text-sm text-gray-500 text-center">
          This will use 2 credits from your account
        </p>
      </form>
    </div>
  )
}
