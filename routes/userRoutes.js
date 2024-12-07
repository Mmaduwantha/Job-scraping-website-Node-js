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
    let loggingSucces = false;

    try {
        const result = await userModel.logIn(email, password);
        if (result) {
            loggingSucces = true;
        }
        res.send({ success: loggingSucces });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
})


export default router;