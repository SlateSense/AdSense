import { notFound } from "next/navigation"
import { getAllPosts } from "@/lib/posts"
import PostCard from "@/components/PostCard"
import Pagination from "@/components/Pagination"
import AdsSlot from "@/components/Ads"

export const revalidate = 3600
const PAGE_SIZE = 12

export async function generateStaticParams() {
  const posts = await getAllPosts()
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags)))
  const params: { tag: string; page: string }[] = []
  for (const tag of tags) {
    const tp = posts.filter((p) => p.tags.includes(tag))
    const totalPages = Math.max(1, Math.ceil(tp.length / PAGE_SIZE))
    for (let i = 1; i <= totalPages; i++) params.push({ tag, page: String(i) })
  }
  return params
}

export default async function TagPaged({ params }: { params: { tag: string; page: string } }) {
  const posts = await getAllPosts()
  const tag = decodeURIComponent(params.tag)
  const tp = posts.filter((p) => p.tags.includes(tag))
  if (tp.length === 0) return notFound()
  const totalPages = Math.max(1, Math.ceil(tp.length / PAGE_SIZE))
  const page = Number(params.page)
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return notFound()
  const start = (page - 1) * PAGE_SIZE
  const subset = tp.slice(start, start + PAGE_SIZE)
  return (
    <>
      <section className="page">
        <h1>Tag: {tag}</h1>
      </section>
      <AdsSlot type="banner" />
      <section className="grid">
        {subset.map((p) => <PostCard key={p.slug} post={p} />)}
      </section>
      <Pagination basePath={`/tags/${encodeURIComponent(tag)}/page`} page={page} totalPages={totalPages} />
    </>
  )
}
