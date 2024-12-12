import puppeteer from 'puppeteer';
import pool from '../db.js'; // PostgreSQL pool
import categories from '../categories.js';

export async function scrapeJobs() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const jobs = [];

    try {
        // Navigate to the job listing page

        await page.goto('https://rooster.jobs/?&limit=60&page=2', { waitUntil: 'domcontentloaded' });
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

                // Add job with details
                jobs.push({ title: job.title, link: job.link, details });

                // Store in the database
                await pool.query(
                    `INSERT INTO jobs (title, link, details) 
                     VALUES ($1, $2, $3) ON CONFLICT (link) DO NOTHING`,
                    [job.title, job.link, details]
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


export async function getJobs(){
    try {
        const result =  await pool.query('SELECT * FROM jobs')
        for(const row of result.rows){
            console.log(categorizeJob(row))
        }
        return result.rows[0];
    } catch (error) {
        console.log(error)
    }
}

export function categorizeJob(job) {
    const jobTitle = job.title.toLowerCase();
    console.log('jobtitle :' , jobTitle)
    const jobDes = job.details.toLowerCase();
    let finalCategory = 'Uncategorized'
    
    
    Object.entries(categories).forEach(([category,keywords])=>{
        keywords.forEach(keyword => {
        if(jobTitle.includes(keyword) && jobDes.includes(keyword)){
            finalCategory = category;
        }
       });
       
    })
    return `${finalCategory} \n`;
}
