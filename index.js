// Build Task Management API: Users, Projects, Tasks CRUD endpoints.
// Implement Joi validation for all inputs. Add pagination, sorting, filtering, error handling
// REST API with Validation



 
import express from "express";
import userRoute from "./Router/userRoute.js";
import projectRoute from "./Router/ProjectRoute.js";
import taskRoute from "./Router/taskRoute.js";



const app = express();
app.use(express.json());

 
app.use('/auth',userRoute);
app.use('/projects',projectRoute);
app.use('/tasks',taskRoute);




app.listen(3001,()=>{
    console.log("server is listening")
})