function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Search textbooks, dorm essentials, etc..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full px-6 py-4 border-2 border-[#041E42] rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent text-[#041E42] placeholder-gray-400"
      />
    </div>
  )
}

export default SearchBar
