import express from 'express';
import quoteRoutes from './quotes/quotes.js';

const router = express.Router();

// Define route groups
router.use('/quotes', quoteRoutes);

export default router;
