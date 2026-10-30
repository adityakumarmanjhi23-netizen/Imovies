import axios from 'axios';
export const API = import.meta.env.VITE_API || 'http://localhost:5000';
const api = axios.create({ baseURL: API + '/api' });
api.interceptors.request.use(c => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = 'Bearer ' + t; return c; });
export const errMsg = e => e.response?.data?.error || 'Something went wrong. Try again.';
export default api;
