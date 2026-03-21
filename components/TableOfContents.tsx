"use client"

import GithubSlugger from "github-slugger"
import Link from "next/link"
import { useState } from "react"

export default function TableOfContents({ headings }: { headings: { depth: number; text: string }[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const slugger = new GithubSlugger()

  if (headings.length === 0) return null

  return (
    <div className={`toc-container ${isOpen ? "is-open" : ""}`}>
      <button className="toc-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span>Table of contents</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div className="toc-content">
        <ul className="toc-list">
          {headings.map((h, i) => {
            const id = slugger.slug(h.text)
            return (
              <li key={i} className={`toc-item depth-${h.depth}`}>
                <Link href={`#${id}`} onClick={() => setIsOpen(false)}>{h.text}</Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
