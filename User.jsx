import { useEffect, useState } from 'react'; import { Link, useNavigate, useParams } from 'react-router-dom'; import { io } from 'socket.io-client'; import { toast } from 'react-toastify'; import { FaHeart } from 'react-icons/fa';
import api, { API, errMsg } from '../api';
const fail = e => toast.error(errMsg(e));
const when = s => s && new Date(`${s.date}T${s.time}`);
function Card({ m, favs, toggle }) {
  return <div className="col-6 col-md-3 col-lg-2"><div className="poster" style={{ backgroundImage: m.poster ? `url(${m.poster})` : undefined }}>
    {toggle && <button className={'fav' + (favs?.has(m._id) ? ' on' : '')} aria-label="Toggle favourite" onClick={() => toggle(m._id)}><FaHeart /></button>}</div>
    <Link to={'/movies/' + m._id} className="text-reset text-decoration-none"><div className="mt-2 fw-semibold small">{m.name}</div></Link>
    <div className="small text-secondary">{m.releaseDate?.slice(0, 10)} · ★ {m.ratingAvg || '–'}</div>{m.genres?.map(g => <span key={g} className="tag">{g}</span>)}</div>;
}
export function Movies() {
  const [f, setF] = useState({ q: '', genre: '', language: '', minRating: '', page: 1 }); const [d, setD] = useState({ items: [], pages: 1 }); const [favs, setFavs] = useState(new Set());
  useEffect(() => { api.get('/movies', { params: f }).then(r => setD(r.data)).catch(fail); }, [f]);
  useEffect(() => { api.get('/favorites').then(r => setFavs(new Set(r.data.map(x => x._id)))); }, []);
  const toggle = id => api.post('/favorites/' + id).then(r => setFavs(s => { const n = new Set(s); r.data.favorite ? n.add(id) : n.delete(id); return n; })).catch(fail);
  const set = k => e => setF({ ...f, [k]: e.target.value, page: 1 });
  return <><div className="banner">Available Movies</div><div className="row g-2 mb-4">
    <div className="col-md-5"><input className="form-control" aria-label="Search by name" placeholder="Search by name" onChange={set('q')} /></div>
    <div className="col-md-2"><select className="form-select" aria-label="Genre" onChange={set('genre')}><option value="">All genres</option>{['Action', 'Comedy', 'Drama', 'Thriller', 'Romance', 'Sci-Fi'].map(g => <option key={g}>{g}</option>)}</select></div>
    <div className="col-md-2"><select className="form-select" aria-label="Language" onChange={set('language')}><option value="">All languages</option>{['English', 'Hindi', 'Telugu', 'Tamil'].map(g => <option key={g}>{g}</option>)}</select></div>
    <div className="col-md-3"><select className="form-select" aria-label="Minimum rating" onChange={set('minRating')}><option value="">Any rating</option>{[4, 3, 2].map(n => <option key={n} value={n}>{n}★ and up</option>)}</select></div></div>
    {!d.items.length && <p>No movies match these filters. Clear one to see more.</p>}
    <div className="row g-3">{d.items.map(m => <Card key={m._id} m={m} favs={favs} toggle={toggle} />)}</div>
    <div className="d-flex gap-2 mt-4"><button className="btn btn-line" disabled={f.page <= 1} onClick={() => setF({ ...f, page: f.page - 1 })}>Previous</button><button className="btn btn-line" disabled={f.page >= d.pages} onClick={() => setF({ ...f, page: f.page + 1 })}>Next</button></div></>;
}
export function MovieDetail() {
  const { id } = useParams(); const [m, setM] = useState(); const [shows, setShows] = useState([]); const [rv, setRv] = useState([]); const [r, setR] = useState({ rating: 5, comment: '' });
  const load = () => { api.get('/movies/' + id).then(x => setM(x.data)); api.get('/reviews/' + id).then(x => setRv(x.data)); };
  useEffect(() => { load(); api.get('/shows', { params: { movie: id } }).then(x => setShows(x.data)); }, [id]);
  const post = () => api.post('/reviews/' + id, r).then(() => { toast.success('Review saved'); load(); }).catch(fail);
  if (!m) return null;
  return <><h2>{m.name}</h2><p className="text-secondary">{m.genres?.join(', ')} · {m.language} · {m.runtime} min · {m.certification} · ★ {m.ratingAvg || '–'} ({m.ratingCount})</p><p>{m.description}</p>
    {m.trailer && <a className="btn btn-line mb-3" href={m.trailer} target="_blank" rel="noreferrer">Watch trailer</a>}
    <h5 className="mt-3">Showtimes</h5>{!shows.length && <p>No upcoming shows yet.</p>}
    {shows.map(s => <Link key={s._id} to={'/shows/' + s._id} className="btn btn-red me-2 mb-2">{s.theatre?.name}, {s.date} {s.time}</Link>)}
    <h5 className="mt-4">Reviews</h5><div className="panel d-grid gap-2 mb-3" style={{ maxWidth: 480 }}>
      <select className="form-select" aria-label="Rating" value={r.rating} onChange={e => setR({ ...r, rating: +e.target.value })}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} stars</option>)}</select>
      <textarea className="form-control" aria-label="Your review" placeholder="Write a review" onChange={e => setR({ ...r, comment: e.target.value })} /><button className="btn btn-red" onClick={post}>Post review</button></div>
    {!rv.length && <p>No reviews yet. Be the first.</p>}{rv.map(x => <div key={x._id} className="mb-2"><b>{x.user?.username}</b> <span className="hl">{'★'.repeat(x.rating)}</span><div>{x.comment}</div></div>)}</>;
}
export function Seats() {
  const { id } = useParams(); const nav = useNavigate(); const [s, setS] = useState(); const [sel, setSel] = useState([]);
  useEffect(() => {
    api.get('/shows/' + id).then(r => setS(r.data)).catch(fail); const sk = io(API); sk.emit('join', id);
    sk.on('seats', p => setS(x => x && { ...x, bookedSeats: p.booked ? [...x.bookedSeats, ...p.seats] : x.bookedSeats.filter(l => !p.seats.includes(l)) })); return () => sk.disconnect();
  }, [id]);
  if (!s) return null;
  const price = Object.fromEntries(s.seats.map(x => [x.label, x.price])), total = sel.reduce((a, l) => a + price[l], 0);
  const pick = l => !s.bookedSeats.includes(l) && setSel(v => v.includes(l) ? v.filter(x => x !== l) : [...v, l]);
  const book = () => api.post('/bookings', { show: id, seats: sel }).then(() => { toast.success('Booking confirmed'); nav('/bookings'); }).catch(e => { fail(e); setSel([]); });
  const rows = [['B', 'Balcony'], ['M', 'Middle'], ['L', 'Lower']];
  return <><h3>{s.movie.name}</h3><p className="text-secondary">{s.theatre.name}, {s.theatre.location} · {s.date} {s.time}</p><div className="screen" aria-hidden />
    {rows.map(([p, n]) => { const g = s.seats.filter(x => x.label[0] === p); return <div key={p} className="text-center mb-3"><small className="text-secondary">{n} · ₹{g[0]?.price}</small><div>{g.map(x => <button key={x.label} aria-label={'Seat ' + x.label} disabled={s.bookedSeats.includes(x.label)} className={'seat ' + (s.bookedSeats.includes(x.label) ? 'taken' : sel.includes(x.label) ? 'sel' : '')} onClick={() => pick(x.label)}>{x.label}</button>)}</div></div>; })}
    <div className="text-center mt-4"><button className="btn btn-red" disabled={!sel.length} onClick={book}>Pay ₹{total} and book {sel.length} seats</button></div></>;
}
function BookCard({ b, cancel }) {
  const s = b.show, live = b.status === 'confirmed' && when(s) - Date.now() > 36e5;
  return <div className="col-md-4"><div className="panel h-100"><b>{s?.movie?.name}</b><div className="small">{s?.theatre?.name}<br />{s?.date} {s?.time}<br />Seats: {b.seats.join(', ')}<br />Total: ₹{b.totalPrice} · {b.status}</div>
    {live && <button className="btn btn-line btn-sm mt-2" onClick={() => cancel(b._id)}>Cancel booking</button>}</div></div>;
}
export function Bookings() {
  const [b, setB] = useState([]); const load = () => api.get('/bookings/mine').then(r => setB(r.data)).catch(fail); useEffect(() => { load(); }, []);
  const cancel = id => api.post(`/bookings/${id}/cancel`).then(() => { toast.success('Booking cancelled'); load(); }).catch(fail);
  const up = b.filter(x => x.show && when(x.show) > new Date() && x.status === 'confirmed'), past = b.filter(x => !up.includes(x));
  return <><h4>Your <span className="hl">Bookings</span></h4><h6 className="mt-3">Upcoming</h6>{!up.length && <p>No upcoming shows. Browse movies to book one.</p>}<div className="row g-3">{up.map(x => <BookCard key={x._id} b={x} cancel={cancel} />)}</div>
    <h6 className="mt-4">Past and cancelled</h6><div className="row g-3">{past.map(x => <BookCard key={x._id} b={x} cancel={cancel} />)}</div></>;
}
export function Favorites() {
  const [m, setM] = useState([]); const load = () => api.get('/favorites').then(r => setM(r.data)); useEffect(() => { load(); }, []);
  const toggle = id => api.post('/favorites/' + id).then(load).catch(fail);
  return <><h4>Your <span className="hl">Favourites</span></h4>{!m.length && <p>Tap the heart on a movie to save it here.</p>}<div className="row g-3">{m.map(x => <Card key={x._id} m={x} favs={new Set(m.map(y => y._id))} toggle={toggle} />)}</div></>;
}
