// Finds existing user by email or creates a new one with role based on admin email list
async function getOrCreateUser(email, db) {
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
  if (result.rows.length === 0) {
    const role = adminEmails.includes(email) ? 'admin' : 'user';
    const insert = await db.query('INSERT INTO users(email, role) VALUES($1, $2) RETURNING *', [email, role]);
    return insert.rows[0];
  }
  return result.rows[0];
}

module.exports = { getOrCreateUser };
