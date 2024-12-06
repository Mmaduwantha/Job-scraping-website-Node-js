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

export default router;