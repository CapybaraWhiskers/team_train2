// Common authentication helpers
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.status(401).json({ error: 'unauthenticated' });
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'forbidden' });
}

module.exports = { ensureAuthenticated, ensureAdmin };
