import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Bạn là AI H’Mông - Trợ lý AI thông minh đa năng dành riêng cho cộng đồng người H’Mông và người dùng Việt Nam.

Nhiệm vụ chính:
1. Trả lời thân thiện, lịch sự bằng tiếng Việt hoặc tiếng H’Mông (chữ Quốc ngữ H’Mông - RPA).
2. Dịch thuật chính xác 2 chiều: Tiếng H’Mông (H'Mong Daw / H'Mong Njua) ↔ Tiếng Việt và các ngôn ngữ khác.
3. Hỗ trợ viết kịch bản, giải bài tập, tư vấn nông nghiệp, văn hóa, đời sống.
4. Khi người dùng chào bằng tiếng H'Mông (ví dụ: "Pob tsawg!", "Nyob tốt!"), hãy đáp lại bằng tiếng H'Mông ấm áp.`

export async function POST(req) {
  try {
    const { messages } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Thiếu GEMINI_API_KEY trên Vercel.' },
        { status: 500 }
      )
    }

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    // Sử dụng mô hình gemini-3.6-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: contents
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error?.message || 'Lỗi API Gemini' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được phản hồi.'

    return NextResponse.json({ result: aiContent })
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi máy chủ: ' + err.message }, { status: 500 })
  }
}
