import express from "express";
import "dotenv/config";
import { schemaMiddleware, authMiddleware } from "../Middleware/schemaMiddleware.js"; 
import { createTaskSchema, updateTaskSchema, updateStatusSchema } from "../Schema/schema.js";
import User from "../Database/user.model.js";
import Project from "../Database/project.model.js";
import Task from "../Database/task.model.js";

const router = express.Router();

router.post('/add/:id',authMiddleware, schemaMiddleware(createTaskSchema),async (req,res)=>{
    try{
        const {title, description}=req.body;
        const email = req.user.email;
        const user = await User.findOne({email});
        const projectId = req.params.id;
        const existingProj = await Project.findOne({_id:projectId});
        if(!existingProj) return res.status(400).json({message:"project dont exists"});
        if(!existingProj.owner.equals(user._id)) return res.status(400).json({message:"project dont exists under this user"});

        const newTask = new Task({
            title,
            description,
            project:existingProj._id
        })
        const savedTask = await newTask.save();
        return res.status(200).json({message:"task added successfully",savedTask});
    }
    catch(err){
        return res.status(400).json({message:"error occured while adding",err});
    }
});

router.get('/read/:id',authMiddleware,async (req,res)=>{
     try{
        const id = req.params.id;
        const email = req.user.email;  
        const user = await User.findOne({email});

        const existingTask = await Task.findById(id).populate("project");
        if(!existingTask) return res.status(400).json({message:"task dont exists"});

        if(!existingTask.project.owner.equals(user._id)) return res.status(400).json({message:"invalid user"});

        return res.status(200).json({
            message:"successfully read",
            title: existingTask.title,
            description: existingTask.description,
            status: existingTask.status,
            project: existingTask.project.owner
        });
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured while reading",err});
    }
})

router.patch("/update/:id",authMiddleware,schemaMiddleware(updateTaskSchema),async (req,res)=>{
    try{
        const {title,description} = req.body;
        const id = req.params.id;
        const email = req.user.email;  
        const user = await User.findOne({email});
        const existingTask = await Task.findById(id).populate("project");
        if(!existingTask) return res.status(400).json({message:"task dont exists"});

        if(!existingTask.project.owner.equals(user._id)) return res.status(400).json({message:"invalid user"});

        existingTask.title = title || existingTask.title;
        existingTask.description =  description || existingTask.description;
        const updatedTask = await existingTask.save();
        return res.status(200).json({
            message:"successfully updated",
            title: updatedTask.title,
            description: updatedTask.description,
            status: updatedTask.status,
            project: updatedTask.project.owner
        });
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured while updating",err});
    }    
    
})

router.get("/markCompleted/:id",authMiddleware,async (req,res)=>{
    try{    
        const id = req.params.id;
        const email = req.user.email;  
        const user = await User.findOne({email});
        const existingTask = await Task.findById(id).populate("project");
        if(!existingTask) return res.status(400).json({message:"task dont exists"});
        if(!existingTask.project.owner.equals(user._id)) return res.status(400).json({message:"invalid user"});
        await existingTask.markCompleted();
        return res.status(200).json({
            message:"successfully marked",
            title: existingTask.title,
            description: existingTask.description,
            status: existingTask.status,
            project: existingTask.project.owner
        });
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured",err})
    }
})

router.delete("/delete/:id",authMiddleware,async(req,res)=>{
    try{    
        const id = req.params.id;
        const email = req.user.email;  
        const user = await User.findOne({email});
        const existingTask = await Task.findById(id).populate("project");
        if(!existingTask) return res.status(400).json({message:"task dont exists"});
        if(!existingTask.project.owner.equals(user._id)) return res.status(400).json({message:"invalid user"});
        await existingTask.deleteOne();
        return res.status(200).json({
            message:"task deleted successfully",
        });
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured",err})
    }
})

export default router;