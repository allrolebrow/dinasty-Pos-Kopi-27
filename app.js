// =============================================
//  DYNASTY POS KOPI 27 - MAIN APPLICATION
// =============================================

const MENU_DATA = [
  {id:'hc1',name:'Kopi Hitam Story',price:5500,cost:2500,category:'hot-coffee',emoji:'☕'},
  {id:'hc2',name:'Kopi Aren Story',price:6500,cost:3000,category:'hot-coffee',emoji:'🍯'},
  {id:'hc3',name:'Kopi Jahe Bara',price:6500,cost:3000,category:'hot-coffee',emoji:'🫚'},
  {id:'hc4',name:'Kopi Honey Story',price:7500,cost:3500,category:'hot-coffee',emoji:'🍋'},
  {id:'hc5',name:'Hot Renceng',price:4500,cost:2000,category:'hot-coffee',emoji:'🔥'},
  {id:'hc6',name:'Wedang Jahe',price:5500,cost:2000,category:'hot-coffee',emoji:'🌿'},
  {id:'hc7',name:'Wedang Rempah',price:7500,cost:3000,category:'hot-coffee',emoji:'🌺'},
  {id:'hc8',name:'Teh Hangat',price:4000,cost:1500,category:'hot-coffee',emoji:'🍵'},
  {id:'hc9',name:'Jeruk Hangat',price:6000,cost:2500,category:'hot-coffee',emoji:'🍊'},
  {id:'cc1',name:'Es Kopi Regal',price:11000,cost:5000,category:'cool-coffee',emoji:'🍪'},
  {id:'cc2',name:'Es Kopi Creamy',price:8500,cost:4000,category:'cool-coffee',emoji:'🧊'},
  {id:'cc3',name:'Es Kopi Renceng',price:6000,cost:2500,category:'cool-coffee',emoji:'❄️'},
  {id:'cc4',name:'Es Teh',price:5000,cost:1500,category:'cool-coffee',emoji:'🧋'},
  {id:'cc5',name:'Es Jeruk',price:6500,cost:2500,category:'cool-coffee',emoji:'🍹'},
  {id:'mk1',name:'Mie Ribut',price:12500,cost:6000,category:'makanan',emoji:'🍜'},
  {id:'mk2',name:'Seblak 27',price:12000,cost:5500,category:'makanan',emoji:'🌶️'},
  {id:'st1',name:'Sate Kepala',price:4500,cost:2000,category:'sate',emoji:'🍢'},
  {id:'st2',name:'Sate Kulit',price:4500,cost:2000,category:'sate',emoji:'🍢'},
  {id:'st3',name:'Sate Usus',price:4500,cost:2000,category:'sate',emoji:'🍢'},
  {id:'st4',name:'Sate Telor',price:5500,cost:2500,category:'sate',emoji:'🥚'},
  {id:'st5',name:'Sate Rempeloati',price:5500,cost:2500,category:'sate',emoji:'🍢'},
  {id:'st6',name:'Sate Tahu/Tempe',price:3000,cost:1200,category:'sate',emoji:'🫘'},
  {id:'cm1',name:'Choco Melt Toast',price:15000,cost:7000,category:'cemilan',emoji:'🍫'},
  {id:'cm2',name:'Cheese Melt Toast',price:15000,cost:7000,category:'cemilan',emoji:'🧀'},
  {id:'cm3',name:'Dynasty Golden Fries',price:15000,cost:6000,category:'cemilan',emoji:'🍟'},
  {id:'cm4',name:'Royal Cireng',price:15000,cost:6000,category:'cemilan',emoji:'👑'},
  {id:'bk1',name:'Usus Crispy',price:2500,cost:1000,category:'bungkus',emoji:'📦'},
  {id:'bk2',name:'Krupuk Mlinjo',price:2500,cost:800,category:'bungkus',emoji:'🥨'},
];

let state = {
  order:[],
  payMethod:'cash',
  transactions:[],
  config:{scriptUrl:'',kasirName:'Kasir 1'},
  stocks:{},
  currentCategory:'all'
};

document.addEventListener('DOMContentLoaded',()=>{
  loadFromStorage();
  updateDateDisplay();
  renderMenu();
  renderOrder();
  initDashDate();
  initMobileTabs();
  setInterval(updateDateDisplay,60000);
});

function loadFromStorage(){
  try{
    const cfg=JSON.parse(localStorage.getItem('dynasty_config')||'{}');
    if(cfg.scriptUrl)state.config.scriptUrl=cfg.scriptUrl;
    if(cfg.kasirName)state.config.kasirName=cfg.kasirName;
    const stocks=JSON.parse(localStorage.getItem('dynasty_stocks')||'{}');
    MENU_DATA.forEach(item=>{if(stocks[item.id]===undefined)stocks[item.id]=99;});
    state.stocks=stocks;
    const txns=JSON.parse(localStorage.getItem('dynasty_transactions')||'[]');
    state.transactions=txns;
    if(state.config.scriptUrl||localStorage.getItem('dynasty_setup_done')){
      document.getElementById('setupModal').classList.remove('active');
      document.getElementById('kasirDisplay').textContent=state.config.kasirName;
    }
  }catch(e){console.error(e);}
}

function saveToStorage(){
  try{
    localStorage.setItem('dynasty_config',JSON.stringify(state.config));
    localStorage.setItem('dynasty_stocks',JSON.stringify(state.stocks));
    localStorage.setItem('dynasty_transactions',JSON.stringify(state.transactions.slice(-500)));
  }catch(e){}
}

function updateDateDisplay(){
  const now=new Date();
  document.getElementById('dateDisplay').textContent=now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}

function saveSetup(){
  const url=document.getElementById('scriptUrl').value.trim();
  const name=document.getElementById('kasirName').value.trim()||'Kasir 1';
  state.config.scriptUrl=url;state.config.kasirName=name;
  saveToStorage();localStorage.setItem('dynasty_setup_done','1');
  document.getElementById('kasirDisplay').textContent=name;
  document.getElementById('setupModal').classList.remove('active');
  showToast('✅ Setup berhasil disimpan!','success');
}

function skipSetup(){
  const name=document.getElementById('kasirName').value.trim()||'Kasir 1';
  state.config.kasirName=name;
  document.getElementById('kasirDisplay').textContent=name;
  localStorage.setItem('dynasty_setup_done','1');
  document.getElementById('setupModal').classList.remove('active');
}

function openSetup(){
  document.getElementById('scriptUrl').value=state.config.scriptUrl||'';
  document.getElementById('kasirName').value=state.config.kasirName||'';
  document.getElementById('setupModal').classList.add('active');
}

function filterCategory(cat,btn){
  state.currentCategory=cat;
  document.querySelectorAll('.cat-tab').forEach(t=>t.classList.remove('active'));
  if(btn)btn.classList.add('active');
  renderMenu();
}

function renderMenu(){
  const grid=document.getElementById('menuGrid');
  const items=state.currentCategory==='all'?MENU_DATA:MENU_DATA.filter(i=>i.category===state.currentCategory);
  grid.innerHTML=items.map(item=>{
    const stock=state.stocks[item.id]??99;
    const out=stock<=0;
    const low=stock>0&&stock<=5;
    const stockClass=out?'':(low?'low':'ok');
    const stockText=stock>=99?'∞':stock;
    return `<div class="menu-card ${out?'out-of-stock':''}" onclick="addToOrder('${item.id}')">
      ${out?'<span class="out-of-stock-badge">Habis</span>':''}
      <span class="menu-card-stock ${stockClass}">Stok:${stockText}</span>
      <div class="menu-card-emoji">${item.emoji}</div>
      <div class="menu-card-name">${item.name}</div>
      <div class="menu-card-price">${formatRp(item.price)}</div>
    </div>`;
  }).join('');
}

function addToOrder(itemId){
  const item=MENU_DATA.find(i=>i.id===itemId);
  if(!item)return;
  const stock=state.stocks[item.id]??99;
  const existingQty=state.order.find(o=>o.id===itemId)?.qty||0;
  if(stock<99&&existingQty>=stock){showToast(`⚠️ Stok ${item.name} tidak cukup!`,'error');return;}
  const existing=state.order.find(o=>o.id===itemId);
  if(existing){existing.qty++;}else{state.order.push({...item,qty:1});}
  renderOrder();updateTotal();updateMobileBadge();
  // mobile: show order count feedback
  if(window.innerWidth<=768){
    const tabOrder=document.getElementById('tabOrder');
    tabOrder.style.color='var(--gold-bright)';
    setTimeout(()=>{
      if(!tabOrder.classList.contains('active'))tabOrder.style.color='';
    },400);
  }
}

function updateQty(itemId,delta){
  const idx=state.order.findIndex(o=>o.id===itemId);
  if(idx===-1)return;
  state.order[idx].qty+=delta;
  if(state.order[idx].qty<=0)state.order.splice(idx,1);
  renderOrder();updateTotal();updateMobileBadge();
}

function removeItem(itemId){
  state.order=state.order.filter(o=>o.id!==itemId);
  renderOrder();updateTotal();updateMobileBadge();
}

function clearOrder(){
  if(state.order.length===0)return;
  if(!confirm('Hapus semua pesanan?'))return;
  state.order=[];
  document.getElementById('discountInput').value='';
  document.getElementById('cashInput').value='';
  renderOrder();updateTotal();updateMobileBadge();
}

function renderOrder(){
  const container=document.getElementById('orderItems');
  if(state.order.length===0){
    container.innerHTML=`<div class="empty-order"><div class="empty-icon">☕</div><p>Belum ada pesanan</p><small>Pilih menu di sebelah kiri</small></div>`;
    const badge=document.getElementById('orderBadge');
    if(badge){badge.style.display='none';}
    return;
  }
  const total=state.order.reduce((s,i)=>s+i.qty,0);
  const badge=document.getElementById('orderBadge');
  if(badge){badge.textContent=total;badge.style.display='flex';}
  container.innerHTML=state.order.map(item=>`
    <div class="order-item">
      <div class="order-item-info">
        <div class="order-item-name">${item.emoji} ${item.name}</div>
        <div class="order-item-price">${formatRp(item.price)} / pcs</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="updateQty('${item.id}',-1)">−</button>
        <span class="qty-display">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty('${item.id}',1)">+</button>
      </div>
      <div class="item-total">${formatRp(item.price*item.qty)}</div>
      <button class="btn-remove" onclick="removeItem('${item.id}')">✕</button>
    </div>`).join('');
}

function updateMobileBadge(){
  const badge=document.getElementById('mobileOrderBadge');
  if(!badge)return;
  const count=state.order.reduce((s,i)=>s+i.qty,0);
  if(count>0){badge.textContent=count;badge.style.display='flex';}
  else{badge.style.display='none';}
}

function updateTotal(){
  const subtotal=state.order.reduce((s,i)=>s+i.price*i.qty,0);
  const discount=parseFloat(document.getElementById('discountInput').value)||0;
  const total=Math.round(subtotal*(1-discount/100));
  document.getElementById('subtotalDisplay').textContent=formatRp(subtotal);
  document.getElementById('totalDisplay').textContent=formatRp(total);
  calcChange();
}

function calcChange(){
  const total=getTotal();
  const cash=parseFloat(document.getElementById('cashInput').value)||0;
  const change=cash-total;
  const el=document.getElementById('changeDisplay');
  el.textContent=change>=0?formatRp(change):formatRp(0);
  el.style.color=change>=0?'var(--green)':'var(--red)';
}

function getSubtotal(){return state.order.reduce((s,i)=>s+i.price*i.qty,0);}
function getTotal(){
  const subtotal=getSubtotal();
  const discount=parseFloat(document.getElementById('discountInput').value)||0;
  return Math.round(subtotal*(1-discount/100));
}

function setPayMethod(method,btn){
  state.payMethod=method;
  document.querySelectorAll('.pay-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('cashSection').style.display=method==='cash'?'block':'none';
}

function checkout(){
  if(state.order.length===0){showToast('⚠️ Tambahkan pesanan dulu!','error');return;}
  const total=getTotal();
  const cash=parseFloat(document.getElementById('cashInput').value)||0;
  if(state.payMethod==='cash'&&cash<total){showToast('⚠️ Uang diterima kurang!','error');return;}
  const now=new Date();
  const trxId='TRX'+now.getTime().toString().slice(-8);
  const subtotal=getSubtotal();
  const discount=parseFloat(document.getElementById('discountInput').value)||0;
  const change=state.payMethod==='cash'?Math.max(0,cash-total):0;
  const note=document.getElementById('orderNote').value.trim();
  const totalCost=state.order.reduce((s,i)=>s+(i.cost||0)*i.qty,0);
  const trx={
    id:trxId,date:formatDate(now),time:formatTime(now),kasir:state.config.kasirName,
    items:state.order.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price,cost:i.cost||0,subtotal:i.price*i.qty})),
    subtotal,discount,total,cost:totalCost,profit:total-totalCost,
    payMethod:state.payMethod,cash:state.payMethod==='cash'?cash:0,change,note,synced:false
  };
  state.order.forEach(item=>{
    if((state.stocks[item.id]??99)<99)state.stocks[item.id]=Math.max(0,(state.stocks[item.id]||0)-item.qty);
  });
  state.transactions.push(trx);saveToStorage();renderMenu();
  syncToSheets(trx);showReceipt(trx);
  state.order=[];
  document.getElementById('discountInput').value='';
  document.getElementById('cashInput').value='';
  document.getElementById('orderNote').value='';
  renderOrder();updateTotal();updateMobileBadge();
}

function showReceipt(trx){
  let content=`
<div style="text-align:center;font-weight:bold;font-size:13px;margin-bottom:4px;">★ DYNASTY POS KOPI 27 ★</div>
<div style="text-align:center;font-size:10px;color:#555;margin-bottom:2px;">Dari Ngopi Jadi Story</div>
<div style="text-align:center;font-size:10px;color:#555;margin-bottom:8px;">WA: 0813 3003 0411</div>
<div style="border-top:1px dashed #ccc;margin-bottom:6px;"></div>
<div style="font-size:10px;color:#555;display:flex;justify-content:space-between;margin-bottom:2px;"><span>No: ${trx.id}</span><span>${trx.date}</span></div>
<div style="font-size:10px;color:#555;display:flex;justify-content:space-between;margin-bottom:8px;"><span>Kasir: ${trx.kasir}</span><span>${trx.time}</span></div>
<div style="border-top:1px dashed #ccc;margin-bottom:8px;"></div>`;
  trx.items.forEach(item=>{
    content+=`<div style="margin-bottom:4px;"><div style="font-weight:600;font-size:11px;">${item.name}</div><div style="display:flex;justify-content:space-between;font-size:10px;color:#333;"><span>${item.qty} x ${formatRp(item.price)}</span><span>${formatRp(item.subtotal)}</span></div></div>`;
  });
  content+=`<div style="border-top:1px dashed #ccc;margin:8px 0;"></div>`;
  if(trx.discount>0){
    content+=`<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px;"><span>Subtotal</span><span>${formatRp(trx.subtotal)}</span></div>
<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px;color:#cc3333;"><span>Diskon ${trx.discount}%</span><span>-${formatRp(trx.subtotal-trx.total)}</span></div>`;
  }
  content+=`<div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;margin-bottom:6px;"><span>TOTAL</span><span>${formatRp(trx.total)}</span></div>`;
  if(trx.payMethod==='cash'){
    content+=`<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px;"><span>Bayar (Cash)</span><span>${formatRp(trx.cash)}</span></div>
<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px;"><span>Kembalian</span><span>${formatRp(trx.change)}</span></div>`;
  }else{
    content+=`<div style="font-size:10px;margin-bottom:4px;">Bayar via: ${trx.payMethod.toUpperCase()}</div>`;
  }
  if(trx.note)content+=`<div style="font-size:10px;color:#555;margin-bottom:4px;">Catatan: ${trx.note}</div>`;
  content+=`<div style="border-top:1px dashed #ccc;margin:8px 0;"></div><div style="text-align:center;font-size:10px;color:#555;">Terima kasih sudah ngopi! ☕<br>Sampai jumpa lagi ya 😊</div>`;
  document.getElementById('receiptContent').innerHTML=content;
  document.getElementById('receiptModal').classList.add('active');
}

function printReceipt(){
  const content=document.getElementById('receiptContent').innerHTML;
  const isMobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const printHTML=`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Struk Dynasty</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;background:white;color:black;padding:10px}@media print{button{display:none!important}body{padding:2px}}.wrap{max-width:300px;margin:0 auto}.btn-print{display:block;width:100%;margin-top:12px;padding:12px;background:#D4A017;color:black;border:none;font-size:14px;font-weight:bold;border-radius:8px;cursor:pointer}.btn-close{display:block;width:100%;margin-top:6px;padding:10px;background:#444;color:white;border:none;font-size:13px;border-radius:8px;cursor:pointer}</style></head><body><div class="wrap">${content}</div>${isMobile?'<button class="btn-print" onclick="window.print()">🖨️ PRINT STRUK</button><button class="btn-close" onclick="window.close()">✕ Tutup</button>':''}</body></html>`;
  
  if(isMobile){
    const w=window.open('','_blank','width=400,height=700');
    if(w){w.document.write(printHTML);w.document.close();setTimeout(()=>{w.print();},600);}
    else{showToast('⚠️ Izinkan popup di browser untuk print!','error');}
  }else{
    const printArea=document.getElementById('printArea');
    printArea.style.display='block';
    printArea.innerHTML=`<div style="font-family:'Courier New',monospace;font-size:12px;max-width:300px;margin:0 auto;padding:10px;background:white;color:black;">${content}</div>`;
    window.print();
    setTimeout(()=>{printArea.style.display='none';},1000);
  }
}

function closeReceipt(){
  document.getElementById('receiptModal').classList.remove('active');
  showToast('✅ Transaksi selesai!','success');
}

async function syncToSheets(trx){
  if(!state.config.scriptUrl)return;
  try{
    const payload={action:'addTransaction',data:{
      id:trx.id,date:trx.date,time:trx.time,kasir:trx.kasir,
      items:trx.items.map(i=>`${i.name}(${i.qty})`).join(', '),
      itemCount:trx.items.reduce((s,i)=>s+i.qty,0),
      subtotal:trx.subtotal,discount:trx.discount,total:trx.total,
      cost:trx.cost,profit:trx.profit,payMethod:trx.payMethod,
      note:trx.note||'',details:JSON.stringify(trx.items)
    }};
    await fetch(state.config.scriptUrl,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const t=state.transactions.find(t=>t.id===trx.id);
    if(t){t.synced=true;saveToStorage();}
    showToast('☁️ Data tersimpan ke Google Sheets','success');
  }catch(err){
    showToast('⚠️ Gagal sync. Data tersimpan lokal.','info');
  }
}

function initDashDate(){
  const now=new Date();
  const y=now.getFullYear(),m=String(now.getMonth()+1).padStart(2,'0'),d=String(now.getDate()).padStart(2,'0');
  document.getElementById('dashDate').value=`${y}-${m}-${d}`;
}

function openDashboard(){document.getElementById('dashboardModal').classList.add('active');loadDashboard();}
function closeDashboard(){document.getElementById('dashboardModal').classList.remove('active');}

function loadDashboard(){
  const dateInput=document.getElementById('dashDate').value;
  const [y,m,d]=dateInput.split('-');
  const dateStr=`${d}/${m}/${y}`;
  const dayTrx=state.transactions.filter(t=>t.date===dateStr);
  const omset=dayTrx.reduce((s,t)=>s+t.total,0);
  const profit=dayTrx.reduce((s,t)=>s+t.profit,0);
  const itemsSold=dayTrx.reduce((s,t)=>s+t.items.reduce((si,i)=>si+i.qty,0),0);
  document.getElementById('dashOmset').textContent=formatRp(omset);
  document.getElementById('dashProfit').textContent=formatRp(profit);
  document.getElementById('dashTrx').textContent=dayTrx.length;
  document.getElementById('dashItems').textContent=itemsSold;
  const itemMap={};
  dayTrx.forEach(t=>t.items.forEach(i=>{
    if(!itemMap[i.name])itemMap[i.name]={qty:0,revenue:0};
    itemMap[i.name].qty+=i.qty;itemMap[i.name].revenue+=i.subtotal;
  }));
  const topItems=Object.entries(itemMap).sort((a,b)=>b[1].qty-a[1].qty).slice(0,8);
  const topEl=document.getElementById('topItemsList');
  topEl.innerHTML=topItems.length===0
    ?'<div style="color:var(--white-muted);font-size:0.8rem;padding:10px 0;">Belum ada transaksi hari ini</div>'
    :topItems.map(([name,data],idx)=>`<div class="top-item-row"><span class="top-item-name">${idx+1}. ${name}</span><div style="display:flex;gap:12px;align-items:center;"><span class="top-item-qty">${data.qty} pcs</span><span style="color:var(--white-muted);font-size:0.72rem;">${formatRp(data.revenue)}</span></div></div>`).join('');
  const recentEl=document.getElementById('recentTrxList');
  const recent=[...dayTrx].reverse().slice(0,10);
  recentEl.innerHTML=recent.length===0
    ?'<div style="color:var(--white-muted);font-size:0.8rem;padding:10px 0;">Belum ada transaksi</div>'
    :recent.map(t=>`<div class="trx-row"><div><div class="trx-id">${t.id}</div><div style="font-size:0.68rem;color:var(--white-muted)">${t.time} · ${t.kasir}</div><div style="font-size:0.68rem;color:var(--white-muted)">${t.items.map(i=>`${i.name}(${i.qty})`).join(', ')}</div></div><div style="text-align:right;"><div class="trx-amount">${formatRp(t.total)}</div><div style="font-size:0.65rem;color:var(--white-muted)">${t.payMethod.toUpperCase()}</div><div style="font-size:0.62rem;color:${t.synced?'var(--green)':'var(--white-muted)'}">${t.synced?'☁️ Synced':'💾 Lokal'}</div></div></div>`).join('');
  const unsynced=state.transactions.filter(t=>!t.synced).length;
  document.getElementById('syncStatus').textContent=unsynced>0?`⚠️ ${unsynced} transaksi belum tersync`:state.config.scriptUrl?'✅ Semua transaksi tersync':'⚙️ Google Sheets belum dikonfigurasi';
}

function openStockModal(){renderStockList();document.getElementById('stockModal').classList.add('active');}
function closeStockModal(){document.getElementById('stockModal').classList.remove('active');}

function renderStockList(){
  const search=document.getElementById('stockSearch').value.toLowerCase();
  const items=MENU_DATA.filter(i=>!search||i.name.toLowerCase().includes(search));
  const catLabels={'hot-coffee':'Hot Coffee','cool-coffee':'Cool Coffee','makanan':'Makanan','sate':'Sate','cemilan':'Cemilan','bungkus':'Bungkus'};
  document.getElementById('stockTableBody').innerHTML=items.map(item=>{
    const stock=state.stocks[item.id]??99;
    const displayStock=stock>=99?'':stock;
    return `<tr><td>${item.emoji} ${item.name}<span class="stock-cat-badge">${catLabels[item.category]||item.category}</span></td>
<td><input type="number" class="stock-input" id="price_${item.id}" value="${item.price}" min="0"></td>
<td><input type="number" class="stock-input" id="cost_${item.id}" value="${item.cost}" min="0"></td>
<td><input type="number" class="stock-input" id="stock_${item.id}" value="${displayStock}" min="0" placeholder="∞"></td>
<td><button class="btn-gold" style="padding:4px 8px;font-size:0.7rem;" onclick="saveOneStock('${item.id}')">Simpan</button></td></tr>`;
  }).join('');
}

function saveOneStock(itemId){
  const item=MENU_DATA.find(i=>i.id===itemId);
  if(!item)return;
  const p=document.getElementById(`price_${itemId}`);
  const c=document.getElementById(`cost_${itemId}`);
  const s=document.getElementById(`stock_${itemId}`);
  if(p)item.price=parseInt(p.value)||item.price;
  if(c)item.cost=parseInt(c.value)||item.cost;
  const sv=s?s.value.trim():'';
  state.stocks[itemId]=sv===''?99:Math.max(0,parseInt(sv)||0);
  saveToStorage();renderMenu();
  showToast(`✅ ${item.name} disimpan`,'success');
}

function saveAllStock(){
  MENU_DATA.forEach(item=>{
    const p=document.getElementById(`price_${item.id}`);
    const c=document.getElementById(`cost_${item.id}`);
    const s=document.getElementById(`stock_${item.id}`);
    if(p)item.price=parseInt(p.value)||item.price;
    if(c)item.cost=parseInt(c.value)||item.cost;
    if(s){const sv=s.value.trim();state.stocks[item.id]=sv===''?99:Math.max(0,parseInt(sv)||0);}
  });
  saveToStorage();renderMenu();closeStockModal();
  showToast('✅ Semua stok & harga disimpan!','success');
}

// MOBILE TABS
function initMobileTabs(){
  if(window.innerWidth<=768){
    document.getElementById('sidebarPanel').classList.add('mobile-active');
    document.getElementById('orderPanel').classList.remove('mobile-active');
  }
}

function switchMobileTab(tab){
  const sidebar=document.getElementById('sidebarPanel');
  const order=document.getElementById('orderPanel');
  const tabMenu=document.getElementById('tabMenu');
  const tabOrder=document.getElementById('tabOrder');
  document.querySelectorAll('.mobile-tab-btn').forEach(b=>b.classList.remove('active'));
  if(tab==='menu'){
    sidebar.classList.add('mobile-active');order.classList.remove('mobile-active');
    tabMenu.classList.add('active');
  }else{
    order.classList.add('mobile-active');sidebar.classList.remove('mobile-active');
    tabOrder.classList.add('active');
  }
}

window.addEventListener('resize',()=>{
  if(window.innerWidth>768){
    document.getElementById('sidebarPanel').classList.remove('mobile-active');
    document.getElementById('orderPanel').classList.remove('mobile-active');
  }else{initMobileTabs();}
});

function formatRp(amount){return'Rp '+amount.toLocaleString('id-ID');}
function formatDate(date){const d=String(date.getDate()).padStart(2,'0'),m=String(date.getMonth()+1).padStart(2,'0'),y=date.getFullYear();return`${d}/${m}/${y}`;}
function formatTime(date){const h=String(date.getHours()).padStart(2,'0'),m=String(date.getMinutes()).padStart(2,'0');return`${h}:${m}`;}

function showToast(msg,type='info'){
  const toast=document.createElement('div');
  toast.className=`toast ${type}`;toast.innerHTML=msg;
  document.body.appendChild(toast);
  setTimeout(()=>{toast.style.animation='toastOut 0.3s ease forwards';setTimeout(()=>toast.remove(),300);},3000);
}

document.querySelectorAll('.modal-overlay').forEach(modal=>{
  modal.addEventListener('click',e=>{
    if(e.target===modal&&modal.id!=='setupModal')modal.classList.remove('active');
  });
});
