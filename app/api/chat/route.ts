import { NextResponse } from "next/server"

async function requestGroqWithFallback(apiKey: string, bodyFactory: (model: string) => Record<string, unknown>) {
  const primaryModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
  const fallbackModel = process.env.GROQ_FALLBACK_MODEL || "llama-3.1-8b-instant"
  const models = [primaryModel, fallbackModel]
  let lastError = ""

  for (const model of models) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(bodyFactory(model))
    })

    if (res.ok) {
      return res.json()
    }

    const text = await res.text()
    lastError = `model=${model} status=${res.status} body=${text}`
  }

  throw new Error(`Groq API error after fallback: ${lastError}`)
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 })
    }

    const data = await requestGroqWithFallback(apiKey, (model) => ({
      model,
      messages: [
        {
          role: "system",
          content: "You are the official AI assistant for 'swatsense', a blog about recovery, finance, crypto, and motivation. Be helpful, concise, and encourage users to read our daily posts. Use a friendly and motivational tone."
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    }))
    return NextResponse.json({ message: data.choices[0].message })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
