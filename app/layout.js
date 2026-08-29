export const metadata = {
  title: 'AI H’Mông - Trợ lý thông minh',
  description: 'Trợ lý AI dành riêng cho cộng đồng H’Mông',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased h-dvh overflow-hidden select-none">
        {children}
      </body>
    </html>
  )
}
