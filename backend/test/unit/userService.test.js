const { getOrCreateUser } = require('../../src/userService');

// Mock DB client with query function
function mockDb(returnRows = []) {
  return {
    queries: [],
    async query(sql, params) {
      this.queries.push({ sql, params });
      if (/INSERT/.test(sql)) {
        return { rows: [{ id: 1, email: params[0], role: params[1] }] };
      }
      return { rows: returnRows };
    }
  };
}

test('assigns admin role when email is in ADMIN_EMAILS', async () => {
  process.env.ADMIN_EMAILS = 'admin@example.com';
  const db = mockDb([]); // user does not exist
  const user = await getOrCreateUser('admin@example.com', db);
  expect(user.role).toBe('admin');
});

test('keeps existing user role if found', async () => {
  process.env.ADMIN_EMAILS = 'admin@example.com';
  const db = mockDb([{ id:2, email:'user@example.com', role:'user' }]);
  const user = await getOrCreateUser('user@example.com', db);
  expect(user.role).toBe('user');
});
