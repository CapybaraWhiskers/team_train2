const express = require('express');
const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.status(401).json({ error: 'unauthenticated' });
}

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

module.exports = router;
