import { chromium } from 'playwright';
import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

// Neon DB connection URI from .env
const { DB_URI } = process.env;

const config = {
    connectionString: DB_URI,  // Use connection string directly
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync('./ca.pem').toString(),
    },
};

// Function to ensure table exists
const ensureTableExists = async (client) => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS quotes (
            id SERIAL PRIMARY KEY,
            text TEXT NOT NULL UNIQUE,
            author VARCHAR(255) NOT NULL
        );
    `;

    try {
        await client.query(createTableQuery);
        console.log("Table 'quotes' ensured.");
    } catch (err) {
        console.error("Error creating table:", err);
    }
};

// Function to scrape quotes
const scrapeQuotes = async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('https://quotes.toscrape.com/');
    
    let quotes = [];

    // Extract quotes and authors using locator
    const quoteLocator = page.locator('.quote');
    const count = await quoteLocator.count();

    for (let i = 0; i < count; i++) {
        const quoteElement = quoteLocator.nth(i);
        const text = await quoteElement.locator('.text').textContent();
        const author = await quoteElement.locator('.author').textContent();

        quotes.push({ text: text.trim(), author: author.trim() });
    }

    console.log('Scraped Quotes:', quotes);
    await browser.close();
    return quotes;
};

// Function to insert quotes into the database
const insertQuotesToDB = async (quotes) => {
    const client = new pg.Client(config);
    
    try {
        await client.connect();
        console.log("Connected to Neon DB.");

        // Ensure table exists
        await ensureTableExists(client);

        for (const quote of quotes) {
            const query = `INSERT INTO quotes (text, author) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
            await client.query(query, [quote.text, quote.author]);
        }

        console.log("Quotes inserted successfully.");
    } catch (err) {
        console.error("Database error:", err);
    } finally {
        await client.end();
    }
};

// Main function to scrape and store quotes
const main = async () => {
    const quotes = await scrapeQuotes();
    if (quotes.length > 0) {
        await insertQuotesToDB(quotes);
    } else {
        console.log("No quotes found.");
    }
};

main();
