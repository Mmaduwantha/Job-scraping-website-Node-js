import express from 'express'
import userModel from '../models/userModels.js';
const router = express.Router();

router.get('/',async (req,res)=>{
    const result = await userModel.getAll();
    res.send(result)
})

router.post('/addUser',async (req,res)=>{
    let id= req.body.id
    let name = req.body.name
    let email = req.body.email
    let password = req.body.password

    const result = await userModel.addUser(id,name,email,password) 
    res.send(result)
})
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Ensure both email and password are provided
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