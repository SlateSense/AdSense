"use client"
import Script from "next/script"
import { adsScriptUrl } from "@/site.config"

export default function AdsSlot({ type = "banner" }: { type?: "banner" | "inline" | "sidebar" }) {
  if (!adsScriptUrl) {
    return <div className={`ads ${type}`}>Ad slot</div>
  }
  return (
    <>
      <Script src={adsScriptUrl} async strategy="lazyOnload" />
      <div className={`ads ${type}`} />
    </>
  )
}
