import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { DB_URI } = process.env;  // Neon DB URI

const connect = async () => {
    const client = new pg.Client(DB_URI);
    
    try {
        await client.connect();
        console.log("Connected to Neon DB successfully!");
        return client;
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
}

export default connect;
