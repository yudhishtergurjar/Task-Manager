import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:3
    },
    description:{
        type:String,
        maxlength:500
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    }
},{timestamps: true});


projectSchema.virtual("tasks",{
  ref: "Task",
  localField: "_id",
  foreignField: "project"
});


const Project = mongoose.model("Project",projectSchema);

export default Project;
