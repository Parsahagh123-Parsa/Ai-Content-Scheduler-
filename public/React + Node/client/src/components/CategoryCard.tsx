import { Link } from 'react-router-dom'

interface CategoryCardProps {
  name: string
  icon: string
  count: number
}

function CategoryCard({ name, icon, count }: CategoryCardProps) {
  return (
    <Link 
      to={`/listings?category=${name}`}
      className="bg-white rounded-xl shadow-apple hover:shadow-apple-hover transition-all duration-200 p-6 text-center cursor-pointer transform hover:scale-105"
    >
      <div className="text-5xl mb-3">{icon}</div>
      <h4 className="font-semibold text-lg mb-1 text-[#041E42]">{name}</h4>
      <p className="text-sm text-gray-500">{count}+ items</p>
    </Link>
  )
}

export default CategoryCard
