const STORAGE_KEY="expenseTrackerTransactions";
let transactions=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");

const form=document.querySelector("#transactionForm");
const description=document.querySelector("#description");
const amount=document.querySelector("#amount");
const type=document.querySelector("#type");
const category=document.querySelector("#category");
const filter=document.querySelector("#filter");
const transactionsEl=document.querySelector("#transactions");
const categoryBars=document.querySelector("#categoryBars");
const balanceEl=document.querySelector("#balance");
const incomeEl=document.querySelector("#income");
const expenseEl=document.querySelector("#expense");

const money=value=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(value);

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(transactions));}
function renderSummary(){
  const income=transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expense=transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  incomeEl.textContent=money(income); expenseEl.textContent=money(expense); balanceEl.textContent=money(income-expense);
}
function renderTransactions(){
  const list=filter.value==="all"?transactions:transactions.filter(t=>t.type===filter.value);
  transactionsEl.innerHTML="";
  if(!list.length){transactionsEl.innerHTML='<div class="empty">No transactions yet.</div>';return;}
  [...list].reverse().forEach(t=>{
    const row=document.createElement("div"); row.className="transaction";
    row.innerHTML='<div><strong></strong><div class="meta"></div></div><div><strong class="'+t.type+'"></strong> <button class="delete" type="button">Delete</button></div>';
    row.querySelector("div strong").textContent=t.description;
    row.querySelector(".meta").textContent=t.category+" • "+new Date(t.date).toLocaleString();
    row.querySelector("div:nth-child(2) strong").textContent=(t.type==="income"?"+":"-")+money(t.amount);
    row.querySelector(".delete").onclick=()=>{transactions=transactions.filter(x=>x.id!==t.id);save();render();};
    transactionsEl.appendChild(row);
  });
}
function renderCategories(){
  const totals={}; transactions.filter(t=>t.type==="expense").forEach(t=>totals[t.category]=(totals[t.category]||0)+t.amount);
  const max=Math.max(...Object.values(totals),0);
  categoryBars.innerHTML=Object.keys(totals).length?"":"<div class='empty'>No expense data yet.</div>";
  Object.entries(totals).sort((a,b)=>b[1]-a[1]).forEach(([name,value])=>{
    const row=document.createElement("div");row.className="bar-row";
    row.innerHTML='<div class="bar-label"><span></span><strong></strong></div><div class="bar-track"><div class="bar"></div></div>';
    row.querySelector("span").textContent=name;row.querySelector("strong").textContent=money(value);
    row.querySelector(".bar").style.width=(max?value/max*100:0)+"%";categoryBars.appendChild(row);
  });
}
function render(){renderSummary();renderTransactions();renderCategories();}
form.addEventListener("submit",e=>{e.preventDefault();transactions.push({id:Date.now(),description:description.value.trim(),amount:Number(amount.value),type:type.value,category:category.value,date:new Date().toISOString()});save();form.reset();render();});
filter.addEventListener("change",renderTransactions);
document.querySelector("#clearAll").addEventListener("click",()=>{if(confirm("Delete all transactions?")){transactions=[];save();render();}});
document.querySelector("#themeToggle").addEventListener("click",()=>{document.body.classList.toggle("dark");document.querySelector("#themeToggle").textContent=document.body.classList.contains("dark")?"☀️":"🌙";});
render();