"use client"
import { useMemo, useState } from "react"
import PostCard from "./PostCard"
import type { PostSummary } from "@/lib/posts"

export default function TagFilter({ tags, posts }: { tags: string[]; posts: PostSummary[] }) {
  const [active, setActive] = useState<string | null>(null)
  const filtered = useMemo(() => {
    if (!active) return posts
    return posts.filter((p) => p.tags.includes(active))
  }, [active, posts])
  return (
    <>
      <div className="tags">
        {tags.map((t) => (
          <button
            key={t}
            className={`tag ${active === t ? "active" : ""}`}
            onClick={() => setActive(active === t ? null : t)}
          >
            {t}
          </button>
        ))}
        <button className={`tag ${active === null ? "active" : ""}`} onClick={() => setActive(null)}>
          All
        </button>
      </div>
      <div className="grid">
        {filtered.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </>
  )
}
