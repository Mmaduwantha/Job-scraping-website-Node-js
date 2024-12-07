import express from 'express'
import userModel from '../models/userModels.js';
const router = express.Router();

router.get('/',async (req,res)=>{
    const result = await userModel.getAll();
    res.send(result)
})

router.post('/signUp',async (req,res)=>{
    let id= req.body.id
    let name = req.body.name
    let email = req.body.email
    let password = req.body.password

    const result = await userModel.signUp(id,name,email,password) 
    res.send(result)
})

router.post('/register',async (req,res)=>{
    let fullName= req.body.fullName
    let dateOfBirth = req.body.dateOfBirth
    let location = req.body.location
    let currentStatus = req.body.currentStatus
    let jobRoll=req.body.jobRoll
    let skill=req.body.skill
    let experience=req.body.experience
    let education=req.body.education
    let description=req.body.description


    const result = await userModel.register(fullName,dateOfBirth,location,currentStatus,jobRoll,skill,experience,education,description) 
    res.send(result)
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ success: false, message: 'Email and password are required.' });
    }

    try {
        const isAuthenticated = await userModel.logIn(email, password);

        if (isAuthenticated) {
            return res.status(200).send({ success: true, message: 'Login successful.' });
        } else {
            return res.status(401).send({ success: false, message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
});


export default router;