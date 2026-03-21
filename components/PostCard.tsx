import Link from "next/link"
import { format } from "date-fns"
import type { PostSummary } from "@/lib/posts"
import Image from "next/image"

export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="card">
      {post.hero && (
        <Image
          src={post.hero}
          alt={post.title}
          width={800}
          height={180}
          sizes="(max-width: 800px) 100vw, 800px"
          priority={false}
        />
      )}
      <div className="card-content">
        {post.categories && post.categories.length > 0 && (
          <div className="card-categories">
            {post.categories.map((cat) => (
              <span key={cat} className="category-badge">{cat}</span>
            ))}
          </div>
        )}
        <Link className="card-title" href={`/posts/${post.slug}`}>{post.title}</Link>
        <div className="card-meta">{format(new Date(post.date), "PPP")}</div>
        <p className="muted">{post.description}</p>
      </div>
    </article>
  )
}
