import Anthropic from "@anthropic-ai/sdk"
import { getBaseSystemPrompt, getAnglePrompt, getFormatInstructions } from "./prompts"
import { calculateReadability } from "../utils"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface GenerationRequest {
  productInfo: string
  angleType: string
  outputFormat: string
  platform?: string
}

export interface GeneratedVariation {
  text: string
  characterCount: number
  wordCount: number
  readabilityScore: number
}

export interface GenerationResult {
  angleType: string
  variations: GeneratedVariation[]
  error?: string
}

export async function generateAngle(
  request: GenerationRequest
): Promise<GenerationResult> {
  try {
    const systemPrompt = getBaseSystemPrompt()
    const anglePrompt = getAnglePrompt(request.angleType)
    const formatInstructions = getFormatInstructions(request.outputFormat)

    const userPrompt = `
Product Information:
${request.productInfo}

${anglePrompt}

${formatInstructions}

Generate 6 unique, compelling variations. Return ONLY the variations, numbered 1-6, with no additional commentary.
    `.trim()

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type")
    }

    const variations = parseVariations(content.text)

    return {
      angleType: request.angleType,
      variations: variations.map((v) => ({
        text: v,
        characterCount: v.length,
        wordCount: v.split(/\s+/).length,
        readabilityScore: calculateReadability(v),
      })),
    }
  } catch (error) {
    console.error("Error generating angle:", error)
    return {
      angleType: request.angleType,
      variations: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function parseVariations(text: string): string[] {
  const lines = text.split("\n")
  const variations: string[] = []
  let currentVariation = ""

  for (const line of lines) {
    const match = line.match(/^\d+[\.)]\s*(.+)/)
    if (match) {
      if (currentVariation) {
        variations.push(currentVariation.trim())
      }
      currentVariation = match[1]
    } else if (currentVariation && line.trim()) {
      currentVariation += " " + line.trim()
    }
  }

  if (currentVariation) {
    variations.push(currentVariation.trim())
  }

  return variations.filter((v) => v.length > 0).slice(0, 6)
}

export async function scrapeUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const html = await response.text()

    // Simple HTML parsing (in production, use cheerio or similar)
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    const descMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]+)"/i
    )

    let content = ""
    if (titleMatch) content += `Title: ${titleMatch[1]}\n`
    if (h1Match) content += `Headline: ${h1Match[1]}\n`
    if (descMatch) content += `Description: ${descMatch[1]}\n`

    // Remove HTML tags for a basic text extraction
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    content += `\nContent: ${textContent.substring(0, 1000)}`

    return content || "Unable to extract meaningful content from URL"
  } catch (error) {
    throw new Error(`Failed to scrape URL: ${error}`)
  }
}
