const fs = require("fs")
const path = require("path")

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

async function generateWithGroq(existingPosts = [], newsContext = "") {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error("Missing GROQ_API_KEY")
  const niche = process.env.SITE_NICHE || "recovery and saving tips for India with crypto safety and gym habits"
  const model = process.env.GROQ_MODEL || "mixtral-8x7b-32768"
  
  const internalLinks = existingPosts
    .slice(0, 15)
    .map(p => `- ${p.title}: /posts/${p.slug}`)
    .join("\n")

  const prompt = `You are an expert content creator for "Spectra Star", a premium daily blog.
Your goal is to write a high-quality, SEO-optimized, and engaging article.

CONSTRAINTS:
- Write one unique article in Markdown.
- Tone: Professional yet conversational, motivational, finance-smart, India-centric.
- Length: 1000–1500 words.
- Format: Use H2/H3 headers, short paragraphs, bullet points, numbered lists, and at least one bold blockquote callout.
- Categories: Choose 1-2 relevant categories (e.g., Finance, Crypto, Health, Motivation, Tech).
- Internal Linking: Weave in at least 2-3 natural references to our existing content using the provided list below.
- News Integration: If relevant news context is provided, naturally weave it into the article to make it timely.
- Affiliate Links: Insert exactly three affiliate placeholders: [[AFFILIATE_LINK:Amazon]], [[AFFILIATE_LINK:Flipkart]], [[AFFILIATE_LINK:Exchange]].
- Visuals: Suggest a keyword for a hero image from Unsplash.

SITE NICHE: ${niche}
NEWS CONTEXT (Use if relevant): ${newsContext}

EXISTING CONTENT FOR INTERNAL LINKS (Use 2-3):
${internalLinks}

Return ONLY a JSON object with these keys:
- title: Captivating, SEO-friendly title.
- description: Compelling meta description (150-160 chars).
- content: The full Markdown body.
- tags: Array of 6-12 relevant tags.
- categories: Array of 1-2 categories.
- hero: A keyword-based Unsplash URL (e.g., "https://source.unsplash.com/1200x720/?bitcoin,finance").`

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      messages: [
        { role: "system", content: "You are a world-class SEO content writer. You output strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  })
  
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Groq API error: ${res.status} ${text}`)
  }
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  return JSON.parse(content)
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

  const newsContext = process.env.NEWS_CONTEXT || ""

  for (let i = 0; i < count; i++) {
    try {
      console.log(`Generating post ${i + 1}/${count}...`)
      const post = await generateWithGroq(existingPosts, newsContext)
      const { file, slug } = writeMarkdown(post)
      console.log(`Created: ${slug}`)
      // Add new post to existing for subsequent generations in same run
      existingPosts.unshift({ slug, title: post.title })
    } catch (err) {
      console.error(`Error generating post ${i + 1}:`, err.message)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
