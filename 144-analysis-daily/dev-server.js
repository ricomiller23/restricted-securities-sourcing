import express from 'express';
import cors from 'cors';
import tickersHandler from './api/tickers.js';
import feedHandler from './api/feed.js';
import ftsHandler from './api/fts.js';

const app = express();
const PORT = 5006;

app.use(cors());
app.use(express.json());

// Mount the serverless function handlers
app.get('/api/tickers', tickersHandler);
app.get('/api/feed', feedHandler);
app.get('/api/fts', ftsHandler);

// Handle basic root check
app.get('/', (req, res) => {
  res.json({ message: "144 Analysis Daily Local API Server Running" });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 [144 Analysis Daily] Backend running at http://127.0.0.1:${PORT}`);
  console.log(`🔌 Proxying frontend requests to SEC Edgar endpoints.`);
  console.log(`=============================================================\n`);
});
