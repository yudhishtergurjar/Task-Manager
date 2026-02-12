
import fs from "fs/promises";
import path from "path";
const counterPath = path.resolve("./Database/counter.json");

const filedata = await fs.readFile(counterPath, "utf-8");
const countObj = JSON.parse(filedata);

console.log(countObj.userCount);

export {countObj}
