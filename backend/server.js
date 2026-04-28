const express=require("express");
const cors=require("cors");
const sqlite3=require("sqlite3").verbose();
const crypto=require("crypto");

const app=express();

app.use(cors());
app.use(express.json());

const db=new sqlite3.Database("./expenses.db");

db.serialize(()=>{
db.run(`
CREATE TABLE IF NOT EXISTS expenses(
id TEXT PRIMARY KEY,
amount REAL,
category TEXT,
description TEXT,
date TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
idempotencyKey TEXT UNIQUE
)
`)
});

function key(body){
return crypto.createHash("sha256")
.update(
JSON.stringify({
amount:body.amount,
category:body.category,
description:body.description,
date:body.date
})
).digest("hex");
}

app.get("/",(req,res)=>{
res.send("API Running");
});

app.post("/expenses",(req,res)=>{

const {amount,category,description,date}=req.body;

if(!amount || amount<=0)
 return res.status(400).json({error:"invalid amount"});

const idem=key(req.body);

db.get(
"SELECT * FROM expenses WHERE idempotencyKey=?",
[idem],
(err,row)=>{

if(row){
return res.json(row);
}

db.run(
`INSERT INTO expenses
(id,amount,category,description,date,idempotencyKey)
VALUES(?,?,?,?,?,?)`,
[
crypto.randomUUID(),
amount,
category,
description,
date,
idem
],
function(err){
if(err) return res.status(500).json(err);

res.status(201).json({
message:"created"
});
}
)

}
)

});

app.get("/expenses",(req,res)=>{

let sql="SELECT * FROM expenses";
let params=[];

if(req.query.category && req.query.category!=="All"){
sql+=" WHERE category=?";
params.push(req.query.category);
}

sql+=" ORDER BY date DESC";

db.all(sql,params,(err,rows)=>{
if(err) return res.status(500).json(err);
res.json(rows);
})

})

app.listen(process.env.PORT||5000)