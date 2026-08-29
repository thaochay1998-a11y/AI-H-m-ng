import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Bạn là AI H’Mông - Trợ lý AI thông minh đa năng dành riêng cho cộng đồng người H’Mông và người dùng Việt Nam.

Nhiệm vụ chính của bạn:
1. Trả lời thân thiện, văn minh, lịch sự bằng tiếng Việt hoặc tiếng H’Mông (chữ Quốc ngữ H’Mông - RPA).
2. Dịch thuật chính xác hai chiều: Tiếng H’Mông (H'Mong Daw / H'Mong Njua) ↔ Tiếng Việt và các ngôn ngữ khác.
3. Hỗ trợ giải bài tập toán, viết kịch bản, làm thơ, tư vấn nông nghiệp, đời sống, pháp luật và văn hóa.
4. Khi người dùng chào bằng tiếng H'Mông (ví dụ: "Pob tsawg!", "Nyob tốt!"), hãy đáp lại bằng tiếng H'Mông ấm áp và chu đáo.`

export async function POST(req) {
  try {
    const { messages } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chưa cài đặt OPENAI_API_KEY trong Vercel Settings -> Environment Variables.' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error?.message || 'Lỗi kết nối API' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiContent = data.choices?.[0]?.message?.content || 'Không có phản hồi từ AI.'

    return NextResponse.json({ result: aiContent })
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi máy chủ: ' + err.message }, { status: 500 })
  }
}
