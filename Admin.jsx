import { useEffect, useState } from 'react'; import { toast } from 'react-toastify'; import api, { errMsg } from '../api';
const fail = e => toast.error(errMsg(e));
export function Dashboard() {
  const [shows, setShows] = useState([]); const [bk, setBk] = useState([]); const [rev, setRev] = useState({ total: 0, byMovie: [] }); const [users, setUsers] = useState([]);
  const load = () => { api.get('/shows', { params: { all: 1 } }).then(r => setShows(r.data)); api.get('/bookings').then(r => setBk(r.data)); api.get('/admin/revenue').then(r => setRev(r.data)); api.get('/admin/users').then(r => setUsers(r.data)); }; useEffect(load, []);
  const del = id => api.delete('/shows/' + id).then(() => { toast.success('Show removed'); load(); }).catch(fail);
  const delUser = id => api.delete('/admin/users/' + id).then(() => { toast.success('User removed'); load(); }).catch(fail);
  return <><h4>Admin <span className="hl">Shows</span></h4>{!shows.length && <p>No shows yet. Add a theatre, then add a show.</p>}
    <div className="row g-3">{shows.map(s => <div key={s._id} className="col-md-3"><div className="panel small"><b>{s.movie?.name}</b><br />{s.theatre?.name}<br />{s.date} {s.time}<br /><button className="btn btn-line btn-sm mt-2" onClick={() => del(s._id)}>Delete show</button></div></div>)}</div>
    <h4 className="mt-5">Revenue: <span className="hl">₹{rev.total}</span></h4>{rev.byMovie.map(r => <div key={r._id} className="small">{r._id}: ₹{r.revenue} from {r.tickets} tickets</div>)}
    <h4 className="mt-5">All <span className="hl">Bookings</span></h4>{!bk.length && <p>No bookings yet.</p>}
    <div className="row g-2">{bk.map(b => <div key={b._id} className="col-md-6"><div className="panel small py-2">{b.user?.email} · {b.show?.movie?.name} · {b.show?.date} {b.show?.time} · {b.seats.join(', ')} · ₹{b.totalPrice} · {b.status}</div></div>)}</div>
    <h4 className="mt-5">Users</h4>{users.map(u => <div key={u._id} className="small mb-1">{u.username} ({u.email}) <button className="btn btn-line btn-sm ms-2" onClick={() => delUser(u._id)}>Remove user</button></div>)}</>;
}
function Form({ title, hl, children, onSubmit }) { return <form onSubmit={onSubmit} className="panel mx-auto d-grid gap-2" style={{ maxWidth: 520 }}><h5 className="text-center">{title} <span className="hl">{hl}</span></h5>{children}<button className="btn btn-red">{title} {hl}</button></form>; }
const Fld = ({ label, k, f, set, type = 'text', req = true }) => <div><label htmlFor={k}>{label}</label><input id={k} className="form-control" type={type} required={req} value={f[k] ?? ''} onChange={e => set({ ...f, [k]: e.target.value })} /></div>;
const send = (path, body, reset, msg) => e => { e.preventDefault(); api.post(path, body).then(() => { toast.success(msg); reset({}); }).catch(fail); };
export function AddMovie() {
  const [f, set] = useState({}); const p = { f, set };
  return <Form title="Add" hl="Movie" onSubmit={send('/movies', f, set, 'Movie added')}><Fld label="Movie name" k="name" {...p} /><Fld label="Description" k="description" {...p} /><Fld label="Genres (comma separated)" k="genres" {...p} /><Fld label="Language" k="language" {...p} />
    <Fld label="Release date" k="releaseDate" type="date" {...p} /><Fld label="Runtime (minutes)" k="runtime" type="number" {...p} /><Fld label="Certification" k="certification" {...p} /><Fld label="Poster image URL" k="poster" {...p} req={false} /><Fld label="Trailer URL (YouTube)" k="trailer" {...p} req={false} /></Form>;
}
export function AddTheatre() {
  const [f, set] = useState({}); const p = { f, set };
  const body = { name: f.name, location: f.location, sections: Object.fromEntries(['balcony', 'middle', 'lower'].map(k => [k, { price: +f[k + 'Price'], count: +f[k + 'Count'] }])) };
  return <Form title="Add" hl="Theatre" onSubmit={send('/theatres', body, set, 'Theatre added')}><Fld label="Theatre name" k="name" {...p} /><Fld label="Theatre location" k="location" {...p} />
    <div className="row g-2">{['balcony', 'middle', 'lower'].map(k => <div key={k} className="col-md-6"><Fld label={`${k[0].toUpperCase() + k.slice(1)} seat price`} k={k + 'Price'} type="number" {...p} /></div>).concat(['balcony', 'middle', 'lower'].map(k => <div key={k + 'c'} className="col-md-6"><Fld label={`${k[0].toUpperCase() + k.slice(1)} seat count`} k={k + 'Count'} type="number" {...p} /></div>))}</div></Form>;
}
export function AddShow() {
  const [f, set] = useState({}); const [t, setT] = useState([]); const [m, setM] = useState([]);
  useEffect(() => { api.get('/theatres').then(r => setT(r.data)); api.get('/movies', { params: { limit: 100 } }).then(r => setM(r.data.items)); }, []);
  const sel = (label, k, list, name) => <div><label htmlFor={k}>{label}</label><select id={k} required className="form-select" value={f[k] || ''} onChange={e => set({ ...f, [k]: e.target.value })}><option value="">Select {label.toLowerCase()}</option>{list.map(x => <option key={x._id} value={x._id}>{x[name]}</option>)}</select></div>;
  return <Form title="Add" hl="Show" onSubmit={send('/shows', f, set, 'Show added')}>{sel('Theatre', 'theatre', t, 'name')}{sel('Movie', 'movie', m, 'name')}<Fld label="Show date" k="date" type="date" f={f} set={set} /><Fld label="Show time" k="time" type="time" f={f} set={set} /></Form>;
}
