import Link from "next/link"
import type { PostSummary } from "@/lib/posts"

export default function RelatedPosts({ current, posts }: { current: PostSummary; posts: PostSummary[] }) {
  const tags = new Set(current.tags)
  const related = posts
    .filter((p) => p.slug !== current.slug && p.tags.some((t) => tags.has(t)))
    .slice(0, 4)
  if (related.length === 0) return null
  return (
    <div style={{ marginTop: 16 }}>
      <h3>Related posts</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {related.map((p) => (
          <li key={p.slug}>
            <Link href={`/posts/${p.slug}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
