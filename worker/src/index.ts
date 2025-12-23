import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ingestHandler } from './controllers/ingest.js';
import { chatHandler } from './controllers/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'EC2 Worker' });
});

// Core Endpoints
app.post('/ingest', ingestHandler);
app.post('/chat', chatHandler);

app.listen(PORT, () => {
    console.log(`Worker service running on port ${PORT}`);
});
