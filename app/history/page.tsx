"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function HistoryPage() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              AngleSaurus AI
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{session?.user?.credits || 0} Credits</Badge>
              <Link href="/settings">
                <Button variant="ghost">Settings</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Generation History</h1>
          <p className="text-slate-600">
            Your generation history will appear here. This feature connects to
            the Supabase database to retrieve past generations.
          </p>
        </div>
      </div>
    </div>
  )
}
