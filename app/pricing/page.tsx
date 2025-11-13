"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function PricingPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async (plan: string) => {
    if (!session) {
      window.location.href = "/auth/signin"
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            AngleSaurus AI
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            Black Friday Special - Use code BLACKFRIDAY25
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600">
            Start with 10 free credits. Upgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Monthly Plan</CardTitle>
              <CardDescription>Perfect for testing and smaller campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">$47</span>
                <span className="text-slate-600">/month</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>200 credits/month</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>All 8 angle types</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>All output formats</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Rollover up to 100 credits</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Standard support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleCheckout("monthly")}
                disabled={loading}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-2 border-blue-600 relative">
            <Badge className="absolute -top-3 right-4" variant="default">
              Best Value - Save 30%
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl">Yearly Plan</CardTitle>
              <CardDescription>For serious marketers running multiple campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">$397</span>
                <span className="text-slate-600">/year</span>
                <div className="text-sm text-green-600 font-semibold">
                  Save $167/year ($33/month)
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>2,500 credits/year (~208/month)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>All 8 angle types</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>All output formats</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Rollover up to 500 credits</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span>Early access to new features</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleCheckout("yearly")}
                disabled={loading}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6">
            Need More Credits?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>50 Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$10</div>
                <p className="text-sm text-slate-600">One-time purchase</p>
                <p className="text-sm text-slate-600">Never expires</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>200 Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$35</div>
                <p className="text-sm text-slate-600">One-time purchase</p>
                <p className="text-sm text-slate-600">Never expires</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>500 Credits</CardTitle>
                <CardDescription>Best value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$75</div>
                <p className="text-sm text-slate-600">One-time purchase</p>
                <p className="text-sm text-slate-600">Never expires</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
