const request = require('supertest');
const express = require('express');
const reportRouter = require('../../src/routes/report');

function setup(db) {
  const app = express();
  app.use(express.json());
  app.set('db', db);
  app.use((req,res,next)=>{req.isAuthenticated=()=>true; req.user={id:1,role:'user'}; next();});
  app.use('/report', reportRouter);
  return app;
}

test('rejects report submission without clock-in', async () => {
  const db={query: jest.fn().mockResolvedValue({rows:[]})};
  const app = setup(db);
  const res = await request(app).post('/report/').send({markdown:'test'});
  expect(res.status).toBe(400);
});
