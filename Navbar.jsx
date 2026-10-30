import { Link, useNavigate } from 'react-router-dom'; import { FaHome, FaHeart, FaTicketAlt, FaSignOutAlt, FaFilm, FaPlus, FaTheaterMasks, FaCalendarPlus } from 'react-icons/fa';
import api from '../api'; import { useAuth } from '../context';
const I = ({ to, label, icon: Ic }) => <Link to={to} className="nav-ic" aria-label={label} title={label}><Ic /></Link>;
export default function Navbar() {
  const { user, logout } = useAuth(); const nav = useNavigate();
  const out = () => { api.post('/auth/logout').finally(() => { logout(); nav('/'); }); };
  return <nav className="navbar-im d-flex align-items-center px-3 py-2">
    <Link className="brand" to="/"><b>i</b>Movies</Link>
    <div className="ms-auto d-flex align-items-center gap-2">
      {user?.role === 'user' && <><I to="/movies" label="Movies" icon={FaFilm} /><I to="/favorites" label="Favourites" icon={FaHeart} /><I to="/bookings" label="Your bookings" icon={FaTicketAlt} /></>}
      {user?.role === 'admin' && <><I to="/admin" label="Dashboard" icon={FaHome} /><I to="/admin/add-movie" label="Add movie" icon={FaPlus} /><I to="/admin/add-theatre" label="Add theatre" icon={FaTheaterMasks} /><I to="/admin/add-show" label="Add show" icon={FaCalendarPlus} /></>}
      {user ? <button className="nav-ic btn p-1" aria-label="Log out" title="Log out" onClick={out}><FaSignOutAlt /></button> : <><Link className="btn btn-red btn-sm" to="/login">Sign in</Link><Link className="btn btn-line btn-sm" to="/register">Sign up</Link></>}
    </div></nav>;
}
