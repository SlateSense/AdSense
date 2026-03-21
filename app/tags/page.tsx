import { getAllPosts } from "@/lib/posts"
import Link from "next/link"

export const revalidate = 3600

export default async function TagsIndexPage() {
  const posts = await getAllPosts()
  const counts = new Map<string, number>()
  for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1)
  const tags = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  return (
    <section className="page">
      <h1>Tags</h1>
      <div className="tags">
        {tags.map(([tag, count]) => (
          <Link key={tag} className="tag" href={`/tags/${encodeURIComponent(tag)}/page/1`}>
            {tag} · {count}
          </Link>
        ))}
      </div>
    </section>
  )
}
