
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class INCOError extends Error {
  constructor(message) {
    super(message);
    this.name = 'INCOError';
  }
}

class INCOTransientError extends INCOError {
  constructor(message) {
    super(message);
    this.name = 'INCOTransientError';
  }
}

class INCOPermanentError extends INCOError {
  constructor(message) {
    super(message);
    this.name = 'INCOPermanentError';
  }
}

class CircuitOpenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

const INCO_BASE = process.env.INCO_BASE_URL || 'https://inco.example.local';
const INCO_API_KEY = process.env.INCO_API_KEY || '';

class INCOClient {
  constructor({ baseUrl = INCO_BASE, apiKey = INCO_API_KEY, timeout = 30000, cbOptions = {} } = {}) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.http = axios.create({ baseURL: this.baseUrl, timeout });
    if (this.apiKey) this.http.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;

    // simple in-memory circuit breaker
    this.failureCount = 0;
    this.failureThreshold = cbOptions.failureThreshold || 5;
    this.openDurationMs = cbOptions.openDurationMs || 60_000; // 60s
    this.openUntil = 0;
  }

  isCircuitOpen() {
    return Date.now() < this.openUntil;
  }

  recordFailure() {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold) {
      this.openUntil = Date.now() + this.openDurationMs;
    }
  }

  recordSuccess() {
    this.failureCount = 0;
  }

  classifyError(err) {
    // network errors or 5xx are transient; 4xx are permanent (bad request/auth)
    if (err.response) {
      const status = err.response.status;
      if (status >= 500) return new INCOTransientError(`INCO server error ${status}`);
      return new INCOPermanentError(`INCO request failed ${status}: ${JSON.stringify(err.response.data)}`);
    }
    // timeout or network
    return new INCOTransientError(err.message || 'Network/timeout');
  }

  async compute(program, publicInputs = {}, privateInputs = {}, meta = {}) {
    if (this.isCircuitOpen()) {
      throw new CircuitOpenError('INCO circuit is open due to repeated errors');
    }

    const requestId = meta.requestId || uuidv4();
    const payload = {
      program,
      publicInputs,
      privateInputs,
      meta: { ...meta, requestId }
    };

    try {
      const resp = await this.http.post('/compute', payload);
      this.recordSuccess();
      return resp.data;
    } catch (err) {
      const classified = this.classifyError(err);
      this.recordFailure();
      // throw classified error so callers can react differently
      throw classified;
    }
  }
}

INCOClient.INCOError = INCOError;
INCOClient.INCOTransientError = INCOTransientError;
INCOClient.INCOPermanentError = INCOPermanentError;
INCOClient.CircuitOpenError = CircuitOpenError;

module.exports = INCOClient;
