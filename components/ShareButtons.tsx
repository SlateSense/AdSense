"use client"
import { useMemo } from "react"

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const encodedUrl = useMemo(() => encodeURIComponent(url), [url])
  const encodedTitle = useMemo(() => encodeURIComponent(title), [title])
  const links = [
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer.php?u=${encodedUrl}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}` },
    { name: "WhatsApp", href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}` }
  ]
  return (
    <div className="share">
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer">
          {l.name}
        </a>
      ))}
    </div>
  )
}
