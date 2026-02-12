import { count } from "console";
import fs from "fs/promises";
import path from "path";

const dbPath = path.resolve("./Database/db.json");
const counterPath = path.resolve("./Database/counter.json");

export async function read() {
    try {
        const filedata = await fs.readFile(dbPath, "utf-8");
        const parsed = JSON.parse(filedata);
        return parsed;
    }catch(err){
        return{
            users: {},
            projects: {},
            tasks: {}
        };
    }
}


export async function write(data){
    await fs.writeFile(dbPath,JSON.stringify(data,null,2));
}
async function getCnt(name){
    const filedata = await fs.readFile(counterPath, "utf-8");
    const countObj = JSON.parse(filedata);
    if(name == "project") return countObj.projectCount;
    if(name == "task") return countObj.taskCount;
}

export async function register(userData){

    const data = await read();
    const email = userData.email;

    data.users[email]=userData;
    await write(data);
}

export async function addProject(projectData){

    let data = await read();
    let projectCount = await getCnt("project");
    let taskCount = await getCnt("task");

    const email = projectData.parent;

    data.projects[++projectCount]=projectData;
    data.users[email].projects.push(projectCount);
    await write(data);
    const obj = {
        "projectCount":projectCount,
        "taskCount":taskCount
    }
    await fs.writeFile(counterPath, JSON.stringify(obj, null, 2));
}

export async function addTask(taskData) {
    let data = await read();
    let projectCount = await getCnt("project");
    let taskCount = await getCnt("task");
    const projectId = taskData.parentProject;

    data.tasks[++taskCount]=taskData;
    data.projects[projectId].task.push(taskCount);
    await write(data);
    const obj = {
        "projectCount":projectCount,
        "taskCount":taskCount
    }
    await fs.writeFile(counterPath, JSON.stringify(obj, null, 2));
}

export async function logout(email) {
    let data = await read();
    data.users[email].refreshToken=null;
    await write(data);
}

export async function changeRefreshToken(newToken, email) {
    let data = await read();
    data.users[email].refreshToken=newToken;
    await write(data);
}
