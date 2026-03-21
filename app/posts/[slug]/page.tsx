import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllSlugs, getPost } from "@/lib/posts"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkSlug from "remark-slug"
import ShareButtons from "@/components/ShareButtons"
import AdsSlot from "@/components/Ads"
import { siteUrl } from "@/site.config"
import Image from "next/image"
import TableOfContents from "@/components/TableOfContents"
import Sidebar from "@/components/Sidebar"
import RelatedPosts from "@/components/RelatedPosts"
import { getAllPosts, getMostLinkedPosts, getPopularPosts } from "@/lib/posts"

export const dynamic = "force-static"

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return {}
  const url = `${siteUrl}/posts/${post.slug}`
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      images: post.hero ? [{ url: post.hero }] : undefined
    }
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) return notFound()
  const url = `${siteUrl}/posts/${post.slug}`
  const words = post.content.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 200))
  const all = await getAllPosts()
  const popular = await getPopularPosts()
  const mostLinked = await getMostLinkedPosts()
  const headings = post.content
    .split("\n")
    .map((line) => {
      const m2 = line.match(/^##\s+(.*)$/)
      if (m2) return { depth: 2, text: m2[1].trim() }
      const m3 = line.match(/^###\s+(.*)$/)
      if (m3) return { depth: 3, text: m3[1].trim() }
      return null
    })
    .filter(Boolean) as { depth: number; text: string }[]
  return (
    <div className="post-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
      <article className="post">
        <h1>{post.title}</h1>
        <div className="meta">
          <span>{new Date(post.date).toLocaleDateString()}</span>
          <span>•</span>
          <span>{minutes} min read</span>
        </div>
        {post.hero && (
          <Image
            src={post.hero}
            alt={post.title}
            width={1200}
            height={600}
            sizes="(max-width: 820px) 100vw, 820px"
            style={{ width: "100%", height: "auto", borderRadius: 12, border: "1px solid #202531" }}
            priority
          />
        )}
        <AdsSlot type="inline" />
        <div className="content">
          <ReactMarkdown remarkPlugins={[remarkGfm as any, remarkSlug as any]}>{post.content}</ReactMarkdown>
        </div>
        <RelatedPosts current={post} posts={all} />
        <ShareButtons url={url} title={post.title} />
      </article>
      <div>
        <TableOfContents headings={headings} />
        <Sidebar posts={all} popular={popular} mostLinked={mostLinked} />
      </div>
    </div>
  )
}
