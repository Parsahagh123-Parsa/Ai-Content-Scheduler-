import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Verify from './pages/Verify'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import Sell from './pages/Sell'
import Chat from './pages/Chat'
import ChatRoom from './pages/ChatRoom'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:id" element={<ChatRoom />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App