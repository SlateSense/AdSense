import fs from "fs"
import path from "path"
import matter from "gray-matter"

export type PostSummary = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  categories: string[]
  hero?: string
}

export type Post = PostSummary & {
  content: string
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

function replaceAffiliateTokens(markdown: string) {
  const amazon = process.env.NEXT_PUBLIC_AFFILIATE_AMAZON_URL || ""
  const flipkart = process.env.NEXT_PUBLIC_AFFILIATE_FLIPKART_URL || ""
  const exchange = process.env.NEXT_PUBLIC_AFFILIATE_EXCHANGE_URL || ""
  return markdown
    .replace(/\[\[AFFILIATE_LINK:Amazon\]\]/g, amazon || "#")
    .replace(/\[\[AFFILIATE_LINK:Flipkart\]\]/g, flipkart || "#")
    .replace(/\[\[AFFILIATE_LINK:Exchange\]\]/g, exchange || "#")
}

export async function getAllPosts(): Promise<PostSummary[]> {
  if (!fs.existsSync(POSTS_DIR)) return []
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))
  const posts: PostSummary[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8")
    const { data } = matter(raw)
    return {
      slug: file.replace(/\.md$/, ""),
      title: String(data.title || ""),
      date: String(data.date || ""),
      description: String(data.description || ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      categories: Array.isArray(data.categories) ? data.categories.map(String) : [],
      hero: data.hero ? String(data.hero) : undefined
    }
  })
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return posts
}

export async function getPost(slug: string): Promise<Post | null> {
  const file = path.join(POSTS_DIR, `${slug}.md`)
  if (!fs.existsSync(file)) return null
  const raw = fs.readFileSync(file, "utf8")
  const parsed = matter(raw)
  return {
    slug,
    title: String(parsed.data.title || ""),
    date: String(parsed.data.date || ""),
    description: String(parsed.data.description || ""),
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
    categories: Array.isArray(parsed.data.categories) ? parsed.data.categories.map(String) : [],
    hero: parsed.data.hero ? String(parsed.data.hero) : undefined,
    content: replaceAffiliateTokens(parsed.content)
  }
}

export async function getAllSlugs(): Promise<string[]> {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""))
}

export async function getMostLinkedPosts(): Promise<PostSummary[]> {
  const posts = await getAllPosts()
  const slugs = await getAllSlugs()
  const slugSet = new Set(slugs)
  const counts = new Map<string, number>()
  
  for (const slug of slugs) {
    const file = path.join(POSTS_DIR, `${slug}.md`)
    const raw = fs.readFileSync(file, "utf8")
    // Match any internal link format: /posts/[slug]
    const matches = raw.match(/\/posts\/([a-zA-Z0-9\-_]+)/g)
    if (matches) {
      for (const match of matches) {
        const target = match.replace("/posts/", "")
        if (target !== slug && slugSet.has(target)) {
          counts.set(target, (counts.get(target) || 0) + 1)
        }
      }
    }
  }

  return posts
    .filter(p => counts.has(p.slug))
    .sort((a, b) => (counts.get(b.slug) || 0) - (counts.get(a.slug) || 0))
    .slice(0, 5)
}

export async function getPopularPosts(): Promise<PostSummary[]> {
  const posts = await getAllPosts()
  // Mocking popular posts with a simple random/latest mix or views if we had it
  // For now, let's just return a few latest ones that are not the very first ones
  return posts.slice(2, 7)
}
