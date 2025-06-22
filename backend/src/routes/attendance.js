const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware');

router.post('/clock-in', ensureAuthenticated, async (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const now = new Date();
  await db.query('INSERT INTO attendance(user_id, clock_in) VALUES($1, $2)', [userId, now]);
  res.json({ status: 'clocked in', at: now });
});

router.post('/clock-out', ensureAuthenticated, async (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const now = new Date();
  await db.query('UPDATE attendance SET clock_out=$1 WHERE user_id=$2 AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1', [now, userId]);
  res.json({ status: 'clocked out', at: now });
});

// Summary of current month hours and utilization
router.get('/summary', ensureAuthenticated, async (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const start = new Date();
  start.setDate(1);
  start.setHours(0,0,0,0);
  const result = await db.query(
    `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (clock_out - clock_in))/3600),0) AS hours
     FROM attendance WHERE user_id=$1 AND clock_in >= $2 AND clock_out IS NOT NULL`,
    [userId, start]
  );
  const totalHours = parseFloat(result.rows[0].hours);
  const today = new Date();
  const utilization = (totalHours / (today.getDate() * 8)) * 100;
  res.json({ totalHours, utilization: Number(utilization.toFixed(2)) });
});

module.exports = router;
