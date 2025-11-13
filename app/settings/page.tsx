"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { signOut } from "next-auth/react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  const handleManageSubscription = async () => {
    const response = await fetch("/api/stripe/create-portal", {
      method: "POST",
    })
    const { url } = await response.json()
    if (url) {
      window.location.href = url
    }
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
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Name</p>
                <p className="font-medium">{session.user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="font-medium">{session.user?.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Current Plan</p>
                <p className="font-medium">
                  {session.user?.subscriptionPlan || "Free Trial"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Credits Remaining</p>
                <p className="font-medium">{session.user?.credits || 0}</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleManageSubscription}>
                  Manage Subscription
                </Button>
                <Link href="/pricing">
                  <Button variant="outline">Buy Credits</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sign Out</CardTitle>
              <CardDescription>Sign out of your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
