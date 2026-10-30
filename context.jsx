import { createContext, useContext, useState } from 'react'; import { Navigate } from 'react-router-dom';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const login = d => { localStorage.setItem('token', d.token); localStorage.setItem('user', JSON.stringify(d.user)); setUser(d.user); };
  const logout = () => { localStorage.clear(); setUser(null); };
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}
// Role-based route protection: role="user" | "admin"
export function Protected({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === role ? children : <Navigate to={user.role === 'admin' ? '/admin' : '/movies'} replace />;
}
