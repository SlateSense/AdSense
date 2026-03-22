import { getAllPosts } from "@/lib/posts"

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const posts = await getAllPosts()
  const items = posts
    .map((p) => {
      const link = `${site}/posts/${p.slug}`
      return `
      <item>
        <title><![CDATA[${p.title}]]></title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${new Date(p.date).toUTCString()}</pubDate>
        <description><![CDATA[${p.description}]]></description>
      </item>`
    })
    .join("\n")
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>swatsense</title>
    <link>${site}</link>
    <description>Daily smarter living: recovery, finance, crypto, motivation, gym</description>
    ${items}
  </channel>
</rss>`
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } })
}
