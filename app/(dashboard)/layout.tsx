'use client'

import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar' // you'll move your sidebar code to this component

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 font-sans relative overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full px-6 pt-20 md:pt-8 md:pl-8">
        {children}
      </main>
    </div>
  )
}
