import express from "express";
import "dotenv/config";
import { schemaMiddleware, authMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { createProjectSchema, userLoginSchema } from "../Schema/schema.js";
import User from "../Database/user.model.js";
import Project from "../Database/project.model.js";
const router = express.Router();

router.post('/add',authMiddleware, schemaMiddleware(createProjectSchema),async (req,res)=>{
    try{
        const {title,description}= req.body;
        const email = req.user.email;
        const user= await User.findOne({email});
        const newProject = new Project({
            title,
            description,
            owner:user._id
        })
        const savedProject = await newProject.save();
        return res.status(200).json({message:"added successfully",savedProject});
    }catch(err){
        return res.status(400).json({message:"error occured",err});
    } 
})

router.get('/read/:id',authMiddleware,async (req,res)=>{
    try{
        const id = req.params.id;
        const email = req.user.email;  
        const user = await User.findOne({email});
        const existingProj = await Project.findOne({_id:id});
        if(!existingProj) return res.status(400).json({message:"project dont exists"});

        if(!existingProj.owner.equals(user._id)) return res.status(400).json({message:"invalid user"});
        return res.status(200).json({message:"successfully read",existingProj});
     
    }catch(err){
        return res.status(400).json({message:"error occured while reading",err});
    }
})

router.patch("/update/:id",authMiddleware,async (req,res)=>{
    try{
        const {title,description} = req.body;
        const id = req.params.id;
        const email = req.user.email;  
        const user = await User.findOne({email});
        const existingProj = await Project.findOne({_id:id});
        if(!existingProj) return res.status(400).json({message:"project dont exists"});

        if(!existingProj.owner.equals(user._id)) return res.status(400).json({message:"invalid user"});

        existingProj.title = title || existingProj.title;
        existingProj.description =  description || existingProj.description;
        const updatedProj = await existingProj.save();
        return res.status(200).json({message:"successfully read",updatedProj}); 
    }catch(err){
        return res.status(400).json({message:"error occured while reading",err});
    }    
})

router.delete("/delete/:id",authMiddleware,async(req,res)=>{
    try{
        const id = req.params.id;
        const email = req.user.email;  
        const user = await User.findOne({email});
        const existingProj = await Project.findOne({_id:id});
        if(!existingProj) return res.status(400).json({message:"project dont exists"});
        if(!existingProj.owner.equals(user._id)) return res.status(400).json({message:"invalid user"});
        await existingProj.deleteOne();
        return res.status(200).json({message:"project deleted successfully"});
    }catch(err){
        return res.status(400).json({message:"error occured"});
    }
})

router.get("/list",authMiddleware,async (req,res)=>{
    try{
        const {page=1, limit=10} = req.query;
        const email = req.user.email;
        const user = await User.findOne({email});
        const allProjects = await user.populate("projects");

        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber-1)*pageSize;

        const paginatedProjects = allProjects.projects.slice(skip, skip+pageSize);
        res.status(200).json({
            total: allProjects.length,
            page: pageNumber,
            data: paginatedProjects
        });

    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured while listing",err});
    }
});

export default router;