import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Info from './pages/Info'
import Catalogue from './pages/Catalogue'
import BookDetail from './pages/BookDetail'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/info" element={<Info />} />
      <Route path="/catalogue" element={<Catalogue />} />
      <Route path="/book/:id" element={<BookDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
