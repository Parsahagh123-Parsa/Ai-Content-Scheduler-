import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-[#041E42] text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-[#FFC72C] rounded-lg flex items-center justify-center">
                <span className="text-[#041E42] font-bold">🦘</span>
              </div>
              <span className="text-xl font-bold">Akron Marketplace</span>
            </div>
            <p className="text-gray-400 text-sm">
              The student-only marketplace for University of Akron students.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Students</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Safety Guidelines</Link></li>
              <li><Link to="/verify" className="hover:text-white transition-colors">Student Verification</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Report Issue</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">University of Akron</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="https://www.uakron.edu" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Official Website</a></li>
              <li><Link to="/" className="hover:text-white transition-colors">Student Services</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Campus Map</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 Akron Marketplace. Built by University of Akron students.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
