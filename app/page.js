'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Pob tsawg! Tôi là AI H’Mông. Tôi có thể giúp bạn dịch thuật tiếng H’Mông ↔ Việt, giải bài tập, viết kịch bản hoặc trò chuyện hàng ngày. Bạn cần tôi hỗ trợ gì?'
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async (textToSend) => {
    const messageContent = textToSend || input
    if (!messageContent.trim() || isLoading) return

    const userMsg = { role: 'user', content: messageContent }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    if (!textToSend) setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Lỗi kết nối máy chủ')
      }

      setMessages([...newMessages, { role: 'assistant', content: data.result }])
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `⚠️ Lỗi: ${err.message}. Vui lòng kiểm tra OPENAI_API_KEY trên Vercel.`
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex flex-col h-dvh max-w-md mx-auto bg-slate-900 border-x border-slate-800 shadow-2xl relative">
      <header className="p-3 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
            AI
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base leading-tight">AI H’Mông</h1>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Trực tuyến
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowQRModal(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 transition"
        >
          ⭐ Nâng Pro 49k
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-bl-none shadow-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3.5 bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-bl-none text-slate-400 text-xs flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              AI H’Mông đang trả lời...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 py-2 bg-slate-900 border-t border-slate-800/60 flex gap-2 overflow-x-auto">
        {[
          'Dịch: Xin chào sang tiếng H’Mông',
          'Dịch: Koj nyob li cas? sang tiếng Việt',
          'Giải giúp bài toán này',
          'Viết một câu thơ tiếng H’Mông'
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full border border-slate-700/50 transition flex-shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập nội dung cần hỗ trợ..."
          className="flex-1 bg-slate-800/90 text-slate-100 text-sm px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-700/80 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg flex-shrink-0"
        >
          ➔
        </button>
      </form>

      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-5 text-center shadow-2xl relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-amber-400 mb-1">Nâng Cấp Tài Khoản Pro</h2>
            <p className="text-xs text-slate-300 mb-4">
              Không giới hạn lượt chat, ưu tiên tốc độ xử lý.
            </p>

            <div className="bg-white p-3 rounded-2xl inline-block mb-3 shadow-inner">
              <img
                src="https://api.vietqr.io/image/970422-0987654321-compact2.jpg?amount=49000&addInfo=AIHMONG%20PRO"
                alt="VietQR 49k"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl text-left text-xs space-y-1.5 border border-slate-700 text-slate-200">
              <p><strong>Số tiền:</strong> <span className="text-amber-400 font-bold">49.000 VNĐ / tháng</span></p>
              <p><strong>Nội dung CK:</strong> <span className="text-emerald-400 font-mono font-bold">AIHMONG PRO</span></p>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition"
            >
              Xác Nhận Đã Chuyển
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
'use client'
import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [input, setInput] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('hmong_chat_sessions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) {
          setChats(parsed)
          setCurrentChatId(parsed[0].id)
          return
        }
      } catch (e) {}
    }
    createNewChat()
  }, [])

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('hmong_chat_sessions', JSON.stringify(chats))
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, currentChatId])

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0]

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'Cuộc trò chuyện mới',
      messages: [
        {
          role: 'assistant',
          content: 'Pob tsawg! Tôi là AI H’Mông. Bạn có thể gửi ảnh chụp lên đây (bấm biểu tượng 📷) để tôi phân tích khuôn mặt, trang phục hoặc yêu cầu tôi tạo ảnh mới nhé!'
        }
      ]
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    setSidebarOpen(false)
  }

  // Chọn ảnh từ điện thoại
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const sendMessage = async (e) => {
    e?.preventDefault()
    if ((!input.trim() && !selectedImage) || loading || !currentChat) return

    const userText = input || (selectedImage ? 'Phân tích bức ảnh này giúp tôi' : '')
    const imageToSend = selectedImage
    setInput('')
    setSelectedImage(null)

    const userMsgContent = imageToSend 
      ? `![Ảnh tải lên](${imageToSend})\n\n${userText}`
      : userText

    const updatedMessages = [...currentChat.messages, { role: 'user', content: userMsgContent }]
    
    let newTitle = currentChat.title
    if (currentChat.messages.length <= 1) {
      newTitle = userText.length > 20 ? userText.substring(0, 20) + '...' : userText
    }

    setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, title: newTitle, messages: updatedMessages } : c))
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages,
          imageBase64: imageToSend
        })
      })

      const data = await res.json()
      const aiReply = res.ok ? data.result : ('⚠️ Lỗi: ' + (data.error || 'Không thể kết nối.'))

      setChats(prev => prev.map(c => {
        if (c.id === currentChatId) {
          return { ...c, messages: [...updatedMessages, { role: 'assistant', content: aiReply }] }
        }
        return c
      }))
    } catch (err) {
      setChats(prev => prev.map(c => {
        if (c.id === currentChatId) {
          return { ...c, messages: [...updatedMessages, { role: 'assistant', content: '⚠️ Lỗi máy chủ.' }] }
        }
        return c
      }))
    } finally {
      setLoading(false)
    }
  }

  const renderMessageContent = (content) => {
    const imgRegex = /!\[.*?\]\((https?:\/\/.*?|data:image\/.*?)\)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = imgRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index))
      }
      parts.push(
        <div key={match[1]} className="my-2">
          <img src={match[1]} alt="Uploaded or Generated" className="rounded-xl w-full max-w-md shadow-md border border-slate-700" />
        </div>
      )
      lastIndex = imgRegex.lastIndex
    }
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }
    return parts.length > 0 ? parts : content
  }

  return (
    <div className="flex h-screen bg-[#1e1e2e] text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#181825] border-r border-slate-800 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-3">
          <button onClick={createNewChat} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-medium transition text-emerald-400">
            <span className="text-xl font-bold">+</span> Đoạn chat mới
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {chats.map(chat => (
            <div key={chat.id} onClick={() => { setCurrentChatId(chat.id); setSidebarOpen(false); }} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition ${chat.id === currentChatId ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/50'}`}>
              <span className="truncate flex-1">💬 {chat.title}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col h-full relative">
        <header className="flex items-center justify-between p-3.5 bg-[#181825] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300">☰</button>
            <span className="font-semibold text-sm">AI H’Mông</span>
          </div>
          <button onClick={createNewChat} className="md:hidden text-xs bg-emerald-600/20 text-emerald-400 px-2.5 py-1.5 rounded-lg">+ Mới</button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl w-full mx-auto">
          {currentChat?.messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-[#2a2a3c] text-slate-100 border border-slate-700/60 rounded-tl-none'}`}>
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#2a2a3c] px-4 py-3 rounded-2xl text-xs text-slate-400 animate-pulse">
                AI H’Mông đang xem ảnh & xử lý...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Form nhập + Tải ảnh */}
        <footer className="p-3 bg-[#181825] border-t border-slate-800">
          {selectedImage && (
            <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 bg-[#2a2a3c] p-2 rounded-xl border border-slate-700">
              <img src={selectedImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
              <span className="text-xs text-emerald-400 flex-1">Đã chọn ảnh thành công!</span>
              <button onClick={() => setSelectedImage(null)} className="text-xs text-red-400 px-2">Xóa</button>
            </div>
          )}
          <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-2">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              className="hidden" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#2a2a3c] hover:bg-slate-700 border border-slate-700 px-3.5 py-3 rounded-xl text-lg transition"
              title="Tải ảnh từ điện thoại"
            >
              📷
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập yêu cầu hoặc bấm 📷 tải ảnh lên..."
              className="flex-1 bg-[#2a2a3c] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-medium text-sm transition disabled:opacity-50">
              Gửi
            </button>
          </form>
        </footer>
      </div>
    </div>
  )
}
