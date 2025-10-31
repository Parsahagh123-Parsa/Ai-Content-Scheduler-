import { useParams } from 'react-router-dom'
import { useState } from 'react'

function ChatRoom() {
  const { id } = useParams()
  const [message, setMessage] = useState('')
  
  // TODO: Load actual messages
  const messages = [
    { id: '1', sender: 'other', text: 'Is the calculator still available?', time: '2:30 PM' },
    { id: '2', sender: 'me', text: 'Yes, it is!', time: '2:32 PM' },
    { id: '3', sender: 'other', text: 'Great! Can we meet at the Student Union?', time: '2:35 PM' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Send message
    console.log('Sending message:', message)
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#041E42]">Chat with User</h1>
      </div>
      
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                  msg.sender === 'me'
                    ? 'bg-[#041E42] text-white'
                    : 'bg-white text-[#041E42] shadow-apple'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-gray-300' : 'text-gray-500'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent text-[#041E42]"
          />
          <button
            type="submit"
            className="bg-[#041E42] hover:bg-opacity-90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatRoom
