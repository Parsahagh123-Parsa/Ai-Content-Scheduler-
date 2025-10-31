import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Sell() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    condition: 'New',
    description: '',
    location: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual listing creation
    console.log('Creating listing:', formData)
    navigate('/listings')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-[#041E42] mb-8">Post an Item</h1>
        
        <div className="bg-white rounded-xl shadow-apple p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#041E42] mb-2">
                Listing Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent text-[#041E42]"
                placeholder="e.g., Calculus Textbook 2023"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-[#041E42] mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent text-[#041E42]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[#041E42] mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent text-[#041E42]"
                >
                  <option value="">Select a category</option>
                  <option value="Textbooks">📚 Textbooks</option>
                  <option value="Dorm Furniture">🛏️ Dorm Furniture</option>
                  <option value="Electronics">💻 Electronics</option>
                  <option value="Akron Gear">🦘 Akron Gear</option>
                  <option value="Services">🔧 Services</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-[#041E42] mb-2">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent text-[#041E42]"
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-[#041E42] mb-2">
                Pickup Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent text-[#041E42]"
                placeholder="e.g., Student Union"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#041E42] mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent text-[#041E42]"
                placeholder="Describe your item..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-[#041E42] hover:bg-opacity-90 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
              >
                Post Listing
              </button>
              <button
                type="button"
                onClick={() => navigate('/listings')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#041E42] font-semibold py-4 px-6 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Sell
