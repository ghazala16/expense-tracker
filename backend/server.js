const express=require('express');
const cors=require('cors');
const crypto=require('crypto');
const {PrismaClient}=require('@prisma/client');
const prisma=new PrismaClient();
const app=express();
app.use(cors());
app.use(express.json());

function key(body){
return crypto.createHash('sha256')
.update(JSON.stringify({
amount:body.amount,
category:body.category,
description:body.description,
date:body.date
})).digest('hex');
}

app.get('/',(req,res)=>res.send('Expense API running'));

app.post('/expenses', async(req,res)=>{
try{
const {amount,category,description,date}=req.body;
if(!amount || amount<=0) return res.status(400).json({error:'invalid amount'});
if(!date) return res.status(400).json({error:'date required'});
const idempotencyKey=key(req.body);

const existing=await prisma.expense.findUnique({
where:{idempotencyKey}
});

if(existing) return res.status(200).json(existing);

const expense=await prisma.expense.create({
data:{
amount:amount.toString(),
category,
description,
date:new Date(date),
idempotencyKey
}
});

res.status(201).json(expense);
}catch(e){
console.error(e);
res.status(500).json({error:'server error'});
}
});

app.get('/expenses', async(req,res)=>{
const {category}=req.query;
const where={};
if(category && category!=='All') where.category=category;
const expenses=await prisma.expense.findMany({
where,
orderBy:{date:'desc'}
});
res.json(expenses);
});

app.listen(5000,()=>console.log('running on 5000'));
