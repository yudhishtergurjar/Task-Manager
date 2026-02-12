import express from "express";
import bcrypt from "bcrypt";
import "dotenv/config";
import {generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken} from "../services/token.js";
import {register,logout, changeRefreshToken,read,write } from "../services/dbOperation.js";
import path from "path";
import { schemaMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { userRegisterSchema, userLoginSchema } from "../Schema/schema.js";
const dbPath = path.resolve("../Database/db.json");

const router = express.Router();


router.post('/register',schemaMiddleware(userRegisterSchema),async (req,res)=>{
    const {username,email,password}= req.body;
    const data = await read();
    if(Object.hasOwn(data.users, email)){
        return res.status(409).json({message:"email alrady exists"});
    }
    const existingUser = Object.values(data.users).find((user)=>user.username==username)
    const hashedPassword = await bcrypt.hash(password, 12);
    const refreshToken = generateRefreshToken({username,email});
    const accessToken = generateAccessToken({username,email});
    const obj={
        username,
        email,
        hashedPassword,
        refreshToken,
        projects:[]
    }


    await register(obj);
    return res.status(201).json({message:"userCreated",accessToken, refreshToken});
})

router.post('/login',schemaMiddleware(userLoginSchema),async (req,res)=>{
    const {email,password}= req.body;
    let data = await read();
    if (Object.hasOwn(data.users, email)){
        const username = data.users[email].username;

        if(await bcrypt.compare(password, data.users[email].hashedPassword)){
            const refreshToken = generateRefreshToken({username,email});
            const accessToken = generateAccessToken({username,email}); 
            return res.status(201).json({message:"userloggedIn",accessToken, refreshToken});
        }else return res.status(400).json({message:"invalid creadientials"});  
       
    }else{
        return res.status(400).json({message:"user not found"});    
    }
})

router.get('/logout',async (req,res)=>{    
    const token = req.headers.authorization.split(' ')[1];
    const decoded = verifyAccessToken(token);
    
    
    try{
        const email = decoded.email;
        await logout(email);
        return res.status(200).json({message:"user logout succesffully"});
    }catch(err){
        res.status(400).json({message:"problem occur"})
    }
    
})

router.get('/refreshToken',async (req,res)=>{   
    const token = req.cookies.refreshToken; 
    const decoded = verifyRefreshToken(token);
    const email = decoded.email;
    const username = decoded.username;

    const newAccessToken = generateAccessToken({username,email});
    const newRefreshToken = generateRefreshToken({username,email});
    
    await changeRefreshToken(newRefreshToken,email);

    res.status(200).json({newAccessToken,newRefreshToken});
})


export default router;