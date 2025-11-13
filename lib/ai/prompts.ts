export const ANGLE_TYPES = {
  NLP_PATTERNS: "nlp_patterns",
  CLICKBAIT: "clickbait",
  HIGH_CTR: "high_ctr",
  BLACK_HAT: "black_hat",
  FOMO: "fomo",
  PAS: "pas",
  BEFORE_AFTER_BRIDGE: "before_after_bridge",
  STORYTELLING: "storytelling",
} as const

export const ANGLE_METADATA = {
  [ANGLE_TYPES.NLP_PATTERNS]: {
    name: "NLP Patterns",
    description: "Neuro-linguistic programming with embedded commands and presuppositions",
    color: "bg-purple-500",
    warning: false,
  },
  [ANGLE_TYPES.CLICKBAIT]: {
    name: "Clickbait / Curiosity Gap",
    description: "Open loops and pattern interrupts that demand attention",
    color: "bg-orange-500",
    warning: false,
  },
  [ANGLE_TYPES.HIGH_CTR]: {
    name: "High CTR",
    description: "Benefit-driven headlines optimized for maximum click-through",
    color: "bg-blue-500",
    warning: false,
  },
  [ANGLE_TYPES.BLACK_HAT]: {
    name: "Black Hat / Aggressive",
    description: "Bold claims and urgency stacking (use with caution)",
    color: "bg-red-500",
    warning: true,
  },
  [ANGLE_TYPES.FOMO]: {
    name: "FOMO",
    description: "Fear of missing out with social proof and scarcity",
    color: "bg-yellow-500",
    warning: false,
  },
  [ANGLE_TYPES.PAS]: {
    name: "Problem-Agitation-Solution",
    description: "Identify pain, make it worse, present solution",
    color: "bg-green-500",
    warning: false,
  },
  [ANGLE_TYPES.BEFORE_AFTER_BRIDGE]: {
    name: "Before-After-Bridge",
    description: "Paint the transformation journey",
    color: "bg-indigo-500",
    warning: false,
  },
  [ANGLE_TYPES.STORYTELLING]: {
    name: "Storytelling",
    description: "Narrative-driven copy that creates emotional connection",
    color: "bg-pink-500",
    warning: false,
  },
}

export const OUTPUT_FORMATS = {
  HEADLINES: "headlines",
  HOOKS: "hooks",
  AD_COPY: "ad_copy",
  SUBJECT_LINES: "subject_lines",
  CTA_BUTTONS: "cta_buttons",
  VIDEO_SCRIPT: "video_script",
} as const

export const OUTPUT_FORMAT_METADATA = {
  [OUTPUT_FORMATS.HEADLINES]: {
    name: "Headlines",
    description: "5-12 words perfect for image ads",
    maxLength: 60,
  },
  [OUTPUT_FORMATS.HOOKS]: {
    name: "Hooks",
    description: "1-2 sentences for video openers",
    maxLength: 150,
  },
  [OUTPUT_FORMATS.AD_COPY]: {
    name: "Full Ad Copy",
    description: "50-300 words for Facebook/LinkedIn posts",
    maxLength: 300,
  },
  [OUTPUT_FORMATS.SUBJECT_LINES]: {
    name: "Subject Lines",
    description: "Email subject lines that get opens",
    maxLength: 50,
  },
  [OUTPUT_FORMATS.CTA_BUTTONS]: {
    name: "CTA Buttons",
    description: "Action text for buttons and links",
    maxLength: 30,
  },
  [OUTPUT_FORMATS.VIDEO_SCRIPT]: {
    name: "Video Script Outline",
    description: "300-500 word script structure",
    maxLength: 500,
  },
}

export function getBaseSystemPrompt(): string {
  return `You are an expert direct-response copywriter with 20+ years of experience in performance marketing. You specialize in creating ad copy that generates high click-through rates and conversions for digital advertising campaigns.

Your writing style is:
- Punchy and benefit-driven
- Uses grade 5-8 reading level
- Avoids generic marketing speak
- Includes specific numbers and results when possible
- Taps into psychological triggers authentically

You always follow the specific angle type requested and output format constraints.`
}

export function getAnglePrompt(angleType: string): string {
  const prompts: Record<string, string> = {
    [ANGLE_TYPES.NLP_PATTERNS]: `Generate ad copy using neuro-linguistic programming patterns including:
- Embedded commands (action verbs in statements)
- Presuppositions (assume the sale is already happening)
- Modal operators (could, should, might, must)
- Time distortion (imagine, remember, soon)

Example: "You're probably already noticing how much easier this makes..."`,

    [ANGLE_TYPES.CLICKBAIT]: `Generate ad copy that creates intense curiosity using:
- Open loops that demand closure
- Pattern interrupts that break expectations
- Controversial or surprising statements
- "Weird trick" frameworks

Example: "Doctors HATE this weird trick..."

Create intrigue but ensure claims are defensible.`,

    [ANGLE_TYPES.HIGH_CTR]: `Generate ad copy optimized for maximum click-through rate using:
- Benefit-driven headlines
- Number-based specificity (3 ways, 7 secrets, etc.)
- Question-based hooks
- "How to" frameworks

Example: "How I Doubled My Sales With These 3 Weird Tricks"

Focus on curiosity and clear value proposition.`,

    [ANGLE_TYPES.BLACK_HAT]: `Generate ad copy using aggressive tactics including:
- Bold, attention-grabbing claims
- Urgency and scarcity elements
- Direct call-outs to the reader
- Power words and emotional triggers

Example: "LAST CHANCE: Don't miss out on this limited opportunity"

Note: Keep it impactful but not over the line.`,

    [ANGLE_TYPES.FOMO]: `Generate ad copy that leverages fear of missing out using:
- Social proof (others are already benefiting)
- Real or implied scarcity
- Time-limited opportunities
- Competitive anxiety

Example: "While everyone else is paying full price, smart buyers are getting 50% off..."`,

    [ANGLE_TYPES.PAS]: `Generate ad copy following the PAS framework:
1. Identify a specific, relatable problem
2. Agitate that problem (make it feel worse/more urgent)
3. Present your product as the solution

Example: "Tired of ads that don't convert? [Problem] It gets worse when you realize you're burning through your budget... [Agitation] Here's how to fix it: [Solution]"`,

    [ANGLE_TYPES.BEFORE_AFTER_BRIDGE]: `Generate ad copy following the BAB framework:
1. Describe current undesirable state (Before)
2. Paint picture of desired state (After)
3. Explain how to get there using the product (Bridge)

Example: "From broke and struggling to $10k/month in just 90 days..."`,

    [ANGLE_TYPES.STORYTELLING]: `Generate ad copy using storytelling techniques:
- Personal transformation stories
- Customer journey narratives
- Origin stories
- Relatable "I was just like you" openings

Example: "I was $50k in debt and about to give up when I discovered..."

Make it feel authentic and emotionally resonant.`,
  }

  return prompts[angleType] || prompts[ANGLE_TYPES.HIGH_CTR]
}

export function getFormatInstructions(outputFormat: string): string {
  const instructions: Record<string, string> = {
    [OUTPUT_FORMATS.HEADLINES]: `Generate 6 unique headlines. Each should be:
- 5-12 words maximum
- Punchy and attention-grabbing
- Perfect for image ads
- Include the main benefit or hook

Return ONLY the headlines, numbered 1-6, with no additional commentary.`,

    [OUTPUT_FORMATS.HOOKS]: `Generate 6 unique hooks. Each should be:
- 1-2 sentences maximum
- Strong opening that grabs attention
- Perfect for video openers or social posts
- Create curiosity or make a bold statement

Return ONLY the hooks, numbered 1-6, with no additional commentary.`,

    [OUTPUT_FORMATS.AD_COPY]: `Generate 6 unique full ad copy variations. Each should be:
- 50-150 words
- Complete ad structure with hook, body, and call-to-action
- Formatted for Facebook/LinkedIn text posts
- Benefit-driven and conversion-focused

Return ONLY the ad copy, numbered 1-6, with no additional commentary.`,

    [OUTPUT_FORMATS.SUBJECT_LINES]: `Generate 6 unique email subject lines. Each should be:
- 30-50 characters maximum
- Create curiosity or urgency
- Optimized for open rates
- Avoid spam trigger words

Return ONLY the subject lines, numbered 1-6, with no additional commentary.`,

    [OUTPUT_FORMATS.CTA_BUTTONS]: `Generate 6 unique call-to-action button texts. Each should be:
- 2-5 words maximum
- Action-oriented and clear
- Create urgency or excitement
- Perfect for buttons and links

Return ONLY the CTA text, numbered 1-6, with no additional commentary.`,

    [OUTPUT_FORMATS.VIDEO_SCRIPT]: `Generate 6 unique video script outlines. Each should be:
- 200-400 words
- Include: Hook, Problem, Solution, Social Proof, CTA
- Conversational tone for speaking
- Clear sections marked

Return ONLY the scripts, numbered 1-6, with no additional commentary.`,
  }

  return instructions[outputFormat] || instructions[OUTPUT_FORMATS.HEADLINES]
}
