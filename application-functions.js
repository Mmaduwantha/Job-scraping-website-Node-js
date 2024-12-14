import UserModel from "./models/userModels.js";
import categories from "./categories.js";

// Match a job to its category based on candidate's information
async function matchJob(email) {
    try {
        const candidate = await UserModel.get(email);
        if (!candidate) {
            console.error(`Candidate with email ${email} not found.`);
            return;
        }
    } catch (error) {
        console.error("Error in matchJob:", error.message);
    }
}

// Get the candidate's job category


// Categorize a job based on its title and details
export async function getCategoryByTitle(job) {
    if (!job && !job.jobTitle) {
        console.error("Invalid job data provided.");
        return 'Uncategorized';
    }
    const jobTitle = job.jobTitle.toLowerCase();
    let finalCategory = 'Uncategorized';

    Object.entries(categories).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
            if (jobTitle.includes(keyword)) {
                finalCategory = category;
            }
        });
    });
    console.log(finalCategory)
    return finalCategory;
    
}

// Example Usage
matchJob('davis@gg.com');
