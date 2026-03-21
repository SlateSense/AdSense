import { getAllPosts } from "@/lib/posts"
import PostCard from "@/components/PostCard"
import Pagination from "@/components/Pagination"
import AdsSlot from "@/components/Ads"

export const revalidate = 3600
const PAGE_SIZE = 12

export default async function PostsIndexPage() {
  const posts = await getAllPosts()
  const page = 1
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  const subset = posts.slice(0, PAGE_SIZE)
  return (
    <>
      <section className="page">
        <h1>All Posts</h1>
        <p className="muted">Browse older articles with pagination.</p>
      </section>
      <AdsSlot type="banner" />
      <section className="grid">
        {subset.map((p) => <PostCard key={p.slug} post={p} />)}
      </section>
      <Pagination basePath="/posts/page" page={page} totalPages={totalPages} />
    </>
  )
}
