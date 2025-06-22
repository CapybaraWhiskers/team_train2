const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware');

// Get monthly hours for all users
router.get('/hours', ensureAuthenticated, ensureAdmin, async (req, res) => {
  const db = req.app.get('db');
  const start = new Date();
  start.setDate(1);
  start.setHours(0,0,0,0);
  const result = await db.query(
    `SELECT u.id, u.email,
            COALESCE(SUM(EXTRACT(EPOCH FROM (a.clock_out - a.clock_in))/3600),0) AS hours
       FROM users u
       LEFT JOIN attendance a ON a.user_id = u.id AND a.clock_in >= $1 AND a.clock_out IS NOT NULL
      GROUP BY u.id, u.email
      ORDER BY u.email`,
    [start]
  );
  res.json(result.rows);
});

// Export monthly hours as CSV
router.get('/export-hours', ensureAuthenticated, ensureAdmin, async (req, res) => {
  const db = req.app.get('db');
  const start = new Date();
  start.setDate(1);
  start.setHours(0,0,0,0);
  const result = await db.query(
    `SELECT u.email,
            COALESCE(SUM(EXTRACT(EPOCH FROM (a.clock_out - a.clock_in))/3600),0) AS hours
       FROM users u
       LEFT JOIN attendance a ON a.user_id = u.id AND a.clock_in >= $1 AND a.clock_out IS NOT NULL
      GROUP BY u.email
      ORDER BY u.email`,
    [start]
  );
  const lines = ['email,hours'];
  result.rows.forEach(r => {
    lines.push(`${r.email},${r.hours}`);
  });
  res.header('Content-Type', 'text/csv');
  res.send(lines.join('\n'));
});

module.exports = router;
