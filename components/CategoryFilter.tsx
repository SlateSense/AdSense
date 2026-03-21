"use client"
import { useMemo, useState } from "react"
import PostCard from "./PostCard"
import type { PostSummary } from "@/lib/posts"

export default function CategoryFilter({ categories, posts }: { categories: string[]; posts: PostSummary[] }) {
  const [active, setActive] = useState<string | null>(null)
  const filtered = useMemo(() => {
    if (!active) return posts
    return posts.filter((p) => p.categories.includes(active))
  }, [active, posts])
  return (
    <>
      <div className="tags">
        <button className={`tag ${active === null ? "active" : ""}`} onClick={() => setActive(null)}>
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`tag ${active === c ? "active" : ""}`}
            onClick={() => setActive(active === c ? null : c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid">
        {filtered.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </>
  )
}
