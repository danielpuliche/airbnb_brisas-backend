import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRouter from './routes/health.js';
import hostsRouter from './routes/hosts.js';

const app = express();

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes setup
app.use('/health', healthRouter);
app.use('/hosts', hostsRouter);

// Export the app
export default app;