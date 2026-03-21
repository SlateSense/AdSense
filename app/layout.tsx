import type { Metadata } from "next"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import Link from "next/link"
import { siteName, siteTagline } from "@/site.config"
import AdsSlot from "@/components/Ads"

export const metadata: Metadata = {
  title: `${siteName} — ${siteTagline}`,
  description: siteTagline,
  icons: { icon: "/favicon.ico" },
  openGraph: {
    siteName,
    title: `${siteName} — ${siteTagline}`,
    description: siteTagline
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — ${siteTagline}`,
    description: siteTagline
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container header-inner">
            <Link className="brand" href="/">{siteName}</Link>
            <nav className="nav">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
          </div>
          <div className="container">
            <AdsSlot type="banner" />
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">
          <div className="container footer-inner">
            <div>&copy; {new Date().getFullYear()} {siteName}</div>
            <div className="footer-note">Fresh posts daily. No logins. Free forever.</div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
