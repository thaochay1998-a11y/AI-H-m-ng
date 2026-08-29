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
import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Bạn là AI H’Mông - Trợ lý AI thông minh đa năng dành riêng cho cộng đồng người H’Mông và người dùng Việt Nam.

Nhiệm vụ:
1. Trả lời thân thiện bằng tiếng Việt hoặc tiếng H'Mông (chữ RPA).
2. Khi người dùng gửi ảnh lên: Hãy phân tích chi tiết khuôn mặt, góc chụp, trang phục và bối cảnh trong ảnh.
3. Nếu người dùng yêu cầu vẽ/thay đổi trang phục/tạo kiểu dáng: Hãy mô tả chi tiết bức ảnh mới bằng tiếng Anh và trả về link ảnh dạng ![Ảnh AI](https://image.pollinations.ai/prompt/[mô_tả_tiếng_Anh_encoded]?width=1024&height=1024&nologo=true).`

export async function POST(req) {
  try {
    const { messages, imageBase64 } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Thiếu GEMINI_API_KEY trên Vercel.' }, { status: 500 })
    }

    const lastMessage = messages[messages.length - 1]?.content || ''
    const lowerMsg = lastMessage.toLowerCase()

    // Chuyển đổi định dạng cho Gemini Vision (Đọc ảnh + Chữ)
    const contents = messages.map((m, index) => {
      const isLast = index === messages.length - 1
      const role = m.role === 'assistant' ? 'model' : 'user'
      
      if (isLast && imageBase64 && role === 'user') {
        const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"))
        const base64Data = imageBase64.split(',')[1]
        return {
          role: 'user',
          parts: [
            { inlineData: { mimeType: mimeType, data: base64Data } },
            { text: m.content || 'Hãy phân tích chi tiết khuôn mặt và trang phục trong bức ảnh này.' }
          ]
        }
      }

      return {
        role: role,
        parts: [{ text: m.content }]
      }
    })

    // Nếu hỏi vẽ hoặc thay đồ
    if (lowerMsg.includes('vẽ') || lowerMsg.includes('tạo ảnh') || lowerMsg.includes('thay đồ') || lowerMsg.includes('chỉnh sửa')) {
      const promptEng = encodeURIComponent(lastMessage + ' Hmong style, high quality, photorealistic, 8k')
      const imageUrl = `https://image.pollinations.ai/prompt/${promptEng}?width=1024&height=1024&nologo=true`
      
      return NextResponse.json({ 
        result: `Dưới đây là phương án ảnh AI H’Mông đã vẽ dựa trên ý tưởng của bạn:\n\n![Ảnh AI](${imageUrl})` 
      })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: contents
        })
      }
    )

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Lỗi API' }, { status: response.status })
    }

    const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được phản hồi.'
    return NextResponse.json({ result: aiContent })
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi máy chủ: ' + err.message }, { status: 500 })
  }
}


