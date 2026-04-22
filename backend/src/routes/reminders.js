const express = require('express');
const router = express.Router();
const db = require('../db');

// 水やりが必要な植物一覧
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT p.id, p.name, p.watering_interval_days,
              MAX(w.watered_at) AS last_watered_at
       FROM plants p
       LEFT JOIN waterings w ON w.plant_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       HAVING MAX(w.watered_at) IS NULL
           OR MAX(w.watered_at) + (p.watering_interval_days || ' days')::interval < NOW()`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
