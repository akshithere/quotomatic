import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure your connection string for Neon DB (Neon uses PostgreSQL URI format)
const { DB_URI } = process.env;

const client = new pg.Client(DB_URI);

// Connect to Neon DB
client.connect()
    .then(() => console.log("Connected to Neon DB"))
    .catch(err => {
        console.error("Database connection error:", err);
        process.exit(1);
    });

/**
 * @route GET /api/quotes
 * @desc Get all quotes
 */
router.get('/', async (req, res) => {

    console.log("it did hit the /api/quotes")
    try {
        const result = await client.query('SELECT * FROM quotes ORDER BY id ASC;');
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching quotes:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * @route GET /api/quotes/:id
 * @desc Get a single quote by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM quotes WHERE id = $1;', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Quote not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching quote:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * @route POST /api/quotes
 * @desc Add a new quote
 */
router.post('/', async (req, res) => {
    const { text, author } = req.body;
    if (!text || !author) {
        return res.status(400).json({ message: "Text and author are required" });
    }

    try {
        const result = await client.query(
            'INSERT INTO quotes (text, author) VALUES ($1, $2) RETURNING *;',
            [text, author]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error adding quote:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * @route DELETE /api/quotes/:id
 * @desc Delete a quote by ID
 */
router.delete('/:id', async (req, res) => {
    try {
        const result = await client.query('DELETE FROM quotes WHERE id = $1 RETURNING *;', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Quote not found' });
        }
        res.json({ message: 'Quote deleted successfully' });
    } catch (err) {
        console.error("Error deleting quote:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
