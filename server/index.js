import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.OPENROUTER_API_KEY) {
  console.error('OPENROUTER_API_KEY is required. Create a .env file with your key.');
  process.exit(1);
}

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:4173'] }));
app.use(express.json());
app.use('/api', apiRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('OpenRouter key: configured');
  console.log('Models: perplexity/sonar-pro (search) + anthropic/claude-sonnet-4-6 (generate)');
});
