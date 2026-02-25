require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'search-service' }));

// POST /search
app.post('/search', (req, res) => {
  const { query } = req.body;
  // TODO: integrar con Elasticsearch / Algolia / búsqueda propia
  res.json({ query, results: [], message: 'search - TODO' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`search-service running on port ${PORT}`));
