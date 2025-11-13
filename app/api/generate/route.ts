import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdmin } from "@/lib/supabase/server"
import { generateAngle, scrapeUrl } from "@/lib/ai/generate"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { inputType, inputContent, angleTypes, outputFormat } =
      await request.json()

    // Get user
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check credits
    const creditsNeeded = angleTypes.length
    if (user.credits_remaining < creditsNeeded) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      )
    }

    // Process input
    let productInfo = inputContent
    if (inputType === "url") {
      try {
        productInfo = await scrapeUrl(inputContent)
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to scrape URL" },
          { status: 400 }
        )
      }
    }

    // Generate angles in parallel
    const generationPromises = angleTypes.map((angleType: string) =>
      generateAngle({
        productInfo,
        angleType,
        outputFormat,
      })
    )

    const results = await Promise.all(generationPromises)

    // Deduct credits
    await supabaseAdmin
      .from("users")
      .update({
        credits_remaining: user.credits_remaining - creditsNeeded,
        credits_lifetime_used: user.credits_lifetime_used + creditsNeeded,
      })
      .eq("id", user.id)

    // Save generation
    const { data: generation } = await supabaseAdmin
      .from("generations")
      .insert({
        user_id: user.id,
        input_type: inputType,
        input_content: inputContent,
        angle_types: angleTypes,
        output_format: outputFormat,
        results: results,
        credits_used: creditsNeeded,
      })
      .select()
      .single()

    // Record credit transaction
    await supabaseAdmin.from("credit_transactions").insert({
      user_id: user.id,
      amount: -creditsNeeded,
      transaction_type: "usage",
      description: `Generated ${angleTypes.length} angles`,
      generation_id: generation.id,
    })

    return NextResponse.json({
      generationId: generation.id,
      results,
      creditsUsed: creditsNeeded,
      creditsRemaining: user.credits_remaining - creditsNeeded,
    })
  } catch (error) {
    console.error("Error generating angles:", error)
    return NextResponse.json(
      { error: "Failed to generate angles" },
      { status: 500 }
    )
  }
}
