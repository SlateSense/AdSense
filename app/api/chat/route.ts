import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 })
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content: "You are the official AI assistant for 'Spectra Star', a blog about recovery, finance, crypto, and motivation. Be helpful, concise, and encourage users to read our daily posts. Use a friendly and motivational tone."
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json({ error: errorData.error?.message || "Groq API error" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ message: data.choices[0].message })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
