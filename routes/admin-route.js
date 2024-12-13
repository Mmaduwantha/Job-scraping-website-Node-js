import express from 'express';
import { getJobs, scrapeJobs,getCategorizedJobs } from '../models/jobModels.js';


const router = express.Router();

// Route to scrape jobs and store them in the database
router.post('/scrape', async (req, res) => {
    try {
        const scrapedJobs = await scrapeJobs();
        res.status(200).json({ message: 'Jobs scraped successfully'});
    } catch (error) {
        console.error('Error scraping jobs:', error);
        res.status(500).json({ error: 'Failed to scrape jobs' });
    }
});

// Route to get all stored job postings
router.get('/jobs', async (req, res) => {
    try {
        const result = await getJobs();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

router.get('/categorizedJobs', async (req, res) => {
    const { jobTitle } = req.query;

    try {
        if (!jobTitle) {
            return res.status(400).json({ error: 'Job title is required.' });
        }
        console.log(`Received job title: "${jobTitle}"`);
        const { jobs } = await getCategorizedJobs(jobTitle);
        res.status(200).json({ category, jobs });
    } catch (error) {
        console.error('Error in /categorizedJobs route:', error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;
