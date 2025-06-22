const express = require('express');
const passport = require('passport');
const { getOrCreateUser } = require('../userService');
const router = express.Router();

const useLocal = process.env.USE_LOCAL_LOGIN === 'true';

if (useLocal) {
  router.get('/login', (req, res) => {
    res.send(
      `<form method="post" action="/auth/login">` +
      `<input type="email" name="email" required />` +
      `<button type="submit">Login</button>` +
      `</form>`
    );
  });

  router.post('/login', async (req, res, next) => {
    try {
      const email = req.body.email;
      if (!email) return res.status(400).send('email required');
      const user = await getOrCreateUser(email, req.app.get('db'));
      req.login(user, (err) => {
        if (err) return next(err);
        res.redirect('/');
      });
    } catch (err) {
      next(err);
    }
  });
} else {
  router.get('/login', passport.authenticate('azuread-openidconnect'));

  router.post(
    '/openid/return',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    }
  );
}

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
