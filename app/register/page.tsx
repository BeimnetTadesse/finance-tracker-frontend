// 'use client'

// import React, { useState, FormEvent } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'

// export default function RegisterPage() {
//   const router = useRouter()
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     password2: '',
//   })

//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault()
//     setError('')
//     setLoading(true)

//     if (formData.password !== formData.password2) {
//       setError("Passwords don't match.")
//       setLoading(false)
//       return
//     }

//     try {
//       // 1️⃣ Register the user
//       const res = await fetch('http://localhost:8000/api/accounts/register/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       })

//       if (!res.ok) {
//         let errorMessage = 'Registration failed.'
//         try {
//           const errorData = await res.json()
//           errorMessage = Object.values(errorData).flat().join(' ') || errorMessage
//         } catch {
//           errorMessage = await res.text() || errorMessage
//         }
//         throw new Error(errorMessage)
//       }

//       // 2️⃣ Auto-login after successful registration
//       const loginRes = await fetch('http://localhost:8000/api/accounts/login/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username: formData.username, password: formData.password }),
//       })

//       if (!loginRes.ok) throw new Error('Login after registration failed')

//       const loginData = await loginRes.json()
//       localStorage.setItem('accessToken', loginData.access)
//       localStorage.setItem('refreshToken', loginData.refresh)

//       // 3️⃣ Redirect to dashboard
//       router.push('/dashboard')
//     } catch (err) {
//       console.error('❌ Registration error:', err)
//       if (err instanceof Error) setError(err.message)
//       else setError('An unexpected error occurred.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg space-y-6"
//       >
//         <h2 className="text-3xl font-bold text-center text-gray-800">Register</h2>
//         {error && (
//           <p className="text-red-600 bg-red-100 p-3 rounded-md text-center border border-red-200">
//             {error}
//           </p>
//         )}

//         <div>
//           <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-1">
//             Username
//           </label>
//           <input
//             type="text"
//             id="username"
//             name="username"
//             placeholder="Choose a username"
//             value={formData.username}
//             onChange={handleChange}
//             required
//             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         </div>

//         <div>
//           <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
//             Email
//           </label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             placeholder="Enter your email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         </div>

//         <div>
//           <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
//             Password
//           </label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             placeholder="Create a password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         </div>

//         <div>
//           <label htmlFor="password2" className="block text-gray-700 text-sm font-medium mb-1">
//             Confirm Password
//           </label>
//           <input
//             type="password"
//             id="password2"
//             name="password2"
//             placeholder="Confirm your password"
//             value={formData.password2}
//             onChange={handleChange}
//             required
//             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-purple-700 text-white p-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? 'Registering...' : 'Register'}
//         </button>

//         <p className="text-sm text-center text-gray-600">
//           Already have an account?{' '}
//           <Link href="/login" className="text-purple-700 hover:underline font-medium">
//             Login here
//           </Link>
//         </p>
//       </form>
//     </div>
//   )
// }

'use client'

import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.password2) {
      setError("Passwords don't match.")
      setLoading(false)
      return
    }

    try {
      // Register
      const res = await fetch('https://beimnettadesse.pythonanywhere.com/api/accounts/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        let errorMessage = 'Registration failed.'
        try {
          const errorData = await res.json()
          errorMessage = Object.values(errorData).flat().join(' ') || errorMessage
        } catch {
          errorMessage = await res.text() || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Auto-login
      const loginRes = await fetch('https://beimnettadesse.pythonanywhere.com/api/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      })
      if (!loginRes.ok) throw new Error('Login after registration failed')

      const loginData = await loginRes.json()
      localStorage.setItem('accessToken', loginData.access)
      localStorage.setItem('refreshToken', loginData.refresh)

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
      {/* Left Hero Section - identical to login */}
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

      {/* Right Registration Form */}
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
              <h2 className="text-2xl font-bold mb-1">Register</h2>
              <p className="text-gray-500">Create a new account</p>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-200 rounded">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="password">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
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

                <div>
                  <label className="block text-gray-700 mb-1" htmlFor="password2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPassword2 ? 'text' : 'password'}
                      id="password2"
                      name="password2"
                      placeholder="Confirm your password"
                      value={formData.password2}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword2(!showPassword2)}
                    >
                      {showPassword2 ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-700 text-white p-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm">
                Already have an account?{' '}
                <button onClick={() => router.push('/login')} className="text-purple-700 font-medium hover:underline">
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
