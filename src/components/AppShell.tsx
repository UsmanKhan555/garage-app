'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

type AppShellProps = {
  user: { name?: string | null; email?: string | null } | null
  children: React.ReactNode
}

const publicPaths = ['/login', '/signup']

export default function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname()
  const isPublicPage = publicPaths.includes(pathname)

  if (isPublicPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8 lg:px-10">{children}</div>
      </main>
    </div>
  )
}
