const fs = require("fs")
const path = require("path")

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseRetryAfterMs(errorText) {
  const match = String(errorText || "").match(/Please try again in\s+([0-9.]+)s/i)
  if (!match) return 0
  const seconds = Number(match[1])
  if (!Number.isFinite(seconds) || seconds <= 0) return 0
  return Math.ceil(seconds * 1000)
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function todayInfo() {
  const d = new Date()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return { y, m, day, iso: `${y}-${m}-${day}` }
}

async function requestGroqWithFallback(apiKey, bodyFactory) {
  const primaryModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
  const fallbackModel = process.env.GROQ_FALLBACK_MODEL || "llama-3.1-8b-instant"
  const models = Array.from(new Set([primaryModel, fallbackModel]))
  const perModelRetryLimit = Number(process.env.GROQ_MODEL_RETRY_LIMIT || 4)
  let lastError = ""

  for (const model of models) {
    for (let attempt = 1; attempt <= perModelRetryLimit; attempt++) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(bodyFactory(model))
      })

      if (res.ok) {
        return res.json()
      }

      const text = await res.text()
      lastError = `model=${model} attempt=${attempt} status=${res.status} body=${text}`

      if (res.status === 429) {
        const waitMs = Math.max(parseRetryAfterMs(text), 2500) + Math.floor(Math.random() * 1200)
        console.log(`Rate limit on ${model}. Waiting ${waitMs}ms before retry...`)
        await sleep(waitMs)
        continue
      }

      break
    }
  }

  throw new Error(`Groq API error after fallback: ${lastError}`)
}

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length
}

function countHeadings(markdown) {
  const matches = String(markdown || "").match(/^##?\#?\s+/gm)
  return matches ? matches.length : 0
}

function normalizePostShape(post) {
  return {
    title: String(post?.title || "").trim(),
    description: String(post?.description || "").trim(),
    content: String(post?.content || "").trim(),
    tags: Array.isArray(post?.tags) ? post.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 12) : [],
    categories: Array.isArray(post?.categories) ? post.categories.map((c) => String(c).trim()).filter(Boolean).slice(0, 2) : [],
    hero: post?.hero ? String(post.hero) : ""
  }
}

function validatePostQuality(post) {
  const failures = []
  const words = countWords(post.content)
  const headings = countHeadings(post.content)
  if (!post.title || post.title.length < 35) failures.push("Title is too short")
  if (!post.description || post.description.length < 130 || post.description.length > 170) failures.push("Description length is out of range")
  if (words < 1100) failures.push(`Content is too short (${words} words)`)
  if (headings < 5) failures.push(`Not enough section headings (${headings})`)
  if (!post.content.includes("[[AFFILIATE_LINK:Amazon]]")) failures.push("Missing Amazon placeholder")
  if (!post.content.includes("[[AFFILIATE_LINK:Flipkart]]")) failures.push("Missing Flipkart placeholder")
  if (!post.content.includes("[[AFFILIATE_LINK:Exchange]]")) failures.push("Missing Exchange placeholder")
  if (/for more information, check out our/i.test(post.content)) failures.push("Contains weak generic cross-linking phrase")
  if (post.categories.length === 0) failures.push("Missing categories")
  if (post.tags.length < 6) failures.push("Not enough tags")
  return failures
}

function buildPrompt({ niche, newsContext, internalLinks, qualityFeedback }) {
  return `You are an expert content creator for "swatsense", a premium daily blog.
Write one coherent, high-value article for Indian readers.

EDITORIAL REQUIREMENTS:
- Pick one primary angle only (example: crypto safety OR debt recovery OR budgeting discipline).
- You may use one secondary angle briefly, but do not mix many themes.
- Keep the narrative practical and realistic, not generic.
- Use concrete Indian context examples with numbers (rupees, timelines, realistic scenarios).
- Avoid fluffy lines and avoid vague phrases like "for more information check our content".
- Internal links must be naturally embedded in sentences, not dumped.

FORMAT REQUIREMENTS:
- 1100-1600 words in Markdown.
- Clear structure with H2/H3 headings.
- Short paragraphs, bullet points, numbered steps.
- Include one section called "7-Day Action Plan".
- Include one section called "Common Mistakes to Avoid".
- Include one bold blockquote with a strong takeaway.
- Insert exactly these three placeholders once each:
  [[AFFILIATE_LINK:Amazon]]
  [[AFFILIATE_LINK:Flipkart]]
  [[AFFILIATE_LINK:Exchange]]

SITE NICHE: ${niche}
NEWS CONTEXT: ${newsContext || "None"}

INTERNAL LINKS (use 2-3 naturally):
${internalLinks || "None available"}

${qualityFeedback ? `QUALITY FEEDBACK FROM PREVIOUS ATTEMPT:\n${qualityFeedback}\n` : ""}
Return ONLY valid JSON with keys:
title, description, content, tags (array 6-12), categories (array 1-2), hero.`
}

async function generateWithGroq(existingPosts = [], newsContext = "", maxAttempts = 3) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error("Missing GROQ_API_KEY")
  const niche = process.env.SITE_NICHE || "recovery and saving tips for India with crypto safety and gym habits"
  const internalLinks = existingPosts
    .slice(0, 15)
    .map(p => `- ${p.title}: /posts/${p.slug}`)
    .join("\n")
  let qualityFeedback = ""
  let lastError = ""
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const prompt = buildPrompt({ niche, newsContext, internalLinks, qualityFeedback })
      const data = await requestGroqWithFallback(apiKey, (model) => ({
        model,
        temperature: 0.6,
        messages: [
          { role: "system", content: "You are a strict editorial AI. Output only valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }))
      const content = data.choices?.[0]?.message?.content
      const parsed = normalizePostShape(JSON.parse(content))
      const failures = validatePostQuality(parsed)
      if (failures.length === 0) {
        return parsed
      }
      qualityFeedback = failures.join("; ")
      lastError = `quality_check_failed: ${qualityFeedback}`
    } catch (err) {
      lastError = err.message
      qualityFeedback = `Technical failure: ${err.message}`
    }
  }
  throw new Error(`Failed to generate a quality post after retries: ${lastError}`)
}

function writeMarkdown(post) {
  const { iso } = todayInfo()
  const slug = `${iso}-${slugify(post.title || "daily-post")}`
  const dir = path.join(process.cwd(), "content", "posts")
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  
  // Ensure we don't overwrite if multiple posts generated on same day
  let finalSlug = slug
  let counter = 1
  while (fs.existsSync(path.join(dir, `${finalSlug}.md`))) {
    finalSlug = `${slug}-${counter}`
    counter++
  }

  const file = path.join(dir, `${finalSlug}.md`)
  const hero = post.hero || "https://source.unsplash.com/1200x720/?finance,crypto,gym,india"
  
  const fm = [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    `date: ${iso}`,
    `description: ${JSON.stringify(post.description)}`,
    `tags:${Array.isArray(post.tags) ? post.tags.map((t) => `\n  - ${t}`).join("") : ""}`,
    `categories:${Array.isArray(post.categories) ? post.categories.map((c) => `\n  - ${c}`).join("") : ""}`,
    `hero: ${hero}`,
    "---",
    ""
  ].join("\n")
  
  const md = `${fm}${post.content}\n`
  fs.writeFileSync(file, md, "utf8")
  return { file, slug: finalSlug }
}

async function getNewsContext() {
  // If we have an environment variable for news, use it
  if (process.env.NEWS_CONTEXT) return process.env.NEWS_CONTEXT
  
  try {
    // Basic news fetching if not provided (mocking for simplicity)
    const topics = [
      "Bitcoin holdings reporting $10.3 billion",
      "MicroStrategy (MSTR) acquisitions",
      "Bitcoin slipping to $66k due to U.S.-Israel conflict with Iran",
      "SEC guidance on crypto securities",
      "Ripple survey on stablecoins for corporate treasury",
      "UK and US split over crypto collaboration",
      "Dubai's crypto marketing executive working despite war sounds"
    ]
    return topics.join(", ")
  } catch (err) {
    return ""
  }
}

async function main() {
  const count = parseInt(process.argv[2]) || 1
  const pauseBetweenPostsMs = Number(process.env.GENERATION_PAUSE_MS || 3500)
  console.log(`Generating ${count} posts...`)
  
  const newsContext = await getNewsContext()
  console.log(`Using news context: ${newsContext.substring(0, 100)}...`)
  
  // Load existing posts for internal linking
  let existingPosts = []
  const postsDir = path.join(process.cwd(), "content", "posts")
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"))
    existingPosts = files.map(f => ({
      slug: f.replace(".md", ""),
      title: f.replace(/-/g, " ").replace(".md", "").substring(11) // crude title from slug
    }))
  }

  let createdCount = 0
  for (let i = 0; i < count; i++) {
    try {
      console.log(`Generating post ${i + 1}/${count}...`)
      const post = await generateWithGroq(existingPosts, newsContext)
      const { slug } = writeMarkdown(post)
      console.log(`Created: ${slug}`)
      createdCount += 1
      // Add new post to existing for subsequent generations in same run
      existingPosts.unshift({ slug, title: post.title })
    } catch (err) {
      console.error(`Error generating post ${i + 1}:`, err.message)
    }
    if (i < count - 1) {
      await sleep(pauseBetweenPostsMs)
    }
  }

  if (createdCount === 0) {
    throw new Error("No posts were generated successfully")
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
