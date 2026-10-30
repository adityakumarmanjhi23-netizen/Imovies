require('dotenv').config(); const m = require('mongoose'), bcrypt = require('bcryptjs');
const Admin = require('./models/adminModel'), Movie = require('./models/movieModel'), Theatre = require('./models/theatreModel'), Show = require('./models/showModel');
(async () => {
  await m.connect(process.env.MONGO_URI); await Promise.all([Admin, Movie, Theatre, Show].map(x => x.deleteMany({})));
  await Admin.create({ username: 'Admin', email: 'admin@imovies.com', password: await bcrypt.hash('admin123', 10) });
  const mv = await Movie.insertMany([{ name: 'Midnight Express', genres: ['Thriller'], language: 'English', runtime: 120, certification: 'UA', releaseDate: new Date(), description: 'A night train, a missing passenger.' }, { name: 'Chai & Chaos', genres: ['Comedy'], language: 'Hindi', runtime: 135, certification: 'U', releaseDate: new Date(), description: 'A tea stall turns into a town hall.' }]);
  const t = await Theatre.create({ name: 'Galaxy Screen 1', location: 'Bhopal', sections: { balcony: { price: 350, count: 20 }, middle: { price: 250, count: 30 }, lower: { price: 150, count: 30 } } });
  const d = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  for (const x of mv) await Show.create({ movie: x._id, theatre: t._id, date: d, time: '18:30' });
  console.log('Seeded. Admin: admin@imovies.com / admin123'); process.exit();
})();
