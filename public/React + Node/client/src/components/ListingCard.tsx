import { Link } from 'react-router-dom'

interface ListingCardProps {
  id: string
  title: string
  price: number
  category: string
  description: string
  condition?: string
}

function ListingCard({ id, title, price, category, description, condition }: ListingCardProps) {
  const categoryIcons: Record<string, string> = {
    'Textbooks': '📚',
    'Electronics': '💻',
    'Dorm Furniture': '🛏️',
    'Akron Gear': '🦘',
    'Services': '🔧'
  }
  
  const icon = categoryIcons[category] || '📦'
  
  return (
    <Link to={`/listing/${id}`} className="block">
      <div className="bg-white rounded-xl shadow-apple hover:shadow-apple-hover transition-all duration-200 overflow-hidden cursor-pointer transform hover:scale-[1.02]">
        <div className="h-48 bg-gradient-to-br from-[#041E42] to-blue-800 flex items-center justify-center">
          <span className="text-7xl">{icon}</span>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg mb-2 text-[#041E42] line-clamp-1">{title}</h3>
          <p className="text-[#041E42] font-bold text-2xl mb-3">${price.toFixed(2)}</p>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500">{category}</span>
            <span className="text-xs text-gray-400">{condition || 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ListingCard
