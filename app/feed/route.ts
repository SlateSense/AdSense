import { getAllPosts } from "@/lib/posts"

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const posts = await getAllPosts()
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "swatsense",
    home_page_url: site,
    feed_url: `${site}/feed`,
    description: "Daily smarter living: recovery, finance, crypto, motivation, gym",
    items: posts.map((p) => ({
      id: `${site}/posts/${p.slug}`,
      url: `${site}/posts/${p.slug}`,
      title: p.title,
      content_text: p.description,
      date_published: new Date(p.date).toISOString()
    }))
  }
  return new Response(JSON.stringify(feed), { headers: { "Content-Type": "application/feed+json; charset=utf-8" } })
}
