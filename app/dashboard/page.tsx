"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, History, CreditCard } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
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
              <Badge variant="secondary" className="text-sm">
                {session?.user?.credits || 0} Credits
              </Badge>
              <Link href="/settings">
                <Button variant="ghost">Settings</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {session?.user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            What are we promoting today?
          </p>

          {/* Main Action Card */}
          <Card className="mb-8 border-2 border-blue-600">
            <CardHeader>
              <CardTitle className="text-2xl">Generate New Angles</CardTitle>
              <CardDescription>
                Paste a landing page URL or product description to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/generate">
                <Button size="lg" className="w-full sm:w-auto">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Generating
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <History className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Generation History</CardTitle>
                <CardDescription>
                  View and manage your past angle generations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/history">
                  <Button variant="outline">View History</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CreditCard className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Buy More Credits</CardTitle>
                <CardDescription>
                  Need more generations? Purchase credit packs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/pricing">
                  <Button variant="outline">View Plans</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Tips Section */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-none">
            <CardHeader>
              <CardTitle>Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-700">
                ✓ Select multiple angle types to get diverse variations
              </p>
              <p className="text-sm text-slate-700">
                ✓ Use the "Headlines" format for quick image ad copy
              </p>
              <p className="text-sm text-slate-700">
                ✓ Test 3-5 angles per campaign for best results
              </p>
              <p className="text-sm text-slate-700">
                ✓ Save your favorites for easy access later
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
