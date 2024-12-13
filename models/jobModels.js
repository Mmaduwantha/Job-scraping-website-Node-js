import puppeteer from 'puppeteer';
import pool from '../db.js'; // PostgreSQL pool
import categories from '../categories.js'; // Categories for categorization

/**
 * Function to scrape job listings from the website.
 */
export async function scrapeJobs() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const jobs = [];

    try {
        // Navigate to the job listing page
        await page.goto('https://rooster.jobs/?&limit=6&page=2', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.job-title');

        // Scrape job titles and links
        const jobTitles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.job-header-info a.job-title')).map(job => ({
                title: job.querySelector('h5')?.innerText.trim() || 'No title',
                link: job.href || '#',
            }));
        });

        // Iterate through jobs to scrape details
        for (const job of jobTitles) {
            const jobPage = await browser.newPage();
            try {
                await jobPage.goto(job.link, { waitUntil: 'domcontentloaded' });
                await jobPage.waitForSelector('.reader');

                // Scrape job details
                const details = await jobPage.evaluate(() => {
                    const detailsElement = document.querySelector('.reader');
                    return detailsElement ? detailsElement.innerText.trim() : 'No details available.';
                });

                // Categorize the job
                const category = categorizeJob({ title: job.title, details });

                // Add job with details and category
                jobs.push({ title: job.title, link: job.link, details, category });

                // Store in the database
                await pool.query(
                    `INSERT INTO jobs (title, link, details, category) 
                     VALUES ($1, $2, $3, $4) ON CONFLICT (link) DO NOTHING`,
                    [job.title, job.link, details, category]
                );
            } catch (error) {
                console.error(`Failed to fetch details for job: ${job.title}`, error);
            } finally {
                await jobPage.close();
            }
        }
    } catch (error) {
        console.error('Error scraping jobs:', error);
    } finally {
        await browser.close();
    }

    return jobs; // Return the jobs list
}

/**
 * Function to categorize a job based on its title and details.
 */
export function categorizeJob(job) {
    const jobTitle = job.title.toLowerCase();
    const jobDes = job.details.toLowerCase();
    let finalCategory = 'Uncategorized';

    Object.entries(categories).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
            if (jobTitle.includes(keyword) && jobDes.includes(keyword)) {
                finalCategory = category;
            }
        });
    });

    return finalCategory;
}

/**
 * Function to retrieve jobs from the database.
 */
export async function getJobs() {
    try {
        const result = await pool.query('SELECT * FROM jobs');
        const categorizedJobs = result.rows.map(row => categorizeJob(row));

        // Print categorized jobs for debugging
        categorizedJobs.forEach(job => console.log(job));

        return result.rows;
    } catch (error) {
        console.error('Error retrieving jobs:', error);
    }
}

export async function getCategorizedJobs(jobTitle) {
    if (!jobTitle) {
        throw new Error('Job title is required.');
    }

    // Categorize the user-provided job title
    const category = categorizeJob({ title: jobTitle, details: '' });

    if (category === 'Uncategorized') {
        throw new Error('No category found for the given job title.');
    }

    try {
        // Fetch jobs from the database for the determined category
        const result = await pool.query('SELECT * FROM jobs WHERE category = $1', [category]);

        if (result.rows.length === 0) {
            throw new Error(`No jobs found for the category: ${category}`);
        }

        return { category, jobs: result.rows };
    } catch (error) {
        console.error('Error fetching jobs from the database:', error);
        throw new Error('Internal server error.');
    }
}
