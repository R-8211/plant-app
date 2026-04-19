const express = require('express');
const router = express.Router();
const db = require('../db');

// 水やり記録一覧（植物別）
router.get('/:plantId', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT w.* FROM waterings w
       JOIN plants p ON p.id = w.plant_id
       WHERE w.plant_id = $1 AND p.user_id = $2
       ORDER BY w.watered_at DESC`,
      [req.params.plantId, req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 水やり記録追加
router.post('/:plantId', async (req, res) => {
  const { watered_at, health_status, memo, photo_url } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO waterings (plant_id, watered_at, health_status, memo, photo_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.plantId, watered_at || new Date(), health_status, memo, photo_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 水やり記録削除
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query(
      `DELETE FROM waterings w USING plants p
       WHERE w.id = $1 AND w.plant_id = p.id AND p.user_id = $2`,
      [req.params.id, req.userId]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
