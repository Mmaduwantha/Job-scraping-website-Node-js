import puppeteer from 'puppeteer';
import pool from '../db.js'; // PostgreSQL pool
import categories from '../categories.js'; // Categories for categorization
import { getCategoryByTitle } from '../application-functions.js';

/**
 * Function to scrape job listings from the website.
 */
/**
 * Function to scrape job listings from the website with a page limit.
 */
/**
 * Function to scrape job listings from the website with dynamic content loading.
 */
export async function scrapeJobs(maxPages = Infinity) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const jobs = [];

    try {
        let loadMoreExists = true;
        let currentPage = 3;

        // Navigate to the initial page
        await page.goto('https://rooster.jobs/?&limit=60', { waitUntil: 'domcontentloaded' });

        while (loadMoreExists && currentPage <= maxPages) {
            console.log(`Processing page: ${currentPage}`);

            // Wait for job titles to load
            await page.waitForSelector('.job-title', { timeout: 5000 });

            // Scrape job titles and links
            const jobTitles = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.job-header-info a.job-title')).map(job => ({
                    title: job.querySelector('h5')?.innerText.trim() || 'No title',
                    link: job.href || '#',
                }));
            });

            console.log(`Found ${jobTitles.length} jobs on page ${currentPage}.`);

            // Process each job
            for (const job of jobTitles) {
                const jobPage = await browser.newPage();
                try {
                    await jobPage.goto(job.link, { waitUntil: 'domcontentloaded' });
                    await jobPage.waitForSelector('.reader', { timeout: 5000 });

                    const details = await jobPage.evaluate(() => {
                        const detailsElement = document.querySelector('.reader');
                        return detailsElement ? detailsElement.innerText.trim() : 'No details available.';
                    });

                    const category = categorizeJob({ title: job.title, details });

                    jobs.push({ title: job.title, link: job.link, details, category });

                    await pool.query(
                        `INSERT INTO jobs (title, link, details, category) 
                         VALUES ($1, $2, $3, $4) ON CONFLICT (link) DO NOTHING`,
                        [job.title, job.link, details, category]
                    );

                    console.log(`Job saved: ${job.title}`);
                } catch (error) {
                    console.error(`Failed to process job: ${job.title}`, error);
                } finally {
                    await jobPage.close();
                }
            }

            // Check if "Load More" button exists and click it
            loadMoreExists = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button.ant-btn'));
                for (const button of buttons) {
                    if (button.innerText.trim() === 'Load More') {
                        button.click();
                        return true;
                    }
                }
                return false;
            });
            if (loadMoreExists) {
                console.log('Clicked "Load More". Waiting for new jobs to load...');
                await new Promise(resolve => setTimeout(resolve, 3500)); // Wait for 3 seconds
            }
            

            currentPage++;
        }
    } catch (error) {
        console.error('Error during scraping process:', error);
    } finally {
        await browser.close();
    }

    return jobs;
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
    const category = await getCategoryByTitle({ jobTitle });
    console.log(category)
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
