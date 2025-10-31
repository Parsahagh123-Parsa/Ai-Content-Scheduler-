import { Link } from 'react-router-dom'

function Chat() {
  // TODO: Load actual messages
  const conversations = [
    { id: '1', name: 'John Doe', lastMessage: 'Is the calculator still available?', time: '2h ago', unread: 2 },
    { id: '2', name: 'Jane Smith', lastMessage: 'Thanks for the textbook!', time: '1d ago', unread: 0 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-[#041E42] mb-8">Messages</h1>
        
        <div className="bg-white rounded-xl shadow-apple overflow-hidden">
          {conversations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map(conversation => (
                <Link key={conversation.id} to={`/chat/${conversation.id}`} className="block p-6 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#041E42] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{conversation.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#041E42]">{conversation.name}</h3>
                        <p className="text-sm text-gray-600">{conversation.lastMessage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{conversation.time}</p>
                      {conversation.unread > 0 && (
                        <span className="inline-block mt-2 bg-[#FFC72C] text-[#041E42] text-xs font-semibold px-2 py-1 rounded-full">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
