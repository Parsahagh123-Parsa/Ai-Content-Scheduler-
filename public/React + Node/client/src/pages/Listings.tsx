import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard'
import SearchBar from '../components/SearchBar'

function Listings() {
  const [searchParams] = useSearchParams()
  const [listings, setListings] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '')

  useEffect(() => {
    // Load sample listings
    const sampleListings = [
      {
        id: '1',
        title: 'TI-84 Plus Calculator',
        category: 'Electronics',
        price: 45,
        description: 'Used for one semester, perfect condition. Includes case.',
        condition: 'Like New'
      },
      {
        id: '2',
        title: 'Calculus 1 Textbook',
        category: 'Textbooks',
        price: 60,
        description: 'Essential Calculus Early Transcendentals 8th edition. Barely used.',
        condition: 'Like New'
      },
      {
        id: '3',
        title: 'Mini Fridge',
        category: 'Dorm Furniture',
        price: 80,
        description: '3.2 cu ft mini fridge. Perfect for dorms. Works great!',
        condition: 'Good'
      },
      {
        id: '4',
        title: 'Akron University Hoodie',
        category: 'Akron Gear',
        price: 35,
        description: 'Official UA hoodie, size L. Worn a few times, excellent condition.',
        condition: 'Like New'
      }
    ]
    setListings(sampleListings)
  }, [])

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || listing.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#041E42] mb-4">Browse Listings</h1>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <SearchBar onSearch={setSearchQuery} />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border-2 border-[#041E42] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C] text-[#041E42]"
            >
              <option value="">All Categories</option>
              <option value="Textbooks">📚 Textbooks</option>
              <option value="Dorm Furniture">🛏️ Dorm Furniture</option>
              <option value="Electronics">💻 Electronics</option>
              <option value="Akron Gear">🦘 Akron Gear</option>
              <option value="Services">🔧 Services</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-[#041E42]">{filteredListings.length}</span> listings
          </p>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No listings found.</p>
            <Link to="/sell" className="text-[#041E42] hover:text-[#FFC72C] font-medium transition-colors">
              Create the first one!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Listings
