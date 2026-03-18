import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';
import libraryRoutes from './routes/library.js';
import browseRoutes from './routes/browse.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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
