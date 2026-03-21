import { notFound } from "next/navigation"
import { getAllPosts } from "@/lib/posts"
import PostCard from "@/components/PostCard"
import Pagination from "@/components/Pagination"
import AdsSlot from "@/components/Ads"

export const revalidate = 3600
const PAGE_SIZE = 12

export async function generateStaticParams() {
  const posts = await getAllPosts()
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  return Array.from({ length: totalPages }, (_, i) => ({ page: String(i + 1) }))
}

export default async function PostsPaged({ params }: { params: { page: string } }) {
  const posts = await getAllPosts()
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  const page = Number(params.page)
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return notFound()
  const start = (page - 1) * PAGE_SIZE
  const subset = posts.slice(start, start + PAGE_SIZE)
  return (
    <>
      <section className="page">
        <h1>All Posts</h1>
      </section>
      <AdsSlot type="banner" />
      <section className="grid">
        {subset.map((p) => <PostCard key={p.slug} post={p} />)}
      </section>
      <Pagination basePath="/posts/page" page={page} totalPages={totalPages} />
    </>
  )
}
