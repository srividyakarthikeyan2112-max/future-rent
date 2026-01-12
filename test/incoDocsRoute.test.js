const request = require('supertest');
const app = require('../backend/server');

describe('INCO Docs route', function() {
  it('returns results from the fallback index for a simple query', async function() {
    const res = await request(app).get('/api/inco-docs/search').query({ q: 'compute' }).expect(200);
    if (!res.body || !Array.isArray(res.body.results)) throw new Error('invalid response shape');
    // Expect at least one item that mentions 'compute' in title/snippet
    const hasCompute = res.body.results.some(r => (r.title + ' ' + r.snippet).toLowerCase().includes('compute'));
    if (!hasCompute) throw new Error('no compute-related results returned');
  });
});
