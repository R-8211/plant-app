const express = require('express');
const router = express.Router();
const db = require('../db');

// 植物一覧取得
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM plants WHERE user_id = $1 ORDER BY name',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 植物1件取得
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM plants WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 植物登録

router.post('/', async (req, res) => {
  const { name, species, photo_url, watering_interval_days } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO plants (user_id, name, species, photo_url, watering_interval_days)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, name, species, photo_url, watering_interval_days]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 植物更新
router.put('/:id', async (req, res) => {
  const { name, species, photo_url, watering_interval_days } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE plants SET name=$1, species=$2, photo_url=$3, watering_interval_days=$4
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [name, species, photo_url, watering_interval_days, req.params.id, req.userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 植物削除
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM plants WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
