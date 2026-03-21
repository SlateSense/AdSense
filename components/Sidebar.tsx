import Link from "next/link"
import AdsSlot from "./Ads"
import type { PostSummary } from "@/lib/posts"

export default function Sidebar({ posts, popular = [], mostLinked = [] }: { posts: PostSummary[], popular?: PostSummary[], mostLinked?: PostSummary[] }) {
  const counts = new Map<string, number>()
  for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1)
  const topTags = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const latest = posts.slice(0, 6)
  return (
    <aside style={{ position: "sticky", top: 16 }}>
      <AdsSlot type="sidebar" />
      
      {popular.length > 0 && (
        <div style={{ border: "1px solid #1c2133", borderRadius: 10, padding: 12, background: "var(--card)", marginTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Popular Posts</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {popular.map((p) => (
              <li key={p.slug} style={{ borderBottom: "1px solid #1c2133", paddingBottom: 6 }}>
                <Link href={`/posts/${p.slug}`} style={{ fontSize: 14, color: "var(--text)", textDecoration: "none" }}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mostLinked.length > 0 && (
        <div style={{ border: "1px solid #1c2133", borderRadius: 10, padding: 12, background: "var(--card)", marginTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Most Linked</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {mostLinked.map((p) => (
              <li key={p.slug} style={{ borderBottom: "1px solid #1c2133", paddingBottom: 6 }}>
                <Link href={`/posts/${p.slug}`} style={{ fontSize: 14, color: "var(--text)", textDecoration: "none" }}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ border: "1px solid #1c2133", borderRadius: 10, padding: 12, background: "var(--card)", marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Top tags</div>
        <div className="tags">
          {topTags.map(([tag]) => (
            <Link key={tag} className="tag" href={`/tags/${encodeURIComponent(tag)}/page/1`}>{tag}</Link>
          ))}
        </div>
      </div>
      
      <div style={{ border: "1px solid #1c2133", borderRadius: 10, padding: 12, background: "var(--card)", marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Latest</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {latest.map((p) => (
            <li key={p.slug}>
              <Link href={`/posts/${p.slug}`}>{p.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
