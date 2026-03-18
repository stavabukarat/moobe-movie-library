import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';
import libraryRoutes from './routes/library.js';
import browseRoutes from './routes/browse.js';

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://moobe-movie-library.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Render health-checks)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Moobe API is running' });
});

app.use('/auth', authRoutes);
app.use('/search', searchRoutes);
app.use('/library', libraryRoutes);
app.use('/', browseRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
