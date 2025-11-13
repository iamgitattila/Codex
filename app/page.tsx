import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Zap,
  Target,
  TrendingUp,
  Clock,
  DollarSign,
  Sparkles,
  Check
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AngleSaurus AI
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link href="/auth/signin">
                <Button>Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4" variant="secondary">
          Black Friday Special - 25% Off First Year
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Generate 100+ Ad Angles
          <br />
          in 60 Seconds
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Cut ad creative brainstorming from hours to seconds with battle-tested
          psychological frameworks. Perfect for performance marketers running
          multiple campaigns.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signin">
            <Button size="lg" className="text-lg px-8">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Free Trial - 10 Credits
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="text-lg px-8">
              View Pricing
            </Button>
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          No credit card required • 10 free generations • Cancel anytime
        </p>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-center text-sm font-semibold text-slate-600 mb-6">
            TRUSTED BY PERFORMANCE MARKETERS
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardDescription>App Install Marketer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  "Made $400 profit in 2 days with one of the angles. This
                  service is dirt cheap at this price."
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Technical Founder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  "I'm a programmer who automates everything but I'm not
                  creative. This is a godsend for people like me."
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Creative Media Buyer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  "Got my angles in 6 hours. They put a new spin on my offer
                  from a perspective that never crossed my mind."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Performance Marketers Love AngleSaurus AI
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Generate 100+ angles in under 60 seconds. From idea to launch
                faster than ever.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Target className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>8 Proven Frameworks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                NLP patterns, FOMO, PAS, storytelling, and more. Battle-tested
                psychological triggers.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Higher CTR</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Angles optimized for Facebook, TikTok, and Google. Break
                through ad fatigue.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Save Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Stop staring at blank pages. Get fresh angles whenever you need
                them.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <DollarSign className="h-10 w-10 text-emerald-600 mb-2" />
              <CardTitle>Affordable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                From $47/month for 200 credits. Less than one freelancer order.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle>Mobile-First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Generate angles on your phone while waiting for coffee. Works
                everywhere.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-slate-50">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Generate Your First Angles in 3 Steps
        </h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Paste Your Landing Page or Product Description
              </h3>
              <p className="text-slate-600">
                Drop in a URL or paste your product copy. Our AI extracts the
                key benefits and features.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Choose Your Angle Types
              </h3>
              <p className="text-slate-600">
                Select from 8 psychological frameworks: NLP, FOMO, PAS,
                storytelling, and more.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Copy and Launch Your Campaigns
              </h3>
              <p className="text-slate-600">
                Get 6-7 variations per angle type. One-click copy to your ad
                platform. Test and scale winners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to 10x Your Ad Creative Output?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start with 10 free credits. No credit card required.
          </p>
          <Link href="/auth/signin">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
            >
              Start Free Trial Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-slate-600 mb-4 md:mb-0">
              © 2025 AngleSaurus AI. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/terms" className="text-slate-600 hover:text-slate-900">
                Terms
              </Link>
              <Link href="/privacy" className="text-slate-600 hover:text-slate-900">
                Privacy
              </Link>
              <Link href="/contact" className="text-slate-600 hover:text-slate-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
