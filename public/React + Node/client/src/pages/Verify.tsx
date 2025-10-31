import { Link } from 'react-router-dom'

function Verify() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 bg-[#FFC72C] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#041E42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#041E42]">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to your @uakron.edu email address
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 text-center space-y-4">
          <p className="text-[#041E42]">
            Please check your inbox and click the verification link to activate your account.
          </p>
          <p className="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or{' '}
            <button className="text-[#041E42] hover:text-[#FFC72C] font-medium transition-colors">
              resend verification email
            </button>
          </p>
        </div>

        <div className="text-center">
          <Link to="/login" className="text-[#041E42] hover:text-[#FFC72C] font-medium transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Verify
