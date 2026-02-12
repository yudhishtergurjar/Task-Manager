import express from "express";
import bcrypt from "bcrypt";
import "dotenv/config";
import {generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken} from "../services/token.js";
import {register,logout, changeRefreshToken,read,write, addTask } from "../services/dbOperation.js";
import path from "path";
import { schemaMiddleware, authMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { createTaskSchema, updateTaskSchema, updateStatusSchema } from "../Schema/schema.js";
const dbPath = path.resolve("../Database/db.json");

const router = express.Router();

router.post('/add/:id',authMiddleware, schemaMiddleware(createTaskSchema),async (req,res)=>{
    const {title,description}= req.body;
   
    const decoded = verifyAccessToken(req.headers.authorization.split(" ")[1]);
    const email = decoded.email;
    const projectId = req.params.id;
    
    const obj = {
        title:title,
        description:description,
        status:"pending",
        parent:email,
        parentProject:projectId
    }
    let data = await read();
    if(Object.hasOwn(data.projects,projectId)){
        await addTask(obj);
        return res.status(200).json({message:"added successfully"});
    }else{
        return res.status(400).json({message:"project id dont exists"});
    }
   
})

router.get('/read/:id',authMiddleware,async (req,res)=>{
    const id = req.params.id;
    const data = await read();
    const decoded = verifyAccessToken(req.headers.authorization.split(" ")[1]);
    const email = decoded.email;

    if(Object.hasOwn(data.tasks,id)){
        if(data.tasks[id].parent == email){
            const taskData = data.tasks[id];
            return res.status(200).json({message:"read success",taskData});
        }else{
            return res.status(400).json({message:"not allowed"});
        }
    }else{
        return res.status(400).json({message:"invalid id"});
    }
})

router.patch("/update/:id",authMiddleware,schemaMiddleware(updateTaskSchema),async (req,res)=>{
    const data = await read();
    const id = req.params.id;
    const {title, description} = req.body;

    const decoded = verifyAccessToken(req.headers.authorization.split(" ")[1]);
    const email = decoded.email;  
 
    if(Object.hasOwn(data.tasks,id)){
        if(data.tasks[id].parent == email){
            data.tasks[id].title = title || data.tasks[id].title;
            data.tasks[id].description = description || data.tasks[id].description;
            await write(data);
            return res.status(200).json({message:"successfully completed"});
        }else{
            return res.status(400).json({message:"not allowed"});
        }
    }else{
        return res.status(400).json({message:"not allowed"});
    }
    
})

router.patch("/updateStatus/:id",authMiddleware,schemaMiddleware(updateStatusSchema),async (req,res)=>{
    const data = await read();
    const id = req.params.id;
    const {status} = req.body;
    const decoded = verifyAccessToken(req.headers.authorization.split(" ")[1]);
    const email = decoded.email;    
    
    if(Object.hasOwn(data.tasks,id)){
        if(data.tasks[id].parent == email){
            data.tasks[id].status = status || data.tasks[id].status;
        }else{
            return res.status(400).json({message:"not allowed"});
        }
    }
    await write(data);
    return res.status(200).json({message:"successfully completed"});
})

router.delete("/delete/:id",authMiddleware,async(req,res)=>{
    const data = await read();
    const id = req.params.id;
    const decoded = verifyAccessToken(req.headers.authorization.split(" ")[1]);
    const email = decoded.email;  
    let userId="";
    if(Object.hasOwn(data.tasks,id)){
        userId = data.tasks[id].parent;
        if(email !=userId) return res.status(400).json({message:"invalid user"});
        const projectId = data.tasks[id].parentProject;
        data.projects[projectId].task = data.projects[projectId].task.filter(val => val != id);
        delete data.tasks[id];
        await write(data);
        return res.status(200).json({message:"succesfuly write"});
    }
})

export default router;