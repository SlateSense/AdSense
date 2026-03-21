import { getAllPosts } from "@/lib/posts"

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const posts = await getAllPosts()
  const postUrls = posts.map((p) => ({
    url: `${baseUrl}/posts/${p.slug}`,
    lastModified: p.date
  }))
  return [
    { url: `${baseUrl}/`, lastModified: new Date().toISOString().slice(0, 10) },
    { url: `${baseUrl}/about`, lastModified: new Date().toISOString().slice(0, 10) },
    { url: `${baseUrl}/privacy`, lastModified: new Date().toISOString().slice(0, 10) },
    ...postUrls
  ]
}
