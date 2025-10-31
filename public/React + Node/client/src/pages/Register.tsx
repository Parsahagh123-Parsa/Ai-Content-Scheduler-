import { Link } from 'react-router-dom'
import { useState } from 'react'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.toLowerCase().endsWith('@uakron.edu')) {
      setError('You must use your @uakron.edu email address')
      return
    }
    
    // TODO: Implement actual registration
    console.log('Registration attempt:', { email, password, firstName, lastName })
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
          <h2 className="text-3xl font-bold text-[#041E42]">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">University of Akron students only</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#041E42] mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-[#041E42] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent sm:text-sm"
                placeholder="yourname@uakron.edu"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#041E42] mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-[#041E42] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent sm:text-sm"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[#041E42] mb-2">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-[#041E42] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[#041E42] mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-[#041E42] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent sm:text-sm"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>By signing up, you agree that you are a University of Akron student with a valid @uakron.edu email address.</p>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#041E42] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC72C] transition-colors"
            >
              Create Account
            </button>
          </div>

          <div className="text-center text-sm">
            <Link to="/login" className="font-medium text-[#041E42] hover:text-[#FFC72C] transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
