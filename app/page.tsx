import { getAllPosts } from "@/lib/posts"
import AdsSlot from "@/components/Ads"
import TagFilter from "@/components/TagFilter"
import CategoryFilter from "@/components/CategoryFilter"
import Link from "next/link"
import { siteName, siteTagline } from "@/site.config"

export const revalidate = 3600

export default async function HomePage() {
  const posts = await getAllPosts()
  const latest = posts.slice(0, 10)
  const top = latest[0]
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).slice(0, 20)
  const allCategories = Array.from(new Set(posts.flatMap((p) => p.categories))).slice(0, 10)
  return (
    <>
      <section className="hero">
        <h1>{siteName}</h1>
        <p>{siteTagline}</p>
        {top && <Link className="btn" href={`/posts/${top.slug}`}>Read today’s post</Link>}
      </section>
      <AdsSlot type="banner" />
      <section className="page">
        <h1>Explore by Category</h1>
        <CategoryFilter categories={allCategories} posts={latest} />
      </section>
      <section className="page">
        <h1>Latest Tags</h1>
        <TagFilter tags={allTags} posts={latest} />
      </section>
    </>
  )
}
