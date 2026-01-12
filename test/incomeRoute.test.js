const { expect } = require('chai');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

const incomeRoutes = require('../backend/routes/incomeRoutes');

describe('Income route tests', function () {
  let app;
  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/api/income', incomeRoutes);
    // error handler
    app.use((err, req, res, next) => {
      res.status(500).json({ error: err.message });
    });
  });

  it('returns 400 when required fields missing', async function () {
    const res = await request(app).post('/api/income/submit').send({});
    expect(res.status).to.equal(400);
  });
});
