import express from 'express'
import userModel from '../models/userModels.js';
const router = express.Router();

router.get('/',async (req,res)=>{
    const result = await userModel.getAll();
    res.send(result)
})

router.post('/signUp',async (req,res)=>{
    let fullName = req.body.fullName
    let email = req.body.email
    let password = req.body.password

    const result = await userModel.signUp(fullName,email,password) 
    res.send(result)
})

router.post('/register', async (req, res) => {
    const { email, fullName, dateOfBirth, location, currentStatus, jobRoll, skill, experience, education, description} = req.body;

    if (!email || !fullName || !dateOfBirth || !location || !currentStatus || !jobRoll || !skill || !experience || !education || !description) {
        return res.status(400).send({ success: false, message: 'All fields are required.' });
    }

    try {
        const result = await userModel.register(email, fullName, dateOfBirth, location, currentStatus, jobRoll, skill, experience, education, description);

        if (result) {
            return res.status(200).send({ success: true, message: 'User details updated successfully.', data: result });
        } else {
            return res.status(404).send({ success: false, message: 'User not found. Cannot update details.' });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).send({ success: false, message: 'Internal Server Error.' });
    }
});




router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ success: false, message: 'Email and password are required.' });
    }

    try {
        const { authenticated, role } = await userModel.logIn(email, password);

        if (authenticated) {
            if (role === 'admin') {
                return res.status(200).send({ success: true, message: 'Login successful as admin.' });
            } else {
                return res.status(200).send({ success: true, message: 'Login successful as user.' });
            }
        } else {
            return res.status(401).send({ success: false, message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
});


export default router;