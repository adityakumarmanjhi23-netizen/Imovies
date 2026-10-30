import { useState } from 'react'; import { Link, useNavigate } from 'react-router-dom'; import { toast } from 'react-toastify';
import api, { errMsg } from '../api'; import { useAuth } from '../context';
export const Landing = () => <section className="hero px-4 rounded"><h1>Welcome to <span className="hl">iMovies</span></h1><p className="text-secondary">Your ultimate destination for the latest blockbusters and timeless classics.</p>
  <div className="d-flex gap-2"><Link className="btn btn-red" to="/login">Sign in</Link><Link className="btn btn-line" to="/register">Sign up</Link></div></section>;
function Box({ title, children, onSubmit }) {
  return <form onSubmit={onSubmit} className="panel mx-auto d-grid gap-2" style={{ maxWidth: 380 }}><h4 className="text-center"><span className="hl">i</span>Movies</h4><h6 className="text-center">{title}</h6>{children}</form>;
}
const F = ({ label, set, f, k, type = 'text', show }) => <div><label htmlFor={k}>{label}</label><input id={k} className="form-control" type={type === 'password' && show ? 'text' : type} required value={f[k] || ''} onChange={e => set({ ...f, [k]: e.target.value })} /></div>;
function useAuthForm(path) {
  const { login } = useAuth(); const nav = useNavigate(); const [f, set] = useState({}); const [show, setShow] = useState(false);
  const submit = async e => { e.preventDefault(); try { const { data } = await api.post(path, f); login(data); nav(data.user.role === 'admin' ? '/admin' : '/movies'); } catch (er) { toast.error(errMsg(er)); } };
  return { f, set, show, setShow, submit };
}
const Show = ({ show, setShow }) => <label className="d-flex gap-2"><input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} /> Show password</label>;
export function Login() {
  const a = useAuthForm('/auth/login');
  return <Box title="Login" onSubmit={a.submit}><F label="Email" k="email" type="email" {...a} /><F label="Password" k="password" type="password" {...a} /><Show {...a} /><button className="btn btn-red">Log in</button>
    <small>New here? <Link className="hl" to="/register">Create an account</Link></small></Box>;
}
export function Register({ admin }) {
  const a = useAuthForm(admin ? '/auth/register-admin' : '/auth/register'); const bad = a.f.password && a.f.confirm && a.f.password !== a.f.confirm;
  return <Box title={admin ? 'Register as an admin' : 'Register'} onSubmit={e => bad ? (e.preventDefault(), toast.error('Passwords do not match.')) : a.submit(e)}>
    <F label="Username" k="username" {...a} /><F label="Email" k="email" type="email" {...a} /><F label="Password" k="password" type="password" {...a} /><F label="Confirm password" k="confirm" type="password" {...a} />
    {admin && <F label="Admin code" k="adminCode" type="password" {...a} />}<Show {...a} /><button className="btn btn-red">Create account</button>
    <small>Have an account? <Link className="hl" to="/login">Log in</Link></small>
    <small>{admin ? <Link className="hl" to="/register">Register as a user</Link> : <>Register as an <Link className="hl" to="/register/admin">admin</Link></>}</small></Box>;
}
