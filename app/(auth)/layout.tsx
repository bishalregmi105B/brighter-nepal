// (auth) layout — Auth routes: minimal centered layout
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface">
      {children}
    </main>
  )
}
