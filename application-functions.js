import UserModel from "./models/userModels.js";
import jobs from './jobs.json' assert { type: 'json' };

async function matchJob(email) {
    const applicant = await UserModel.get(email)
    console.log(applicant)
}
await matchJob('rakith@gg.com')