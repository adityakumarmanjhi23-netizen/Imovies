require('dotenv').config(); require('express-async-errors');
const express = require('express'), http = require('http'), cors = require('cors'), mongoose = require('mongoose'), rate = require('express-rate-limit');
const app = express(), server = http.createServer(app);
const io = new (require('socket.io').Server)(server, { cors: { origin: process.env.CLIENT_URL } });
io.on('connection', s => s.on('join', id => s.join(String(id)))); app.set('io', io);
app.use(cors({ origin: process.env.CLIENT_URL })); app.use(express.json());
app.use('/api', rate({ windowMs: 15 * 60 * 1000, limit: 400 }));
app.use('/api/auth', rate({ windowMs: 15 * 60 * 1000, limit: 30 }), require('./routes/authRoutes'));
for (const n of ['admin', 'booking', 'favorite', 'movie', 'review', 'show', 'theatre']) app.use(`/api/${n === 'admin' ? 'admin' : n + 's'}`, require(`./routes/${n}Routes`));
app.use((e, req, res, next) => {
  if (e.code === 11000) return res.status(409).json({ error: 'That already exists.' });
  if (e.name === 'ValidationError' || e.name === 'CastError') return res.status(400).json({ error: e.message });
  console.error(e); res.status(500).json({ error: 'Something went wrong on our side.' });
});
mongoose.connect(process.env.MONGO_URI).then(() => server.listen(process.env.PORT || 5000, () => console.log('API ready')));
