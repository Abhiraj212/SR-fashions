import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.2/+esm";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
const $ = (s, root=document) => root.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n||0));
let currentUser=null, profile=null, page="dashboard", cache={customers:[],orders:[],payments:[],expenses:[],measurements:[],staff:[]};

function toast(message){const el=document.createElement("div");el.className="toast";el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),3000);}
function loginView(message=""){
  $("#app").innerHTML=`<div class="auth-wrap"><form class="auth-card" id="loginForm">
    <div class="brand-mark">SR</div><h1>SR Fashions Studio</h1><p class="sub">Seema Boutique · Secure staff workspace</p>
    <div class="field"><label>Email address</label><input name="email" type="email" autocomplete="username" required placeholder="you@example.com"></div>
    <div class="field"><label>Password</label><input name="password" type="password" autocomplete="current-password" required placeholder="Your password"></div>
    <p class="error" id="loginError">${esc(message)}</p><button class="btn full" type="submit">Sign in securely</button>
    <p class="sub" style="margin-top:16px;text-align:center">Accounts are created by the business owner. Public sign-up is disabled in this app.</p>
  </form></div>`;
  $("#loginForm").addEventListener("submit", async e=>{
    e.preventDefault(); const fd=new FormData(e.currentTarget);
    const {error}=await supabase.auth.signInWithPassword({email:fd.get("email"),password:fd.get("password")});
    if(error) $("#loginError").textContent=error.message;
    else await boot();
  });
}
const navItems=[["dashboard","▦","Overview"],["customers","♙","Customers"],["measurements","⌁","Measurements"],["orders","▤","Orders"],["payments","₹","Payments"],["staff","♧","Staff"],["expenses","＋","Expenses"],["settings","⚙","Settings"]];
function navMarkup(mobile=false){return navItems.filter(([id])=>profile?.role!=="staff" || !["payments","expenses","staff","settings"].includes(id)).map(([id,icon,label])=>`<button class="nav-btn ${page===id?"active":""}" data-page="${id}"><span>${icon}</span><span>${label}</span></button>`).join("");}
function shell(){
  $("#app").innerHTML=`<div class="shell"><header class="topbar"><div class="brand"><div class="brand-icon">SR</div><div>SR FASHIONS<small>SEEMA BOUTIQUE · STUDIO</small></div></div><div class="top-actions"><span class="user-label">${esc(profile.display_name||currentUser.email)} · ${esc(profile.role)}</span><button class="btn light" id="logoutBtn">Sign out</button></div></header>
  <div class="layout"><aside class="sidebar"><div class="nav-label">WORKSPACE</div>${navMarkup()}</aside><main class="main" id="main"></main></div><nav class="mobile-nav">${navMarkup(true)}</nav></div>`;
  document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>{page=b.dataset.page;renderPage();document.querySelectorAll("[data-page]").forEach(x=>x.classList.toggle("active",x.dataset.page===page));}));
  $("#logoutBtn").addEventListener("click",async()=>{await supabase.auth.signOut();currentUser=null;profile=null;loginView();});
}
function head(title,sub,action=""){return `<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div>${action}</div>`;}
function stat(label,value,hint=""){return `<div class="stat"><div class="k">${label}</div><div class="v">${value}</div><div class="hint">${hint}</div></div>`;}
function table(headers,rows,empty="No records yet"){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows||""}</tbody></table>${rows?"":`<div class="empty">${empty}</div>`}</div>`;}
async function loadData(){
  const jobs=[
    supabase.from("customers").select("*").order("created_at",{ascending:false}).limit(200),
    supabase.from("orders").select("*").order("created_at",{ascending:false}).limit(200),
    supabase.from("measurements").select("*").order("created_at",{ascending:false}).limit(200)
  ];
  if(profile.role!=="staff") jobs.push(
    supabase.from("payments").select("*").order("paid_at",{ascending:false}).limit(200),
    supabase.from("expenses").select("*").order("expense_date",{ascending:false}).limit(200),
    supabase.from("profiles").select("id,display_name,phone,role,active,created_at").in("role",["staff","admin","owner"]).order("created_at")
  );
  const r=await Promise.all(jobs);
  for(const x of r){if(x.error) throw x.error;}
  cache.customers=r[0].data||[];cache.orders=r[1].data||[];cache.measurements=r[2].data||[];
  cache.payments=profile.role==="staff"?[]:(r[3].data||[]);
  cache.expenses=profile.role==="staff"?[]:(r[4].data||[]);
  cache.staff=profile.role==="staff"?[]:(r[5].data||[]);
}
async function renderPage(){
  const main=$("#main"); if(!main)return;
  main.innerHTML='<div class="loading">Loading records…</div>';
  try{await loadData();}catch(e){main.innerHTML=`<div class="notice">Could not load records: ${esc(e.message)}. Check the account role and database access.</div>`;return;}
  const admin=profile.role==="owner"||profile.role==="admin";
  if(page==="dashboard"){
    const pending=cache.orders.filter(o=>!["delivered","cancelled"].includes(o.status)).length;
    const collected=cache.payments.reduce((a,p)=>a+Number(p.amount),0);
    main.innerHTML=head("Good day, "+esc(profile.display_name||"there")+" 👋","Here’s what’s happening at your boutique today.")
    +`<section class="stats">${stat("Customers",cache.customers.length,"Saved customer profiles")}${stat("Total orders",cache.orders.length,"All recorded orders")}${stat("In progress",pending,"Not yet delivered")}${stat(admin?"Payments received":"Your access",""+(admin?money(collected):"Staff"),admin?"Total recorded collections":"Staff workspace")}</section>
    <section class="panel"><h2>Recent orders</h2>${table(["Order","Customer","Due date","Status","Amount"],cache.orders.slice(0,7).map(o=>`<tr><td><b>${esc(o.order_number)}</b></td><td>${esc(cache.customers.find(c=>c.id===o.customer_id)?.full_name||"Customer")}</td><td>${esc(o.due_date||"—")}</td><td><span class="pill ${esc(o.status)}">${esc(o.status)}</span></td><td>${money(o.total_amount)}</td></tr>`).join(""))}</section>`;
  } else if(page==="customers"){
    main.innerHTML=head("Customers","Customer directory and phone lookup.",admin?'<button class="btn" id="addCustomer">＋ Add customer</button>':"")
    +'<div class="toolbar"><input id="customerSearch" placeholder="Search name or phone…"></div><section class="panel" id="customerTable"></section>';
    const draw=()=>{const q=($("#customerSearch").value||"").toLowerCase();const rows=cache.customers.filter(c=>(c.full_name+" "+c.phone).toLowerCase().includes(q)).map(c=>`<tr><td><b>${esc(c.full_name)}</b></td><td>${esc(c.phone)}</td><td>${esc(c.alternate_phone||"—")}</td><td>${esc(c.address||"—")}</td><td>${new Date(c.created_at).toLocaleDateString("en-IN")}</td></tr>`).join("");$("#customerTable").innerHTML=table(["Name","Phone","Alternate","Address","Added"],rows);};
    draw();$("#customerSearch").addEventListener("input",draw);$("#addCustomer")?.addEventListener("click",()=>customerForm());
  } else if(page==="measurements"){
    main.innerHTML=head("Measurements","Keep dated measurement sets for each customer.",admin?'<button class="btn" id="addMeasurement">＋ Add measurements</button>':"")
    +'<section class="panel" id="measurementTable"></section>';
    $("#measurementTable").innerHTML=table(["Customer","Garment","Label","Measurements","Date"],cache.measurements.map(m=>`<tr><td>${esc(cache.customers.find(c=>c.id===m.customer_id)?.full_name||"Customer")}</td><td>${esc(m.garment_type)}</td><td>${esc(m.label||"—")}</td><td>${esc(Object.entries(m.values||{}).map(([k,v])=>k+": "+v).join(", "))}</td><td>${new Date(m.created_at).toLocaleDateString("en-IN")}</td></tr>`).join(""));
    $("#addMeasurement")?.addEventListener("click",()=>measurementForm());
  } else if(page==="orders"){
    main.innerHTML=head("Orders","Track cutting, stitching and delivery.",admin?'<button class="btn" id="addOrder">＋ New order</button>':"")
    +'<section class="panel" id="ordersTable"></section>';
    $("#ordersTable").innerHTML=table(["Order","Customer","Due","Status","Total","Balance"],cache.orders.map(o=>{const paid=cache.payments.filter(p=>p.order_id===o.id).reduce((a,p)=>a+Number(p.amount),0);return `<tr><td><b>${esc(o.order_number)}</b></td><td>${esc(cache.customers.find(c=>c.id===o.customer_id)?.full_name||"Customer")}</td><td>${esc(o.due_date||"—")}</td><td>${admin?`<select data-status="${o.id}">${["pending","cutting","stitching","ready","delivered","cancelled"].map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}</select>`:`<span class="pill ${esc(o.status)}">${esc(o.status)}</span>`}</td><td>${money(o.total_amount)}</td><td>${money(Math.max(0,Number(o.total_amount)-Number(o.discount_amount)-paid))}</td></tr>`;}).join(""));
    $("#addOrder")?.addEventListener("click",()=>orderForm());
    document.querySelectorAll("[data-status]").forEach(sel=>sel.addEventListener("change",async()=>{const {error}=await supabase.from("orders").update({status:sel.value,updated_at:new Date().toISOString()}).eq("id",sel.dataset.status);if(error)toast(error.message);else{await renderPage();toast("Order status updated");}}));
  } else if(page==="payments"){
    main.innerHTML=head("Payments","Advance payments, collections and balances.",'<button class="btn" id="addPayment">＋ Record payment</button>')
    +'<section class="panel" id="paymentsTable"></section>';
    $("#paymentsTable").innerHTML=table(["Date","Order","Method","Note","Amount"],cache.payments.map(p=>`<tr><td>${new Date(p.paid_at).toLocaleDateString("en-IN")}</td><td>${esc(cache.orders.find(o=>o.id===p.order_id)?.order_number||"Order")}</td><td>${esc(p.method)}</td><td>${esc(p.note||"—")}</td><td><b>${money(p.amount)}</b></td></tr>`).join(""));
    $("#addPayment")?.addEventListener("click",()=>paymentForm());
  } else if(page==="expenses"){
    main.innerHTML=head("Expenses","Track shop expenses and operating costs.",'<button class="btn" id="addExpense">＋ Add expense</button>')
    +'<section class="panel" id="expensesTable"></section>';
    $("#expensesTable").innerHTML=table(["Date","Category","Description","Amount"],cache.expenses.map(x=>`<tr><td>${esc(x.expense_date)}</td><td>${esc(x.category)}</td><td>${esc(x.description||"—")}</td><td><b>${money(x.amount)}</b></td></tr>`).join(""));
    $("#addExpense")?.addEventListener("click",()=>expenseForm());
  } else if(page==="staff"){
    main.innerHTML=head("Staff","Team accounts and staff records.")
    +'<div class="notice">For safety, create staff accounts in Supabase Authentication first. Then assign the <b>staff</b> role in the protected database setup. Never share the owner password.</div><section class="panel" style="margin-top:18px"><h2>Team accounts</h2>'+table(["Name","Email / ID","Role","Status"],cache.staff.map(s=>`<tr><td>${esc(s.display_name||"Staff member")}</td><td>${esc(s.id)}</td><td><span class="pill">${esc(s.role)}</span></td><td>${s.active?"Active":"Inactive"}</td></tr>`).join(""))+'</section>';
  } else {
    main.innerHTML=head("Settings","Business setup and account information.")
    +'<div class="notice">Business name, contact details, receipt preferences and staff permissions can be configured here in the next setup pass. Your database is already protected by role-based policies.</div><section class="panel" style="margin-top:18px"><h2>Signed-in account</h2><p>'+esc(currentUser.email)+'</p><p class="sub">Role: '+esc(profile.role)+'</p></section>';
  }
}
function modal(title,body,onSave){
  const wrap=document.createElement("div");wrap.className="auth-wrap";wrap.style.position="fixed";wrap.style.inset="0";wrap.style.zIndex="30";wrap.style.background="#1d111b88";
  wrap.innerHTML=`<form class="auth-card" id="modalForm" style="max-height:90vh;overflow:auto;width:min(100%,620px)"><div style="display:flex;justify-content:space-between;align-items:center"><h2 style="font:600 24px Georgia;margin:0">${title}</h2><button type="button" class="btn ghost" id="closeModal">✕</button></div>${body}<p class="error" id="modalError"></p><div class="form-actions"><button type="button" class="btn ghost" id="cancelModal">Cancel</button><button type="submit" class="btn">Save record</button></div></form>`;
  document.body.append(wrap);const close=()=>wrap.remove();$("#closeModal",wrap).onclick=close;$("#cancelModal",wrap).onclick=close;
  $("#modalForm",wrap).onsubmit=async e=>{e.preventDefault();const btn=$("button[type=submit]",wrap);btn.disabled=true;try{await onSave(new FormData(e.currentTarget));close();toast("Saved successfully");await renderPage();}catch(err){$("#modalError",wrap).textContent=err.message;btn.disabled=false;}};
}
function f(label,name,type="text",extra=""){return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" ${extra} required></div>`;}
function customerForm(){modal("Add customer",'<div class="form-grid">'+f("Full name","full_name")+f("Phone number","phone","tel")+f("Alternate phone (optional)","alternate_phone","tel","") .replace(" required","")+f("Address","address").replace(" required","")+'<div class="field wide"><label>Notes</label><textarea name="notes"></textarea></div></div>',async fd=>{const {error}=await supabase.from("customers").insert({full_name:fd.get("full_name"),phone:fd.get("phone"),alternate_phone:fd.get("alternate_phone")||null,address:fd.get("address")||null,notes:fd.get("notes")||null,created_by:currentUser.id});if(error)throw error;});}
function measurementForm(){
 const options=cache.customers.map(c=>`<option value="${c.id}">${esc(c.full_name)} · ${esc(c.phone)}</option>`).join("");
 modal("Add measurements",`<div class="field"><label>Customer</label><select name="customer_id" required>${options}</select></div><div class="form-grid"><div class="field"><label>Garment</label><select name="garment_type"><option>suit</option><option>shirt</option><option>pant</option><option>blouse</option><option>kurti</option><option>other</option></select></div>${f("Label / date reference","label").replace(" required","")}${["chest","bust","waist","hip","shoulder","sleeve","length"].map(k=>f(k[0].toUpperCase()+k.slice(1)+" (inches)",k,"number",'step="0.1"').replace(" required","")).join("")}<div class="field wide"><label>Notes</label><textarea name="notes"></textarea></div></div>`,async fd=>{const values={};for(const k of ["chest","bust","waist","hip","shoulder","sleeve","length"])if(fd.get(k))values[k]=Number(fd.get(k));const {error}=await supabase.from("measurements").insert({customer_id:fd.get("customer_id"),garment_type:fd.get("garment_type"),label:fd.get("label")||null,values,notes:fd.get("notes")||null,recorded_by:currentUser.id});if(error)throw error;});
}
function orderForm(){
 const opts=cache.customers.map(c=>`<option value="${c.id}">${esc(c.full_name)} · ${esc(c.phone)}</option>`).join("");
 modal("Create order",`<div class="field"><label>Customer</label><select name="customer_id" required>${opts}</select></div><div class="form-grid">${f("Delivery date","due_date","date")}${f("Total amount (₹)","total_amount","number",'min="0" step="0.01"')}${f("Discount (₹)","discount_amount","number",'min="0" step="0.01"').replace(" required","")}<div class="field"><label>Garment</label><select name="garment_type"><option>Suit</option><option>Shirt</option><option>Pant</option><option>Blouse</option><option>Kurti</option><option>Other</option></select></div><div class="field wide"><label>Order notes</label><textarea name="notes"></textarea></div></div>`,async fd=>{const order_number="SR-"+new Date().toISOString().slice(0,10).replaceAll("-","")+"-"+Math.random().toString(36).slice(2,6).toUpperCase();const {data,error}=await supabase.from("orders").insert({order_number,customer_id:fd.get("customer_id"),due_date:fd.get("due_date")||null,total_amount:Number(fd.get("total_amount")),discount_amount:Number(fd.get("discount_amount")||0),notes:fd.get("notes")||null,created_by:currentUser.id}).select().single();if(error)throw error;const item=await supabase.from("order_items").insert({order_id:data.id,garment_type:fd.get("garment_type"),quantity:1,unit_price:Number(fd.get("total_amount"))});if(item.error)throw item.error;await supabase.from("order_status_history").insert({order_id:data.id,new_status:"pending",changed_by:currentUser.id,note:"Order created"});});
}
function paymentForm(){
 const opts=cache.orders.filter(o=>o.status!=="cancelled").map(o=>`<option value="${o.id}">${esc(o.order_number)} · ${money(o.total_amount)}</option>`).join("");
 modal("Record payment",`<div class="field"><label>Order</label><select name="order_id" required>${opts}</select></div><div class="form-grid">${f("Amount (₹)","amount","number",'min="1" step="0.01"')}<div class="field"><label>Method</label><select name="method"><option>cash</option><option>upi</option><option>bank</option><option>other</option></select></div><div class="field wide"><label>Note</label><textarea name="note"></textarea></div></div>`,async fd=>{const {error}=await supabase.from("payments").insert({order_id:fd.get("order_id"),amount:Number(fd.get("amount")),method:fd.get("method"),note:fd.get("note")||null,recorded_by:currentUser.id});if(error)throw error;});
}
function expenseForm(){modal("Add expense",`<div class="form-grid">${f("Category","category")} ${f("Amount (₹)","amount","number",'min="1" step="0.01"')} ${f("Date","expense_date","date")}<div class="field wide"><label>Description</label><textarea name="description"></textarea></div></div>`,async fd=>{const {error}=await supabase.from("expenses").insert({category:fd.get("category"),amount:Number(fd.get("amount")),expense_date:fd.get("expense_date")||new Date().toISOString().slice(0,10),description:fd.get("description")||null,recorded_by:currentUser.id});if(error)throw error;});}
async function boot(){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){loginView();return;}
  currentUser=session.user;
  const {data,error}=await supabase.from("profiles").select("id,display_name,phone,role,active").eq("id",currentUser.id).single();
  if(error||!data||!data.active||!["owner","admin","staff"].includes(data.role)){await supabase.auth.signOut();loginView("This account is not enabled for the SR Fashions workspace. Ask the owner to activate your staff profile.");return;}
  profile=data;shell();await renderPage();
}
supabase.auth.onAuthStateChange((event,session)=>{if(event==="SIGNED_OUT"){loginView();}else if(event==="SIGNED_IN"&&session){boot();}});

navMarkup = function(){const items=profile && profile.role==="staff"?navItems.filter(x=>x[0]==="dashboard"||x[0]==="orders"):navItems;return items.map(x=>'<button class="nav-btn '+(page===x[0]?'active':'')+'" data-page="'+x[0]+'"><span>'+x[1]+'</span><span>'+x[2]+'</span></button>').join('');};
boot = async function(){
 const result=await supabase.auth.getSession(); const session=result.data.session;
 if(!session){loginView();return;}
 currentUser=session.user;
 const p=await supabase.from("profiles").select("id,display_name,phone,role,active").eq("id",currentUser.id).single();
 if(p.error||!p.data||!p.data.active||!["owner","admin","staff"].includes(p.data.role)){await supabase.auth.signOut();loginView("This account is not active for this workspace.");return;}
 profile=p.data;
 const expected=profile.role==="staff"?"staff":"admin";
 const path=location.pathname;
 const actual=path.endsWith("/staff.html")?"staff":path.endsWith("/admin.html")?"admin":"home";
 const target=expected==="staff"?"./staff.html":"./admin.html";
 if(actual!==expected){location.replace(target);return;}
 shell();await renderPage();
};

boot().catch(e=>loginView(e.message));
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
