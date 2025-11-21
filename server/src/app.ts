import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import planRoutes from './routes/plan';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/plan', planRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
