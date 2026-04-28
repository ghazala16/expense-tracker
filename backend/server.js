const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const db = new Database("expenses.db");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./expenses.db");

db.exec(`
CREATE TABLE IF NOT EXISTS expenses(
id TEXT PRIMARY KEY,
amount REAL,
category TEXT,
description TEXT,
date TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
idempotencyKey TEXT UNIQUE
)
`);

function key(body) {
    return crypto.createHash("sha256")
        .update(
            JSON.stringify({
                amount: body.amount,
                category: body.category,
                description: body.description,
                date: body.date
            })
        ).digest("hex");
}

app.get("/", (req, res) => {
    res.send("API Running");
});

app.post('/expenses',(req,res)=>{

const {amount,category,description,date}=req.body;

const idem=key(req.body);

const existing=db.prepare(
'SELECT * FROM expenses WHERE idempotencyKey=?'
).get(idem);

if(existing){
return res.json(existing);
}

db.prepare(`
INSERT INTO expenses
(id,amount,category,description,date,idempotencyKey)
VALUES(?,?,?,?,?,?)
`).run(
crypto.randomUUID(),
amount,
category,
description,
date,
idem
);

res.status(201).json({message:'created'});

});

app.get('/expenses',(req,res)=>{

let rows;

if(req.query.category && req.query.category!=='All'){
rows=db.prepare(
'SELECT * FROM expenses WHERE category=? ORDER BY date DESC'
).all(req.query.category);
}
else{
rows=db.prepare(
'SELECT * FROM expenses ORDER BY date DESC'
).all();
}

res.json(rows);

});

app.listen(process.env.PORT || 5000)