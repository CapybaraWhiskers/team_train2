const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/login', passport.authenticate('azuread-openidconnect'));

router.post('/openid/return', passport.authenticate('azuread-openidconnect', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
