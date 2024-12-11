import puppeteer from 'puppeteer';
import pool from '../db.js'; // PostgreSQL pool

export async function scrapeJobs() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const jobs = [];

    try {
        // Navigate to the job listing page
<<<<<<< HEAD
        await page.goto('https://rooster.jobs/?&limit=60&page=2', { waitUntil: 'domcontentloaded' });
=======
        await page.goto('https://rooster.jobs/?&limit=100&page=1', { waitUntil: 'domcontentloaded' });
>>>>>>> cf6f8f74b4401c99f99c4b3e1bc2c1ee59aaf1b1
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
    const categories = {
        'Software Development & Engineering': [
            'developer', 'engineer', 'software', 'tech lead', 'programmer', 'react', 'programming', 'tech', 
            'lead', 'backend', 'frontend', 'fullstack', 'devops', 'ai', 'ml', 'data scientist', 'data engineer', 
            'cloud', 'golang', 'java', 'python', 'javascript', 'typescript', 'docker', 'kubernetes', 'aws', 'azure', 
            'gcp', 'mobile developer', 'flutter', 'ios', 'android', 'blockchain', 'web developer', 'database',
            
            // Additional keywords
            'software architect', 'solution architect', 'principal engineer', 'senior developer', 'junior developer', 
            'systems engineer', 'embedded systems', 'security engineer', 'network engineer', 'machine learning engineer', 
            'computer vision', 'nlp', 'natural language processing', 'deep learning', 'robotics', 'linux', 'windows', 
            'mac', 'shell scripting', 'git', 'agile development', 'scrum', 'microservices', 'api', 'rest', 'graphql', 
            'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'spring', 'node.js', 'angular', 'vue', 'swift', 
            'kotlin', 'scala', 'rust', 'c++', 'c#', '.net', 'unity', 'unreal', 'game developer', 'site reliability', 
            'qa engineer', 'test automation', 'cybersecurity', 'network security', 'cryptography'
        ],
        'Marketing & Creative': [
            // Existing keywords
            'marketing', 'content', 'creative', 'advertising', 'social media', 'seo', 'sem', 'branding', 
            'copywriter', 'digital marketing', 'growth marketing', 'email marketing', 'influencer', 'campaign',
            
            // Additional keywords
            'marketing manager', 'brand strategist', 'digital strategist', 'content strategist', 'media planner', 
            'market research', 'analytics', 'google ads', 'facebook ads', 'linkedin marketing', 'twitter marketing', 
            'content marketing', 'inbound marketing', 'affiliate marketing', 'performance marketing', 'ppc', 
            'marketing automation', 'crm marketing', 'marketing coordinator', 'marketing specialist', 'art director', 
            'creative director', 'marketing analyst', 'public relations', 'pr', 'event marketing', 'video marketing', 
            'podcast marketing', 'storytelling', 'brand manager', 'social media strategist', 'conversion optimization'
        ],
        'Human Resources (HR)': [
            // Existing keywords
            'human resources', 'hr', 'recruitment', 'human', 'resources', 'talent acquisition', 
            'employee relations', 'compensation', 'benefits', 'hrbp', 'hr manager',
            
            // Additional keywords
            'talent management', 'learning and development', 'organizational development', 'training specialist', 
            'hr business partner', 'hr coordinator', 'hr specialist', 'payroll specialist', 'hr administrator', 
            'diversity and inclusion', 'corporate culture', 'performance management', 'workforce planning', 
            'total rewards', 'employee engagement', 'talent retention', 'hr consultant', 'recruiting coordinator', 
            'compensation analyst', 'benefits coordinator', 'onboarding specialist'
        ],
        'Project & Program Management': [
            // Existing keywords
            'project manager', 'program manager', 'scrum master', 'agile', 'pmp', 'kanban', 
            'waterfall', 'delivery manager', 'product owner', 'project coordinator',
            
            // Additional keywords
            'technical project manager', 'it project manager', 'portfolio manager', 'program director', 
            'transformation manager', 'change management', 'prince2', 'lean', 'six sigma', 'project analyst', 
            'product manager', 'project control', 'risk management', 'stakeholder management', 'resource manager', 
            'program coordinator', 'enterprise project management', 'strategic planning', 'iteration manager', 
            'release manager', 'product marketing manager'
        ],
        'Business Development & Sales': [
            // Existing keywords
            'business development', 'sales', 'account manager', 'merchant', 'sales executive', 
            'business analyst', 'client relationship', 'crm', 'key account manager', 'partnership',
            
            // Additional keywords
            'sales director', 'sales manager', 'business development representative', 'inside sales', 
            'outside sales', 'enterprise sales', 'startup sales', 'sales operations', 'sales strategy', 
            'strategic account manager', 'channel sales', 'saas sales', 'b2b sales', 'b2c sales', 
            'sales engineer', 'pre-sales', 'solution sales', 'consultative sales', 'sales analyst', 
            'business consultant', 'market development', 'sales development representative', 'sdr', 
            'relationship manager', 'client success manager', 'revenue operations'
        ],
        'Customer Success & Support': [
            // Existing keywords
            'customer success', 'support', 'travel', 'customer service', 'client support', 
            'helpdesk', 'technical support', 'call center', 'customer care',
            
            // Additional keywords
            'customer experience', 'customer support manager', 'technical account manager', 
            'customer success representative', 'customer onboarding', 'customer retention', 
            'customer relationship management', 'service desk', 'tier 1 support', 'tier 2 support', 
            'tier 3 support', 'escalation specialist', 'customer training', 'implementation specialist', 
            'customer ops', 'support engineer', 'remote support', 'customer solutions', 'customer insights', 
            'customer success operations'
        ],
        'Finance & Accounting': [
            // Existing keywords
            'accountant', 'finance', 'analyst', 'accounts', 'auditor', 'tax', 'bookkeeping', 
            'financial advisor', 'cpa', 'cfp', 'budgeting', 'payroll',
            
            // Additional keywords
            'financial analyst', 'financial controller', 'financial manager', 'treasury', 
            'financial reporting', 'compliance', 'risk management', 'investment analyst', 
            'financial planning', 'corporate finance', 'financial modeling', 'credit analyst', 
            'accounts payable', 'accounts receivable', 'financial systems', 'erp', 'financial consultant', 
            'accounting manager', 'senior accountant', 'forensic accountant', 'internal audit', 
            'financial operations', 'financial strategy'
        ],
        'Creative & Design': [
            // Existing keywords
            'designer', 'vfx', 'video editor', 'ux', 'ui', 'graphic design', 'motion graphics', 
            'illustrator', 'animator', 'photoshop', 'adobe', 'product designer', 'industrial designer',
            
            // Additional keywords
            'art director', 'creative director', 'interaction designer', 'user experience researcher', 
            'brand designer', 'digital designer', '3d designer', 'game designer', 'print designer', 
            'packaging designer', 'web designer', 'creative technologist', 'design manager', 
            'creative strategist', 'experience designer', 'illustration', 'digital art', 'concept artist', 
            'character designer', 'creative producer', 'art production', 'multimedia designer', 
            'environmental design', 'design thinking'
        ],
        'Healthcare': [
            // Existing keywords
            'physiotherapist', 'nurse', 'medical', 'doctor', 'healthcare', 'pharmacist', 'therapist', 
            'clinical', 'surgeon', 'paramedic', 'dental', 'radiology',
            
            // Additional keywords
            'medical director', 'healthcare administrator', 'healthcare consultant', 'public health', 
            'medical research', 'medical technologist', 'medical imaging', 'clinical researcher', 
            'epidemiologist', 'healthcare IT', 'medical informatics', 'health informatics', 
            'medical specialist', 'mental health professional', 'occupational therapist', 
            'physical therapist', 'healthcare operations', 'medical sales', 'medical writer', 
            'healthcare quality', 'healthcare compliance', 'telemedicine', 'medical software'
        ],
        'General Roles': [
            // Existing keywords
            'general manager', 'storekeeper', 'assistant', 'office assistant', 'clerk', 
            'receptionist', 'secretary', 'admin', 'supervisor', 'driver',
            
            // Additional keywords
            'executive assistant', 'administrative coordinator', 'front desk', 'office manager', 
            'facilities manager', 'operations assistant', 'executive support', 'administrative specialist', 
            'data entry', 'procurement assistant', 'office operations', 'fleet coordinator', 
            'administrative coordinator', 'general staff', 'management trainee', 'facility maintenance', 
            'office support', 'general worker', 'administrative support'
        ],
        'Quality Assurance': [
            // Existing keywords
            'qa', 'quality', 'tester', 'automation', 'manual testing', 'quality analyst', 
            'test engineer', 'sdet', 'bug tracking', 'load testing', 'performance testing',
            
            // Additional keywords
            'quality control', 'quality manager', 'quality assurance specialist', 'test lead', 
            'automation tester', 'performance engineer', 'security testing', 'integration testing', 
            'regression testing', 'user acceptance testing', 'uat', 'test planning', 'test strategy', 
            'test architecture', 'continuous testing', 'test automation engineer', 'test data management', 
            'test environment', 'exploratory testing', 'compliance testing'
        ],
        'Content Creation': [
            // Existing keywords
            'content writer', 'content creator', 'editor', 'blogger', 'youtuber', 
            'social media manager', 'copywriting', 'scriptwriter', 'video production',
            
            // Additional keywords
            'content strategist', 'content marketing', 'technical writer', 'ghostwriter', 
            'podcast producer', 'multimedia content creator', 'content editor', 'digital storyteller', 
            'content strategist', 'creative writer', 'long-form content', 'short-form content', 
            'content marketer', 'content specialist', 'digital content manager', 'seo content writer', 
            'brand journalist', 'content curator', 'narrative designer', 'multimedia journalist'
        ],
        'Data & Analytics': [
            // Existing keywords
            'data analyst', 'data scientist', 'data engineer', 'business intelligence', 
            'bi', 'etl', 'big data', 'sql', 'analytics', 'machine learning', 'statistics',
            
            // Additional keywords
            'data architect', 'data visualization', 'predictive analytics', 'statistical analysis', 
            'data mining', 'data governance', 'data quality', 'data strategy', 'data modeler', 
            'data management', 'data infrastructure', 'business data analyst', 'advanced analytics', 
            'data visualization specialist', 'data pipeline', 'data warehouse', 'data science manager', 
            'quantitative analyst', 'research scientist', 'computational scientist'
        ],
        'Legal': [
            // Existing keywords
            'lawyer', 'paralegal', 'legal assistant', 'attorney', 'corporate law', 
            'compliance', 'contract law', 'intellectual property', 'litigation',
            
            // Additional keywords
            'legal counsel', 'in-house counsel', 'legal operations', 'legal analyst', 
            'compliance officer', 'legal advisor', 'contract manager', 'legal specialist', 
            'legal researcher', 'patent attorney', 'privacy lawyer', 'regulatory affairs', 
            'legal consultant', 'legal technology', 'dispute resolution', 'legal drafting', 
            'legal project manager', 'international law', 'employment law', 'legal support'
        ],
        'Education & Training': [
            // Existing keywords
            'teacher', 'educator', 'trainer', 'coach', 'lecturer', 'professor', 
            'academic', 'curriculum', 'instructional designer', 'tutor',
            
            // Additional keywords
            'educational consultant', 'curriculum developer', 'online instructor', 'training manager', 
            'learning and development', 'corporate trainer', 'educational technology', 'e-learning specialist', 
            'educational designer', 'professional development', 'learning designer', 'learning experience designer', 
            'academic advisor', 'educational program manager', 'stem educator', 'educational researcher', 
            'educational leadership', 'school administrator', 'training coordinator'
        ],
        'Operations & Logistics': [
            // Existing keywords
            'logistics', 'supply chain', 'operations manager', 'inventory', 
            'warehouse', 'transportation', 'fleet manager', 'shipping', 'procurement',
            
            // Additional keywords
            'supply chain manager', 'operations director', 'logistics coordinator', 'distribution manager', 
            'inventory control', 'warehouse operations', 'logistics analyst', 'transportation coordinator', 
            'supply chain analyst', 'procurement specialist', 'logistics planner', 'operations specialist', 
            'global logistics', 'supply chain optimization', 'logistics technology', 'fulfillment manager', 
            'warehouse manager', 'logistics sales', 'logistics technology'
        ],
        'Hospitality & Tourism': [
            // Existing keywords
            'hotel manager', 'chef', 'cook', 'tour guide', 'bartender', 
            'housekeeping', 'event planner', 'hospitality', 'tourism',
            
            // Additional keywords
            'restaurant manager', 'food and beverage', 'guest relations', 'hospitality manager', 
            'resort manager', 'cruise ship staff', 'travel consultant', 'hospitality sales', 
            'catering manager', 'executive chef', 'pastry chef', 'sommelier', 'event coordinator', 
            'hospitality operations', 'concierge', 'hospitality trainer', 'food service manager', 
            'culinary director', 'hospitality marketing', 'tourism marketing'
        ]
    };
    
    Object.entries(categories).forEach(([category,keywords])=>{
        keywords.forEach(keyword => {
        if(jobTitle.includes(keyword) && jobDes.includes(keyword)){
            finalCategory = category;
        }
       });
       
    })
    return `${finalCategory} \n`;
}
