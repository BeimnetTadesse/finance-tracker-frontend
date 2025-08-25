'use client'

import React, { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  PiggyBank, 
  Target, 
  Shield, 
  Smartphone,
  ChevronRight,
  CreditCard,
  BarChart3,
  Menu,
  X,
} from 'lucide-react'

const Home = () => {
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  
  // Ref for Features section
  const featuresRef = useRef<HTMLDivElement>(null)

  const features = [
    { icon: PiggyBank, title: 'Smart Savings', description: 'Set and track your savings goals with intelligent recommendations' },
    { icon: BarChart3, title: 'Budget Tracking', description: 'Monitor your spending with detailed budget analytics and insights' },
    { icon: CreditCard, title: 'Transaction History', description: 'Keep track of all your income and expenses in one place' },
    { icon: Target, title: 'Financial Goals', description: 'Achieve your financial dreams with personalized goal setting' },
    { icon: Shield, title: 'Secure & Private', description: 'Bank-level security to keep your financial data safe' },
    { icon: Smartphone, title: 'Mobile Ready', description: 'Access your finances anytime, anywhere with responsive design' }
  ]

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-purple-100 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-purple-100/60 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 text-purple-700" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
              FinanceMate
            </span>
          </div>
          
          {/* Desktop buttons */}
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-purple-700 font-medium rounded-lg hover:bg-purple-200/50 transition-all duration-300"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-4 py-2 bg-gradient-to-r from-purple-700 to-purple-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-purple-200/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-purple-100 py-4 px-6 absolute w-full left-0 top-full">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  router.push('/login')
                  setMobileMenuOpen(false)
                }}
                className="w-full py-3 text-purple-700 font-medium rounded-lg hover:bg-purple-100 transition-all duration-300 text-left px-4"
              >
                Login
              </button>
              <button
                onClick={() => {
                  router.push('/register')
                  setMobileMenuOpen(false)
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-purple-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-left px-4"
              >
                Get Started
              </button>
              <button
                onClick={scrollToFeatures}
                className="w-full py-3 text-purple-700 font-medium rounded-lg hover:bg-purple-100 transition-all duration-300 text-left px-4"
              >
                Learn More
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center text-center overflow-hidden px-4 sm:px-6">
        {/* Floating Circles */}
        <div className="absolute -top-24 -left-24 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] rounded-full bg-purple-300/50 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] rounded-full bg-purple-400/40 blur-3xl animate-float-slow"></div>

        {/* Content */}
        <div className="container mx-auto max-w-3xl relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 md:mb-8">
            <span className="bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
              Take Control of Your Financial Future
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 md:mb-12 mx-auto leading-relaxed max-w-3xl px-4">
            FinanceMate helps you track expenses, create budgets, and achieve your savings goals with intuitive tools for modern financial management.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-4 sm:px-8 sm:py-4 md:px-10 md:py-5 bg-gradient-to-r from-purple-700 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1"
            >
              Start Your Journey <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={scrollToFeatures}
              className="px-6 py-4 sm:px-8 sm:py-4 md:px-10 md:py-5 border border-purple-200 text-purple-700 font-semibold rounded-lg hover:bg-purple-100 transition-all duration-300 hover:-translate-y-1"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 sm:py-20 md:py-24 bg-purple-50 px-4 sm:px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">
            <span className="bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
              Everything You Need for Financial Success
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-2 border border-purple-100"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-5 flex items-center justify-center bg-gradient-to-br from-purple-200 to-purple-100 rounded-xl shadow-inner">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-700" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-28 bg-gradient-to-br from-purple-100 via-purple-50 to-purple-200 text-center relative overflow-hidden px-4 sm:px-6">
        {/* Soft floating shapes */}
        <div className="absolute -top-20 left-0 w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] rounded-full bg-purple-200/30 blur-3xl animate-float-slow"></div>
        <div className="absolute -bottom-20 right-0 w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] rounded-full bg-purple-300/20 blur-3xl animate-float-slow"></div>

        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 md:mb-6 text-purple-600">
            Ready to Transform Your Finances?
          </h2>
          <p className="mb-8 md:mb-10 text-base sm:text-lg md:text-xl max-w-xl mx-auto text-purple-700 leading-relaxed">
            Join thousands of users who have taken control of their financial future with FinanceMate.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-700 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto hover:-translate-y-1"
          >
            Get Started Today <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 md:py-12 bg-white border-t border-purple-200 text-center text-gray-600 px-4 sm:px-6">
        <div className="flex justify-center items-center gap-2 mb-3 md:mb-4">
          <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700" />
          <span className="font-bold text-purple-700 text-lg sm:text-xl">FinanceMate</span>
        </div>
        <p className="text-sm sm:text-base">&copy; {currentYear} FinanceMate. All rights reserved.</p>
      </footer>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default Home