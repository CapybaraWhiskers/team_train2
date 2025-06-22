const request = require('supertest');
const express = require('express');
const attendanceRouter = require('../../src/routes/attendance');

function setup(db) {
  const app = express();
  app.use(express.json());
  app.set('db', db);
  // mock auth
  app.use((req,res,next)=>{req.isAuthenticated=()=>true; req.user={id:1,role:'user'}; next();});
  app.use('/attendance', attendanceRouter);
  return app;
}

test('clock-in inserts attendance record', async () => {
  const queries=[];
  const db={query: jest.fn().mockResolvedValue({rows:[]})};
  const app = setup(db);
  await request(app).post('/attendance/clock-in');
  expect(db.query).toHaveBeenCalled();
});

test('clock-out updates attendance record', async () => {
  const db={query: jest.fn().mockResolvedValue({rows:[]})};
  const app = setup(db);
  await request(app).post('/attendance/clock-out');
  expect(db.query).toHaveBeenCalled();
});
