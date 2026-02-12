import express from "express";
import bcrypt from "bcrypt";
import "dotenv/config";
import {generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken} from "../services/token.js";
import {register,logout, changeRefreshToken,read,write, addProject } from "../services/dbOperation.js";
import path from "path";
import { schemaMiddleware, authMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { createProjectSchema, userLoginSchema } from "../Schema/schema.js";
const dbPath = path.resolve("../Database/db.json");

const router = express.Router();


router.post('/add',authMiddleware, schemaMiddleware(createProjectSchema),async (req,res)=>{
    const {title,description}= req.body;
    const decoded = verifyAccessToken(req.headers.authorization.split(" ")[1]);
    const email = decoded.email;
    const obj = {
        title:title,
        description:description,
        parent:email,
        task:[],
    }
    await addProject(obj);
    res.status(200).json({message:"added successfully"});
})

router.get('/read/:id',authMiddleware,async (req,res)=>{
    const id = req.params.id;
    const data = await read();
    const decoded = verifyAccessToken(req.headers.authorization.split(" ")[1]);
    const email = decoded.email;  

    if(Object.hasOwn(data.projects,id)){
        if(data.projects[id].parent != email) res.status(400).json({message:"invalid user"});
        const projectData = data.projects[id];
        res.status(200).json({message:"read success",projectData});
    }else{
        res.status(400).json({message:"invalid id"});
    }
})

router.patch("/update/:id",authMiddleware,async (req,res)=>{
    const data = await read();
    const id = req.params.id;
    const {title, description} = req.body;
    const decoded = verifyAccessToken(req.headers.authorization.split(" ")[1]);
    const email = decoded.email;  
    
    if(Object.hasOwn(data.projects,id)){
        if(data.projects[id].parent != email) res.status(400).json({message:"invalid user"});
        data.projects[id].title = title || data.projects[id].title;
        data.projects[id].description = description || data.projects[id].desc;
    }
    await write(data);
    res.status(200).json({message:"successfully completed"});
})

router.delete("/delete/:id",authMiddleware,async(req,res)=>{
    const data = await read();
    const id = req.params.id;
    const decoded = verifyAccessToken(req.headers.authorization.split(" ")[1]);
    const email = decoded.email;  
    let userId="";
    if(Object.hasOwn(data.projects,id)){
        if(data.projects[id].parent != email) res.status(400).json({message:"invalid user"});
        userId = data.projects[id].parent;
        delete data.projects[id]
    }
    if(userId){
        data.users[userId].projects = data.users[userId].projects.filter(val => val != id);
    }
    await write(data);
    res.status(200).json({message:"succesfuly write"});
})

router.get("/list",authMiddleware,async (req,res)=>{
    const {page, limit, sort} = req.query;
    const decoded = verifyAccessToken(req.headers.authorization.split(" ")[1]);
    const email = decoded.email;
    const data = await read();
    const userProjectsIds = data.users[email]?.projects || [];

    let userProjects = userProjectsIds.map(id=>({
        id,
        ...data.projects[id]
    }));
    console.log(userProjects);


    userProjects.sort((a, b)=>{
        if(sort === "desc") return Number(b.id)-Number(a.id);
        return Number(a.id) - Number(b.id);
    });

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber-1)*pageSize;
    const paginatedProjects = userProjects.slice(skip, skip+pageSize);
    res.status(200).json({
        total: userProjects.length,
        page: pageNumber,
        data: paginatedProjects
    });
});

export default router;