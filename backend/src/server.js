const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const { OIDCStrategy } = require('passport-azure-ad');
const { Pool } = require('pg');

const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const reportRoutes = require('./routes/report');
const adminRoutes = require('./routes/admin');
const { getOrCreateUser } = require('./userService');

// Switch to local login when USE_LOCAL_LOGIN=true or when Azure AD
// credentials are not properly configured. This allows easier local testing
// without Microsoft Entra ID.
const azureConfigured =
  process.env.AZURE_CLIENT_ID &&
  process.env.AZURE_CLIENT_SECRET &&
  process.env.AZURE_TENANT_ID &&
  process.env.AZURE_CLIENT_ID !== 'change_me';
const useLocal = process.env.USE_LOCAL_LOGIN === 'true' || !azureConfigured;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/attendance'
});

app.set('db', pool);

if (!useLocal) {
  // Passport setup for Microsoft Entra ID (Azure AD)
  const oidcConfig = {
    identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.AZURE_CLIENT_ID,
    responseType: 'code',
    responseMode: 'query',
    redirectUrl: process.env.AZURE_REDIRECT_URL || 'http://localhost:3000/auth/openid/return',
    allowHttpForRedirectUrl: true,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    validateIssuer: false,
    passReqToCallback: false,
    scope: ['profile', 'email']
  };

  passport.use(new OIDCStrategy(oidcConfig, async (iss, sub, profile, accessToken, refreshToken, done) => {
    try {
      const email = profile._json.preferred_username;
      const db = pool;
      const user = await getOrCreateUser(email, db);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

app.use(require('express-session')({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/report', reportRoutes);
app.use('/admin', adminRoutes);

// Return basic user information to the frontend
app.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
  } else {
    res.status(401).json({ error: 'unauthenticated' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
