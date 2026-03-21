import Link from "next/link"

export default function Pagination({ basePath, page, totalPages }: { basePath: string; page: number; totalPages: number }) {
  const prev = page > 1 ? page - 1 : null
  const next = page < totalPages ? page + 1 : null
  const href = (p: number) => `${basePath}/${p}`
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <nav style={{ display: "flex", gap: 8, alignItems: "center", margin: "16px 0" }}>
      {prev && <Link className="tag" href={href(prev)}>Prev</Link>}
      {pages.map((p) => (
        <Link key={p} className={`tag ${p === page ? "active" : ""}`} href={href(p)}>{p}</Link>
      ))}
      {next && <Link className="tag" href={href(next)}>Next</Link>}
    </nav>
  )
}
