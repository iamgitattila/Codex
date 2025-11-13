"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ANGLE_TYPES, ANGLE_METADATA, OUTPUT_FORMATS, OUTPUT_FORMAT_METADATA } from "@/lib/ai/prompts"
import { Sparkles, Copy, Heart } from "lucide-react"
import Link from "next/link"

export default function GeneratePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [inputType, setInputType] = useState<"url" | "manual">("url")
  const [inputContent, setInputContent] = useState("")
  const [selectedAngles, setSelectedAngles] = useState<string[]>([])
  const [outputFormat, setOutputFormat] = useState(OUTPUT_FORMATS.HEADLINES)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleAngleToggle = (angleType: string) => {
    setSelectedAngles((prev) =>
      prev.includes(angleType)
        ? prev.filter((a) => a !== angleType)
        : [...prev, angleType]
    )
  }

  const handleGenerate = async () => {
    if (!inputContent.trim()) {
      toast({
        title: "Error",
        description: "Please provide a URL or product description",
        variant: "destructive",
      })
      return
    }

    if (selectedAngles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one angle type",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType,
          inputContent,
          angleTypes: selectedAngles,
          outputFormat,
        }),
      })

      const data = await response.json()

      if (response.status === 402) {
        toast({
          title: "Insufficient Credits",
          description: "Please purchase more credits to continue",
          variant: "destructive",
        })
        router.push("/pricing")
        return
      }

      if (!response.ok) {
        throw new Error(data.error || "Generation failed")
      }

      setResults(data.results)
      toast({
        title: "Success!",
        description: `Generated ${data.results.length} angle types`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate angles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Angle copied to clipboard",
    })
  }

  if (!session) {
    router.push("/auth/signin")
    return null
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {!results ? (
            <>
              <h1 className="text-3xl font-bold mb-8">Generate Ad Angles</h1>

              {/* Input Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Step 1: Provide Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={inputType}
                    onValueChange={(value) => setInputType(value as "url" | "manual")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="url" id="url" />
                      <Label htmlFor="url">Landing Page URL</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual">Manual Description</Label>
                    </div>
                  </RadioGroup>

                  {inputType === "url" ? (
                    <div>
                      <Label htmlFor="url-input">Landing Page URL</Label>
                      <Input
                        id="url-input"
                        type="url"
                        placeholder="https://example.com/product"
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="manual-input">Product Description</Label>
                      <Textarea
                        id="manual-input"
                        placeholder="Paste your product description, VSL script, or landing page copy here..."
                        rows={6}
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        className="resize-none"
                      />
                      <p className="text-sm text-slate-500 mt-2">
                        {inputContent.length} characters
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Angle Selection */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Step 2: Select Angle Types</CardTitle>
                  <p className="text-sm text-slate-600">
                    Each angle type costs 1 credit ({selectedAngles.length}{" "}
                    selected)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(ANGLE_METADATA).map(([key, meta]) => (
                      <div
                        key={key}
                        className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleAngleToggle(key)}
                      >
                        <Checkbox
                          checked={selectedAngles.includes(key)}
                          onCheckedChange={() => handleAngleToggle(key)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Label className="font-semibold cursor-pointer">
                              {meta.name}
                            </Label>
                            {meta.warning && (
                              <Badge variant="destructive" className="text-xs">
                                Use with caution
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">
                            {meta.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Output Format */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Step 3: Choose Output Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={outputFormat} onValueChange={setOutputFormat}>
                    {Object.entries(OUTPUT_FORMAT_METADATA).map(([key, meta]) => (
                      <div
                        key={key}
                        className="flex items-center space-x-2 p-3 rounded-lg border mb-2 hover:bg-slate-50"
                      >
                        <RadioGroupItem value={key} id={key} />
                        <Label htmlFor={key} className="flex-1 cursor-pointer">
                          <div className="font-semibold">{meta.name}</div>
                          <div className="text-sm text-slate-600">
                            {meta.description}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleGenerate}
                disabled={loading || selectedAngles.length === 0 || !inputContent.trim()}
              >
                {loading ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Angles ({selectedAngles.length} credits)
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Your Angles Are Ready!</h1>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResults(null)
                    setInputContent("")
                    setSelectedAngles([])
                  }}
                >
                  Generate More
                </Button>
              </div>

              {results.map((result: any, idx: number) => (
                <Card key={idx} className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {ANGLE_METADATA[result.angleType as keyof typeof ANGLE_METADATA]?.name}
                      </CardTitle>
                      <Badge className={ANGLE_METADATA[result.angleType as keyof typeof ANGLE_METADATA]?.color}>
                        {result.variations.length} variations
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.variations.map((variation: any, vIdx: number) => (
                        <div
                          key={vIdx}
                          className="p-4 bg-slate-50 rounded-lg border"
                        >
                          <p className="mb-2 font-mono text-sm">{variation.text}</p>
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <div>
                              {variation.characterCount} chars • {variation.wordCount} words
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(variation.text)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
