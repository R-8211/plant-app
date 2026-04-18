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
    await db.query('DELETE FROM waterings WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
