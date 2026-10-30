import React from 'react'; import { createRoot } from 'react-dom/client'; import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; import 'react-toastify/dist/ReactToastify.css'; import './style.css';
import App from './App.jsx'; import { AuthProvider } from './context.jsx';
createRoot(document.getElementById('root')).render(<BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>);
