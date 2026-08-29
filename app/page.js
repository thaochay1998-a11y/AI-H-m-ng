'use client'

import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Pob tsawg! Tôi là AI H’Mông. Bạn cần hỗ trợ gì hôm nay?' }
  ])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: 'user', content: input }])
    setInput('')
  }

  return (
    <main className="flex flex-col h-screen max-w-md mx-auto p-4 bg-slate-900">
      <header className="pb-4 border-b border-slate-800 flex justify-between items-center">
        <h1 className="font-bold text-emerald-400 text-lg">AI H’Mông</h1>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
          Miễn phí
        </span>
      </header>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-xl max-w-[80%] text-sm ${
              m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-slate-800 text-sm px-4 py-2 rounded-full focus:outline-none text-white border border-slate-700"
        />
        <button
          onClick={handleSend}
          className="bg-emerald-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-500 transition"
        >
          Gửi
        </button>
      </div>
    </main>
  )
}
