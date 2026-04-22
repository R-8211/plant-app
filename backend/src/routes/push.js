const express = require('express');
const router = express.Router();
const db = require('../db');

// VAPIDパブリックキーを返す
router.get('/vapid-public-key', (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

// Push購読を保存
router.post('/subscribe', async (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ error: 'subscription required' });
  try {
    await db.query(
      `INSERT INTO push_subscriptions (user_id, subscription)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET subscription = $2`,
      [req.userId, JSON.stringify(subscription)]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Push購読を削除
router.delete('/subscribe', async (req, res) => {
  try {
    await db.query('DELETE FROM push_subscriptions WHERE user_id = $1', [req.userId]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
