import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import CategoryCard from '../components/CategoryCard'
import ListingCard from '../components/ListingCard'
import { useState, useEffect } from 'react'

function Home() {
  const [listings, setListings] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#041E42] to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Buy, Sell, Trade with Fellow Zips
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            A private, student-only marketplace built exclusively for University of Akron students. 
            Connect with verified @uakron.edu email accounts for a trusted community experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register" className="bg-[#FFC72C] hover:bg-yellow-400 text-[#041E42] font-semibold py-4 px-8 rounded-xl transition-colors duration-200 text-lg">
              Start Trading Now
            </Link>
            <Link to="/listings" className="bg-white hover:bg-gray-100 text-[#041E42] font-semibold py-4 px-8 rounded-xl transition-colors duration-200 text-lg">
              Browse Listings
            </Link>
          </div>
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-[#041E42] mb-4">Recent Listings</h3>
            <p className="text-xl text-gray-600">See what's available now</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {filteredListings.slice(0, 4).map(listing => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/listings" className="bg-[#041E42] hover:bg-opacity-90 text-white font-semibold py-3 px-8 rounded-xl transition-colors inline-block">
              View All Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-[#041E42] mb-4">Popular Categories</h3>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CategoryCard name="Textbooks" icon="📚" count={150} />
            <CategoryCard name="Dorm Furniture" icon="🛏️" count={75} />
            <CategoryCard name="Electronics" icon="💻" count={90} />
            <CategoryCard name="Akron Gear" icon="🦘" count={45} />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
