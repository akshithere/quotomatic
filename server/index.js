import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import CORS package
import connect from './db/connect.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT || 5000;

// Apply CORS middleware only once with your configuration
app.use(cors({
    origin: 'https://quotomatic.akcelify.xyz',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

(async () => {
    const dbClient = await connect();  // Ensure connect() is asynchronous if necessary
    app.use((req, res, next) => {
        req.db = dbClient; // Attach DB client to requests
        next();
    });

    app.use('/api', routes);

    app.get('/', (req, res) => res.send("API is healthy"));

    app.listen(port, () => console.log(`Server running on port ${port}`));
})();
