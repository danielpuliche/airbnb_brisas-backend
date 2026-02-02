import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middleware setup

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Sample route

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API funcionando correctamente 🚀'
    });
});

// Export the app

export default app;