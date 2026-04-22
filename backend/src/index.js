require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const plantsRouter = require('./routes/plants');
const wateringsRouter = require('./routes/waterings');
const remindersRouter = require('./routes/reminders');
const pushRouter = require('./routes/push');
require('./cron');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.get('/api/push/vapid-public-key', (_, res) => res.json({ key: process.env.VAPID_PUBLIC_KEY }));

app.use('/api/plants', auth, plantsRouter);
app.use('/api/waterings', auth, wateringsRouter);
app.use('/api/reminders', auth, remindersRouter);
app.use('/api/push', auth, pushRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
