import express from 'express';
import { scrapeJobs } from '../models/jobModels.js';
import pool from '../db.js'; // PostgreSQL pool

const router = express.Router();

// Route to scrape jobs and store them in the database
router.post('/scrape', async (req, res) => {
    try {
        const scrapedJobs = await scrapeJobs();
        res.status(200).json({ message: 'Jobs scraped successfully', jobs: scrapedJobs });
    } catch (error) {
        console.error('Error scraping jobs:', error);
        res.status(500).json({ error: 'Failed to scrape jobs' });
    }
});

// Route to get all stored job postings
router.get('/jobs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jobs');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

export default router;