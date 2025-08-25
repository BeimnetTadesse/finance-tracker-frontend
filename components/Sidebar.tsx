'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  Target,
  HelpCircle,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const sidebarLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: CreditCard, label: 'Transactions' },
  { href: '/budgets', icon: Wallet, label: 'Budgets' },
  { href: '/goals', icon: Target, label: 'Savings Goals' },
  { href: '/help', icon: HelpCircle, label: 'Help & Support' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    router.replace('/') // Changed to redirect to home page
  }

  return (
    <>
      {!sidebarOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6 text-purple-700" />
        </button>
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white p-6 shadow-lg flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out z-40
          md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div>
          <div className="flex justify-between items-center mb-6 md:hidden">
            <span className="text-xl font-bold text-purple-700">FinanceMate</span>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-purple-700" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-2xl font-bold text-purple-700 mb-12">
            <LayoutDashboard className="w-6 h-6" />
            <span>FinanceMate</span>
          </div>

          <nav className="space-y-2">
            {sidebarLinks.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-purple-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="inline">{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <button
          onClick={() => {
            handleLogout()
            setSidebarOpen(false)
          }}
          className="flex items-center gap-3 w-full text-red-500 hover:text-red-700 mt-10"
        >
          <LogOut className="w-5 h-5" />
          <span className="inline">Logout</span>
        </button>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}
