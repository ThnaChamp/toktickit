import express, { type Request, type Response } from 'express';
import cors from 'cors'

// Create App Express
const app = express();
const PORT = 3000; // Define Port run Server

app.use(cors({
  origin: 'http://localhost:5173',
}))

// Create Endpoint GET /api/health
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        service: "TokTickIT API"
    });
});

// Start the server and wait for connections
app.listen(PORT, () => {
    console.log(`TokTickIT API is running on http://localhost:${PORT}`);
});