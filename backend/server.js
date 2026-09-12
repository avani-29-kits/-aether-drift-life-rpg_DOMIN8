require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const characterRoutes = require('./routes/character.routes');
const questRoutes = require('./routes/quest.routes');
const shopRoutes = require('./routes/shop.routes');
const achievementRoutes = require('./routes/achievement.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/achievements', achievementRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Aether Drift API listening on http://localhost:${PORT}`);
});
