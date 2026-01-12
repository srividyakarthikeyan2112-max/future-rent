const express = require("express");
const cors = require("cors");
require("dotenv").config();

const assetRoutes = require("./routes/assetRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const adminRoutes = require("./routes/admin");
const incomeRoutes = require('./routes/incomeRoutes');
const incoDocsRoutes = require('./routes/incoDocsRoutes');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/admin/ui', express.static('public'));

// Routes
app.use("/api/assets", assetRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/admin", adminRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/inco-docs', incoDocsRoutes);

// metrics
const register = client.register;
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "FutureRent API is running" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // start event listeners
    try {
      const eventListener = require("./services/eventListener");
      eventListener.startInvestmentListener();
    } catch (err) {
      console.error("Failed to start event listeners:", err.message || err);
    }
  });
}

module.exports = app;
