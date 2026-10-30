import { Routes, Route, Navigate } from 'react-router-dom'; import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar'; import { Protected, useAuth } from './context';
import { Landing, Login, Register } from './pages/Auth'; import { Movies, MovieDetail, Seats, Bookings, Favorites } from './pages/User';
import { Dashboard, AddMovie, AddShow, AddTheatre } from './pages/Admin';
export default function App() {
  const { user } = useAuth();
  return <><Navbar /><main className="container py-4"><Routes>
    <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/movies'} /> : <Landing />} />
    <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/register/admin" element={<Register admin />} />
    <Route path="/movies" element={<Protected role="user"><Movies /></Protected>} /><Route path="/movies/:id" element={<Protected role="user"><MovieDetail /></Protected>} />
    <Route path="/shows/:id" element={<Protected role="user"><Seats /></Protected>} /><Route path="/bookings" element={<Protected role="user"><Bookings /></Protected>} /><Route path="/favorites" element={<Protected role="user"><Favorites /></Protected>} />
    <Route path="/admin" element={<Protected role="admin"><Dashboard /></Protected>} /><Route path="/admin/add-movie" element={<Protected role="admin"><AddMovie /></Protected>} />
    <Route path="/admin/add-show" element={<Protected role="admin"><AddShow /></Protected>} /><Route path="/admin/add-theatre" element={<Protected role="admin"><AddTheatre /></Protected>} />
  </Routes></main><ToastContainer theme="dark" /></>;
}
