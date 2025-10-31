import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function ListingDetail() {
  const { id } = useParams()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Load actual listing from API
    const sampleListing = {
      id: '1',
      title: 'TI-84 Plus Calculator',
      category: 'Electronics',
      price: 45,
      description: 'Used for one semester, perfect condition. Includes case. All functions work perfectly. No scratches or damage.',
      condition: 'Like New',
      userEmail: 'student1@uakron.edu',
      createdAt: new Date().toISOString()
    }
    setListing(sampleListing)
    setLoading(false)
  }, [id])

  const categoryIcons: Record<string, string> = {
    'Textbooks': '📚',
    'Electronics': '💻',
    'Dorm Furniture': '🛏️',
    'Akron Gear': '🦘',
    'Services': '🔧'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Listing not found</p>
          <Link to="/listings" className="text-[#041E42] hover:text-[#FFC72C] transition-colors">
            Back to Listings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/listings" className="text-[#041E42] hover:text-[#FFC72C] mb-6 inline-block transition-colors">
          ← Back to Listings
        </Link>
        
        <div className="bg-white rounded-xl shadow-apple overflow-hidden">
          <div className="h-96 bg-gradient-to-br from-[#041E42] to-blue-800 flex items-center justify-center">
            <span className="text-9xl">{categoryIcons[listing.category] || '📦'}</span>
          </div>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-[#041E42] mb-2">{listing.title}</h1>
                <p className="text-3xl font-bold text-[#041E42] mb-2">${listing.price.toFixed(2)}</p>
              </div>
              <span className="bg-[#FFC72C] text-[#041E42] px-4 py-2 rounded-full font-semibold text-sm">
                {listing.category}
              </span>
            </div>
            
            <div className="border-t border-b border-gray-200 py-6 my-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Condition</p>
                  <p className="font-semibold text-[#041E42]">{listing.condition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-semibold text-[#041E42]">{listing.category}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#041E42] mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-[#041E42] mb-2">Seller Information</h3>
              <p className="text-sm text-gray-600">{listing.userEmail}</p>
              <p className="text-xs text-gray-500 mt-2">Verified @uakron.edu student</p>
            </div>
            
            <div className="flex space-x-4">
              <button className="flex-1 bg-[#041E42] hover:bg-opacity-90 text-white font-semibold py-4 px-6 rounded-xl transition-colors">
                Contact Seller
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-[#041E42] font-semibold py-4 px-6 rounded-xl transition-colors">
                Save for Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingDetail
