import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());
const FILE = "./repairs.json";

function loadRepairs() {
  return fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : [];
}
function saveRepairs(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

app.use(express.static("public"));

app.get("/api/repairs", (req,res)=> res.json(loadRepairs()));

app.post("/api/repairs", (req,res)=>{
  const data = loadRepairs();
  data.push(req.body);
  saveRepairs(data);
  res.json({ok:true});
});

app.listen(3000, ()=> console.log("UrbanWheel en ligne sur http://localhost:3000"));
