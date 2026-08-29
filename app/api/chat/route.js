import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { messages, imageBase64 } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Thiếu GEMINI_API_KEY trên Vercel/Netlify.' }, { status: 500 })
    }

    const lastMessage = messages?.[messages.length - 1]?.content || ''
    const lowerMsg = lastMessage.toLowerCase()

    // 1. NHẬN DIỆN YÊU CẦU TẠO / SỬA ẢNH
    const isImageRequest = ['vẽ', 'tạo ảnh', 'hình ảnh', 'chụp ảnh', 'bức ảnh', 'thay trang phục', 'ghép cảnh', 'đổi bối cảnh', 'draw', 'image'].some(kw => lowerMsg.includes(kw))

    if (isImageRequest) {
      let promptText = lastMessage
        .replace(/tạo ảnh|vẽ giúp|vẽ cho|vẽ|chụp ảnh|bức ảnh|hình ảnh|cho tôi|giúp tôi|thay trang phục|ghép cảnh/gi, '')
        .trim()
      
      if (!promptText) promptText = 'A Hmong person in vibrant traditional clothing, highly detailed portrait'
      
      const enhancedPrompt = `${promptText}, highly detailed, photorealistic, 8k resolution, cinematic lighting`
      const encodedPrompt = encodeURIComponent(enhancedPrompt)
      const randomSeed = Math.floor(Math.random() * 999999)
      
      // Chạy qua AI Flux Engine
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${randomSeed}&nologo=true&model=flux`

      return NextResponse.json({
        result: `AI H’Mông đã xử lý và tạo ảnh theo yêu cầu của bạn:\n\n![Ảnh AI](${imageUrl})`
      })
    }

    // 2. NHẬN DIỆN VĂN BẢN (Giải toán, Viết kịch bản, Trò chuyện, Đọc ảnh)
    const SYSTEM_PROMPT = `Bạn là AI H’Mông - Trợ lý AI toàn năng dành cho cộng đồng H’Mông và Việt Nam.
Nhiệm vụ của bạn:
- Giải các bài toán, đề thi, bài tập step-by-step rõ ràng.
- Sáng tạo kịch bản video Facebook Reels, TikTok, YouTube theo yêu cầu.
- Đọc, soi và phân tích chi tiết hình ảnh được tải lên.
- Trả lời thân thiện bằng tiếng Việt hoặc tiếng H'Mông (chữ RPA).`

    const contents = (messages || []).map((m, index) => {
      const isLast = index === messages.length - 1
      const role = m.role === 'assistant' ? 'model' : 'user'
      
      if (isLast && imageBase64 && role === 'user') {
        const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'))
        const base64Data = imageBase64.split(',')[1]
        return {
          role: 'user',
          parts: [
            { inlineData: { mimeType: mimeType, data: base64Data } },
            { text: m.content || 'Hãy phân tích bức ảnh này.' }
          ]
        }
      }

      return { role, parts: [{ text: m.content || '' }] }
    })

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
      return NextResponse.json({ error: data.error?.message || 'Lỗi API Gemini' }, { status: response.status })
    }

    const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được phản hồi.'
    return NextResponse.json({ result: aiContent })

  } catch (err) {
    return NextResponse.json({ error: 'Lỗi máy chủ: ' + err.message }, { status: 500 })
  }
}
