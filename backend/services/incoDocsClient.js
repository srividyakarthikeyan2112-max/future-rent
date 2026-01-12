const axios = require('axios');
require('dotenv').config();

const INCO_DOCS_URL = process.env.INCO_DOCS_URL || '';
const INCO_DOCS_API_KEY = process.env.INCO_DOCS_API_KEY || '';

// Simple in-memory fallback docs index (title, snippet, url)
const FALLBACK_DOCS = [
  { title: 'INCO Overview', snippet: 'Confidential compute platform overview and concepts.', url: 'https://inco.example/docs/overview' },
  { title: 'INCO Compute API', snippet: 'API reference for /compute endpoint and expected payloads.', url: 'https://inco.example/docs/compute-api' },
  { title: 'INCO Proofs', snippet: 'How INCO generates proofs and how to verify them on-chain.', url: 'https://inco.example/docs/proofs' }
];

class IncoDocsClient {
  constructor({ baseUrl = INCO_DOCS_URL, apiKey = INCO_DOCS_API_KEY } = {}) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    if (this.baseUrl) {
      this.http = axios.create({ baseURL: this.baseUrl, timeout: 10_000 });
      if (this.apiKey) this.http.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
    }
  }

  async search(query) {
    if (!query || String(query).trim().length === 0) return [];

    // If a real docs server url is configured, call it (assumes /search?q=... GET)
    if (this.http) {
      try {
        const resp = await this.http.get('/search', { params: { q: query } });
        // Expect resp.data to be an array of { title, snippet, url }
        return resp.data;
      } catch (err) {
        // fallback to local index when remote fails
        console.warn('IncoDocs remote search failed, falling back to local index:', err.message || err);
      }
    }

    const q = String(query).toLowerCase();
    return FALLBACK_DOCS.filter(d => (d.title + ' ' + d.snippet).toLowerCase().includes(q));
  }
}

module.exports = IncoDocsClient;
