import {useState,useEffect} from 'react'
import api from './api'

export default function App(){
const [form,setForm]=useState({
amount:'',
category:'Food',
description:'',
date:''
})
const [expenses,setExpenses]=useState([])
const [category,setCategory]=useState('All')
const [submitting,setSubmitting]=useState(false)

const fetchExpenses=async()=>{
const res=await api.get('/expenses',{
params:{category,sort:'date_desc'}
})
setExpenses(res.data)
}

useEffect(()=>{fetchExpenses()},[category])

const submit=async(e)=>{
e.preventDefault()
if(submitting) return
setSubmitting(true)
await api.post('/expenses',form)
setForm({
amount:'',
category:'Food',
description:'',
date:''
})
await fetchExpenses()
setSubmitting(false)
}

const total=expenses.reduce((a,b)=>a+Number(b.amount),0)

return (
<div style={{maxWidth:900,margin:'40px auto'}}>
<h1>Expense Tracker</h1>

<form onSubmit={submit}>
<input
placeholder='Amount'
value={form.amount}
onChange={e=>setForm({...form,amount:e.target.value})}
/>

<select
value={form.category}
onChange={e=>setForm({...form,category:e.target.value})}
>
<option>Food</option>
<option>Travel</option>
<option>Shopping</option>
<option>Bills</option>
</select>

<input
placeholder='Description'
value={form.description}
onChange={e=>setForm({...form,description:e.target.value})}
/>

<input
type='date'
value={form.date}
onChange={e=>setForm({...form,date:e.target.value})}
/>

<button disabled={submitting}>
{submitting?'Saving...':'Add Expense'}
</button>

</form>

<h3>Filter</h3>

<select
value={category}
onChange={e=>setCategory(e.target.value)}
>
<option>All</option>
<option>Food</option>
<option>Travel</option>
<option>Shopping</option>
<option>Bills</option>
</select>

<h2>Total: ₹{total.toFixed(2)}</h2>

<table border='1' cellPadding='10'>
<thead>
<tr>
<th>Date</th>
<th>Category</th>
<th>Description</th>
<th>Amount</th>
</tr>
</thead>

<tbody>
{expenses.map(e=>(
<tr key={e.id}>
<td>{new Date(e.date).toLocaleDateString()}</td>
<td>{e.category}</td>
<td>{e.description}</td>
<td>{e.amount}</td>
</tr>
))}
</tbody>
</table>

</div>
)
}
