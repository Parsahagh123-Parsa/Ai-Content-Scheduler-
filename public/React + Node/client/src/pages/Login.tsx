import { Link } from 'react-router-dom'
import { useState } from 'react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.toLowerCase().endsWith('@uakron.edu')) {
      setError('Please use your @uakron.edu email address')
      return
    }
    
    // TODO: Implement actual authentication
    console.log('Login attempt:', email, password)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="w-12 h-12 bg-[#041E42] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">🦘</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#041E42]">Sign in to Akron Marketplace</h2>
          <p className="mt-2 text-sm text-gray-600">Use your @uakron.edu email address</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-apple -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-t-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-[#041E42] focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent sm:text-sm"
                placeholder="yourname@uakron.edu"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-b-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-[#041E42] focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/register" className="font-medium text-[#041E42] hover:text-[#FFC72C] transition-colors">
                Don't have an account? Sign up
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#041E42] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC72C] transition-colors"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
