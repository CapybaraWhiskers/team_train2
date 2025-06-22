const express = require('express');
const MarkdownIt = require('markdown-it');
const router = express.Router();
const md = new MarkdownIt();
const { ensureAuthenticated } = require('../middleware');

router.post('/', ensureAuthenticated, async (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const today = new Date().toISOString().slice(0,10);
  const attendance = await db.query('SELECT * FROM attendance WHERE user_id=$1 AND clock_in::date=$2 ORDER BY clock_in DESC LIMIT 1', [userId, today]);
  if (attendance.rows.length === 0) {
    return res.status(400).json({ error: 'must clock in before submitting report' });
  }
  const markdown = req.body.markdown || '';
  await db.query('INSERT INTO reports(user_id, report_date, markdown) VALUES($1, $2, $3) ON CONFLICT (user_id, report_date) DO UPDATE SET markdown=EXCLUDED.markdown', [userId, today, markdown]);
  res.json({ status: 'submitted' });
});

// List all reports for the authenticated user
router.get('/', ensureAuthenticated, async (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const result = await db.query('SELECT report_date, markdown FROM reports WHERE user_id=$1 ORDER BY report_date DESC', [userId]);
  const list = result.rows.map(r => ({
    date: r.report_date,
    html: md.render(r.markdown)
  }));
  res.json(list);
});

router.get('/:date', ensureAuthenticated, async (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const { date } = req.params;
  const result = await db.query('SELECT markdown FROM reports WHERE user_id=$1 AND report_date=$2', [userId, date]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'not found' });
  const html = md.render(result.rows[0].markdown);
  res.send(html);
});

module.exports = router;
