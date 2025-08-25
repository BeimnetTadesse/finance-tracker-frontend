'use client'

import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        let errorMessage = 'Invalid username or password'
        try {
          const errorData = await res.json()
          if (errorData?.detail) errorMessage = errorData.detail
        } catch {}
        throw new Error(errorMessage)
      }

      const data = await res.json()
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof Error) setError(err.message)
      else setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-tr from-white/10 via-white/5 to-white/10"></div>
        <div className="flex flex-col justify-center items-center p-12 relative z-10 text-center w-full">
          <button
            onClick={() => router.push('/')}
            className="absolute top-8 left-8 flex items-center gap-2 bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition"
          >
            <ArrowLeft className="w-4 h-4"/> Back
          </button>

          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <LayoutDashboard className="w-12 h-12"/>
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-bold">FinanceMate</h1>
              <div className="w-32 h-1 bg-white/40 mx-auto rounded-full"></div>
              <p className="text-lg opacity-90 max-w-sm leading-relaxed">
                Your Personal Finance Companion
              </p>
            </div>
          </div>

          <blockquote className="mt-16 text-lg italic opacity-90 max-w-md mx-auto">
            "Take control of your financial future with confidence and clarity."
          </blockquote>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile back button */}
          <button
            onClick={() => router.push('/')}
            className="lg:hidden mb-8 flex items-center gap-2 text-purple-700 hover:text-purple-900 transition"
          >
            <ArrowLeft className="w-4 h-4"/> Back
          </button>

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <LayoutDashboard className="w-8 h-8 text-purple-700"/>
            <span className="text-2xl font-bold text-purple-700">FinanceMate</span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 text-center border-b border-gray-100">
              <h2 className="text-2xl font-bold mb-1">Login</h2>
              <p className="text-gray-500">Enter your credentials to access your account</p>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-200 rounded">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-700 text-white p-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm">
                Don’t have an account?{' '}
                <Link href="/register" className="text-purple-700 hover:underline font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
