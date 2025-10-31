import { Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard'

function Profile() {
  // TODO: Load actual user data and listings
  const user = {
    name: 'Student Name',
    email: 'student@uakron.edu',
    classYear: '2025'
  }
  
  const myListings = [
    {
      id: '1',
      title: 'TI-84 Plus Calculator',
      category: 'Electronics',
      price: 45,
      description: 'Used for one semester, perfect condition.',
      condition: 'Like New'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-apple p-8 mb-8">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-[#041E42] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{user.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#041E42]">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">Class of {user.classYear}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#FFC72C] text-[#041E42] px-3 py-1 rounded-full text-xs font-semibold">
              Verified @uakron.edu
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#041E42]">My Listings</h2>
            <Link
              to="/sell"
              className="bg-[#FFC72C] hover:bg-yellow-400 text-[#041E42] font-semibold py-2 px-6 rounded-xl transition-colors"
            >
              + Create Listing
            </Link>
          </div>
        </div>

        {myListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-apple p-12 text-center">
            <p className="text-gray-500 mb-4">You haven't created any listings yet.</p>
            <Link
              to="/sell"
              className="text-[#041E42] hover:text-[#FFC72C] font-medium transition-colors"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map(listing => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-apple p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Listings</h3>
            <p className="text-3xl font-bold text-[#041E42]">{myListings.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-apple p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Views</h3>
            <p className="text-3xl font-bold text-[#041E42]">0</p>
          </div>
          <div className="bg-white rounded-xl shadow-apple p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Messages</h3>
            <p className="text-3xl font-bold text-[#041E42]">0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
