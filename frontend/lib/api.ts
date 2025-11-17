import axios from 'axios'
import type {
  User,
  Campaign,
  CreateCampaignRequest,
  GenerateAdsResponse,
  AdVariation,
  CreditTransaction,
  Subscription,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// API Methods
export const api = {
  // Auth
  auth: {
    getCurrentUser: async (): Promise<User> => {
      const { data } = await apiClient.get('/api/auth/me')
      return data
    },
    signOut: async (): Promise<void> => {
      await apiClient.post('/api/auth/signout')
      localStorage.removeItem('auth_token')
    },
  },

  // Campaigns
  campaigns: {
    list: async (): Promise<Campaign[]> => {
      const { data } = await apiClient.get('/api/campaigns')
      return data
    },
    get: async (id: string): Promise<Campaign> => {
      const { data } = await apiClient.get(`/api/campaigns/${id}`)
      return data
    },
    create: async (campaign: CreateCampaignRequest): Promise<Campaign> => {
      const { data } = await apiClient.post('/api/campaigns', campaign)
      return data
    },
    update: async (id: string, updates: Partial<Campaign>): Promise<Campaign> => {
      const { data } = await apiClient.put(`/api/campaigns/${id}`, updates)
      return data
    },
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/api/campaigns/${id}`)
    },
  },

  // Generation
  generation: {
    generateAds: async (campaignId: string): Promise<GenerateAdsResponse> => {
      const { data } = await apiClient.post(`/api/campaigns/${campaignId}/generate`)
      return data
    },
  },

  // Ad Variations
  ads: {
    list: async (campaignId: string): Promise<AdVariation[]> => {
      const { data } = await apiClient.get(`/api/campaigns/${campaignId}/ads`)
      return data
    },
    get: async (adId: string): Promise<AdVariation> => {
      const { data } = await apiClient.get(`/api/ads/${adId}`)
      return data
    },
    markUsed: async (adId: string): Promise<void> => {
      await apiClient.put(`/api/ads/${adId}/mark-used`)
    },
    delete: async (adId: string): Promise<void> => {
      await apiClient.delete(`/api/ads/${adId}`)
    },
  },

  // Credits
  credits: {
    getBalance: async (): Promise<{ credits_remaining: number }> => {
      const { data } = await apiClient.get('/api/user/credits')
      return data
    },
    purchase: async (amount: number): Promise<{ checkout_url: string }> => {
      const { data } = await apiClient.post('/api/credits/purchase', { amount })
      return data
    },
    getTransactions: async (): Promise<CreditTransaction[]> => {
      const { data } = await apiClient.get('/api/credits/transactions')
      return data
    },
  },

  // Billing
  billing: {
    getSubscription: async (): Promise<Subscription> => {
      const { data } = await apiClient.get('/api/billing/subscription')
      return data
    },
    createCheckout: async (tierId: string, annual: boolean): Promise<{ checkout_url: string }> => {
      const { data } = await apiClient.post('/api/billing/checkout', {
        tier_id: tierId,
        annual,
      })
      return data
    },
    manageBilling: async (): Promise<{ portal_url: string }> => {
      const { data } = await apiClient.post('/api/billing/portal')
      return data
    },
  },

  // Export
  export: {
    downloadCampaign: async (campaignId: string, adIds: string[]): Promise<Blob> => {
      const { data } = await apiClient.post(
        `/api/campaigns/${campaignId}/download`,
        { ad_ids: adIds },
        { responseType: 'blob' }
      )
      return data
    },
  },
}

export default api
