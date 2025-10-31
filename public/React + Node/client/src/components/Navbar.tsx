import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-white shadow-apple sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#041E42] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">🦘</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#041E42]">Akron Marketplace</h1>
              <p className="text-xs text-gray-500">University of Akron Students Only</p>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/listings" className="text-[#041E42] hover:text-[#FFC72C] font-medium transition-colors">
              Browse
            </Link>
            <Link to="/sell" className="text-[#041E42] hover:text-[#FFC72C] font-medium transition-colors">
              Sell
            </Link>
            <Link to="/chat" className="text-[#041E42] hover:text-[#FFC72C] font-medium transition-colors">
              Messages
            </Link>
            <Link to="/profile" className="text-[#041E42] hover:text-[#FFC72C] font-medium transition-colors">
              Profile
            </Link>
            <Link to="/login" className="bg-[#041E42] hover:bg-opacity-90 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Sign In
            </Link>
          </div>
          
          <div className="md:hidden">
            <Link to="/login" className="bg-[#041E42] text-white font-semibold py-2 px-4 rounded-lg text-sm">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
