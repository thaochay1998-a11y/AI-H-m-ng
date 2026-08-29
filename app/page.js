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
          content: 'Pob tsawg! Tôi là AI H’Mông. Bấm biểu tượng 📷 để gửi ảnh hoặc nhập câu hỏi / yêu cầu vẽ ảnh nhé!'
        }
      ]
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    setSidebarOpen(false)
  }

  const deleteChat = (id, e) => {
    e.stopPropagation()
    const updated = chats.filter(c => c.id !== id)
    if (updated.length === 0) {
      localStorage.removeItem('hmong_chat_sessions')
      createNewChat()
    } else {
      setChats(updated)
      if (currentChatId === id) {
        setCurrentChatId(updated[0].id)
      }
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setSelectedImage(reader.result)
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
        body: JSON.stringify({ messages: updatedMessages, imageBase64: imageToSend })
      })

      const data = await res.json()
      const aiReply = res.ok ? data.result : ('⚠️ Lỗi: ' + (data.error || 'Không thể kết nối.'))

      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...updatedMessages, { role: 'assistant', content: aiReply }] } : c))
    } catch (err) {
      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...updatedMessages, { role: 'assistant', content: '⚠️ Lỗi máy chủ.' }] } : c))
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
      if (match.index > lastIndex) parts.push(content.substring(lastIndex, match.index))
      parts.push(
        <div key={match[1]} className="my-2">
          <img src={match[1]} alt="Media" className="rounded-xl w-full max-w-md shadow-md border border-slate-700" />
        </div>
      )
      lastIndex = imgRegex.lastIndex
    }
    if (lastIndex < content.length) parts.push(content.substring(lastIndex))
    return parts.length > 0 ? parts : content
  }

  return (
    <div className="flex h-screen bg-[#1e1e2e] text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Menu */}
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
              <button onClick={(e) => deleteChat(chat.id, e)} className="text-slate-500 hover:text-red-400 px-1.5 py-0.5 rounded text-xs transition">✕</button>
            </div>
          ))}
        </div>
      </aside>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden" />
      )}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col h-full relative">
        <header className="flex items-center justify-between p-3.5 bg-[#181825] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300">☰</button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs text-slate-950">AI</div>
              <span className="font-semibold text-sm">AI H’Mông</span>
            </div>
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
              <div className="bg-[#2a2a3c] px-4 py-3 rounded-2xl text-xs text-slate-400 animate-pulse">AI H’Mông đang xử lý...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-3 bg-[#181825] border-t border-slate-800">
          {selectedImage && (
            <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 bg-[#2a2a3c] p-2 rounded-xl border border-slate-700">
              <img src={selectedImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
              <span className="text-xs text-emerald-400 flex-1">Đã chọn ảnh!</span>
              <button onClick={() => setSelectedImage(null)} className="text-xs text-red-400 px-2">Xóa</button>
            </div>
          )}
          <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-2">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-[#2a2a3c] border border-slate-700 px-3.5 py-3 rounded-xl text-lg">📷</button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 bg-[#2a2a3c] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
            <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-medium text-sm">Gửi</button>
          </form>
        </footer>
      </div>
    </div>
  )
  }
