export const metadata = {
  title: 'AI H’Mông',
  description: 'Trợ lý AI H’Mông',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
