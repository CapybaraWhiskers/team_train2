const request = require('supertest');
const express = require('express');
const adminRouter = require('../../src/routes/admin');

function setup(db) {
  const app = express();
  app.use(express.json());
  app.set('db', db);
  app.use((req,res,next)=>{req.isAuthenticated=()=>true; req.user={id:1,role:'admin'}; next();});
  app.use('/admin', adminRouter);
  return app;
}

test('export-hours returns csv', async () => {
  const db={query: jest.fn().mockResolvedValue({rows:[{email:'a@test',hours:1}]})};
  const app = setup(db);
  const res = await request(app).get('/admin/export-hours');
  expect(res.header['content-type']).toMatch(/text\/csv/);
  expect(res.text).toContain('a@test');
});
