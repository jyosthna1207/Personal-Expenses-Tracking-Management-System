const reportMonths=['January','February','March','April','May','June','July','August','September','October','November','December'];
let categoryChart;
document.addEventListener('DOMContentLoaded',()=>{
    const m=document.getElementById('reportMonth');if(!m)return;
    const now=new Date();m.innerHTML=reportMonths.map((x,i)=>`<option value="${i+1}" ${i===now.getMonth()?'selected':''}>${x}</option>`).join('');
    document.getElementById('reportYear').value=now.getFullYear();
    document.getElementById('loadReport').addEventListener('click',loadReport);loadReport();
});
async function loadReport(){
    try{
        const m=document.getElementById('reportMonth').value,y=document.getElementById('reportYear').value;
        const d=await api(`/reports/summary?month=${m}&year=${y}`);
        const income=Number(d.summary.income),expense=Number(d.summary.expense);
        document.getElementById('reportIncome').textContent=money(income);
        document.getElementById('reportExpense').textContent=money(expense);
        document.getElementById('reportSavings').textContent=money(income-expense);
        const labels=d.byCategory.map(x=>x.category_name||'Uncategorized'),values=d.byCategory.map(x=>Number(x.total));
        const ctx=document.getElementById('categoryChart');
        if(categoryChart)categoryChart.destroy();
        categoryChart=new Chart(ctx,{type:'doughnut',data:{labels,datasets:[{data:values,borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});
    }catch(e){console.error(e);}
}
