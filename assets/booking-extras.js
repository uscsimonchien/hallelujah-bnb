/* 哈雷露亞民宿共用加購清單：住宿與露營同一份品項。 */
(()=>{
"use strict";
const CATALOG=[
  {
    "id": "bbq_grill",
    "name": "大型美式帶蓋烤肉爐",
    "price": 500,
    "deposit": 1000,
    "max": 1,
    "mode": "night",
    "category": "烤肉用品",
    "unit": "台",
    "image": "assets/images/bbq-grill-520.png",
    "desc": "烤爐主體與固定炭槽；不含炭精"
  },
  {
    "id": "bbq_bundle",
    "name": "BBQ 懶人套裝組",
    "price": 1000,
    "deposit": 1000,
    "max": 1,
    "mode": "night",
    "category": "烤肉用品",
    "unit": "組",
    "image": "assets/images/bbq-bundle-520.png",
    "desc": "烤爐、炭精 2kg、烤肉夾、火種及全新烤網"
  },
  {
    "id": "charcoal_2kg",
    "name": "炭精 2 公斤",
    "price": 150,
    "deposit": 0,
    "max": 10,
    "mode": "once",
    "category": "烤肉用品",
    "unit": "袋",
    "image": "assets/images/bbq-charcoal-420.png",
    "desc": "耗材購買，售出不退"
  },
  {
    "id": "kermit_chair",
    "name": "克米特露營椅",
    "price": 100,
    "deposit": 300,
    "max": 4,
    "mode": "night",
    "category": "桌椅與燈串",
    "unit": "張",
    "image": "assets/images/rental-kermit-chair.png",
    "desc": "現場共 4 張"
  },
  {
    "id": "roll_table",
    "name": "120cm 升降蛋捲桌",
    "price": 200,
    "deposit": 500,
    "max": 1,
    "mode": "night",
    "category": "桌椅與燈串",
    "unit": "張",
    "image": "assets/images/rental-roll-table.png",
    "desc": "現場共 1 張"
  },
  {
    "id": "table_chair_set",
    "name": "經典桌椅組（1桌4椅）",
    "price": 500,
    "deposit": 1500,
    "max": 1,
    "mode": "night",
    "category": "桌椅與燈串",
    "unit": "套",
    "image": "assets/images/rental-roll-table.png",
    "image2": "assets/images/rental-kermit-chair.png",
    "desc": "含升降蛋捲桌 1 張＋露營椅 4 張"
  },
  {
    "id": "g40_lights",
    "name": "G40 LED 氣氛燈串",
    "price": 50,
    "deposit": 200,
    "max": 1,
    "mode": "night",
    "category": "桌椅與燈串",
    "unit": "組",
    "image": "assets/images/g40_string_lights.png",
    "desc": "7.6 公尺、25 顆暖黃光燈泡"
  },
  {
    "id": "g40_extension",
    "name": "燈串加購動力延長線組",
    "price": 100,
    "deposit": 300,
    "max": 1,
    "mode": "night",
    "category": "桌椅與燈串",
    "unit": "組",
    "image": "assets/images/g40_extension_cable.png",
    "desc": "內含 G40 燈串及 5／10 米延長線"
  },
  {
    "id": "hispeed_single",
    "name": "Hispeed 單人床墊",
    "price": 100,
    "deposit": 300,
    "max": 1,
    "mode": "night",
    "category": "床墊",
    "unit": "張",
    "image": "assets/images/rental_hispeed_single_hd.png",
    "desc": "輕便好收納"
  },
  {
    "id": "hispeed_double",
    "name": "Hispeed 雙人床墊",
    "price": 150,
    "deposit": 500,
    "max": 1,
    "mode": "night",
    "category": "床墊",
    "unit": "張",
    "image": "assets/images/rental_hispeed_double_hd.png",
    "desc": "雙人用、快速充氣"
  },
  {
    "id": "cheese_single",
    "name": "單人奶酪床墊",
    "price": 250,
    "deposit": 500,
    "max": 1,
    "mode": "night",
    "category": "床墊",
    "unit": "張",
    "image": "assets/images/rental_cheese_single_hd.png",
    "desc": "厚實舒適"
  },
  {
    "id": "cheese_double",
    "name": "雙人奶酪床墊",
    "price": 400,
    "deposit": 1000,
    "max": 1,
    "mode": "night",
    "category": "床墊",
    "unit": "張",
    "image": "assets/images/rental_cheese_double_hd.png",
    "desc": "雙人加大"
  },
  {
    "id": "projector_4k",
    "name": "4K 投影機＋布幕（3小時）",
    "price": 1000,
    "deposit": 0,
    "max": 1,
    "mode": "once",
    "category": "休閒設備",
    "unit": "次",
    "image": "assets/images/projector4k.jpg",
    "desc": "每次 3 小時，須確認時段"
  },
  {
    "id": "kids_pool",
    "name": "兒童泳池",
    "price": 1000,
    "deposit": 0,
    "max": 1,
    "mode": "once",
    "category": "休閒設備",
    "unit": "次",
    "image": "assets/images/kids_pool.jpg",
    "desc": "依天候與現場設施狀況開放"
  }
];
const money=n=>"NT$"+Number(n||0).toLocaleString("zh-TW");
const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const CONFLICTS=[["bbq_grill","bbq_bundle"],["table_chair_set","kermit_chair"],["table_chair_set","roll_table"],["g40_lights","g40_extension"]];
const styles=`
.hb-extra-wrap{margin:18px 0 8px}.hb-extra-wrap h3{color:#234937;margin:0 0 10px;font-size:21px}.hb-extra-section{margin:18px 0}.hb-extra-section h4{font-size:16px;color:#254b3d;margin:10px 0}.hb-extra-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.hb-extra-item{display:flex;gap:10px;border:1px solid #e4e9e2;border-radius:12px;padding:10px;background:#fff;min-width:0;align-items:center}.hb-extra-item:has(select:not([value="0"])){} .hb-extra-thumb{width:78px;height:86px;flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:#faf9f4;border-radius:9px}.hb-extra-thumb img{max-width:100%;width:100%;height:100%;object-fit:contain}.hb-extra-thumb img.hb-second{position:absolute;width:48%;height:58%;left:0;bottom:0}.hb-extra-info{min-width:0;flex:1}.hb-extra-name{font-weight:800;font-size:14px;color:#1d3e32;line-height:1.4}.hb-extra-desc{font-size:12px;color:#66776b;line-height:1.45;margin-top:3px}.hb-extra-price{color:#1c684c;font-weight:800;font-size:14px;margin:3px 0}.hb-extra-deposit{font-size:12px;color:#846433}.hb-extra-item select{display:block;width:100%;max-width:140px;min-height:34px;margin-top:6px;padding:5px 7px;border:1px solid #b9cdbd;border-radius:8px;background:#fff;font:inherit;font-size:13px;color:#294e3c}.hb-extra-note{font-size:12px;color:#6d746d;line-height:1.75;margin:12px 0}.hb-extra-warning{font-size:13px;font-weight:700;color:#8c4d16;min-height:1.5em;margin:5px 0}.hb-extra-deposit-due{font-size:13px;color:#86602d;line-height:1.6;white-space:pre-line}
@media(max-width:700px){.hb-extra-grid{grid-template-columns:1fr}.hb-extra-thumb{width:78px;height:80px}.hb-extra-wrap{margin:12px 0}.hb-extra-item{padding:9px}}
`;
function calculate(qty={},nights=1){
 const n=Number(nights)>0?Number(nights):1;let total=0,securityDeposit=0;const items=[];
 for(const it of CATALOG){const q=Number(qty[it.id]||0);if(!Number.isInteger(q)||q<0||q>it.max)throw Error("加購數量錯誤："+it.name);if(!q)continue;const rentTotal=q*it.price*(it.mode==="night"?n:1),deposit=q*it.deposit;total+=rentTotal;securityDeposit+=deposit;items.push({...it,qty:q,rentTotal,depositTotal:deposit})}
 for(const [a,b] of CONFLICTS){if(qty[a]>0&&qty[b]>0)throw Error("「"+CATALOG.find(x=>x.id===a).name+"」與「"+CATALOG.find(x=>x.id===b).name+"」使用同一組設備，請擇一")}
 return {total,securityDeposit,items};
}
function mount(el,change){
 if(!el)throw Error("加購容器不存在");
 if(!document.getElementById("hbExtrasStyles")){const st=document.createElement("style");st.id="hbExtrasStyles";st.textContent=styles;document.head.appendChild(st)}
 const cats=[...new Set(CATALOG.map(x=>x.category))];
 el.innerHTML='<div class="hb-extra-wrap"><h3>其他用品與活動加購（選填）</h3>'+cats.map(cat=>'<section class="hb-extra-section"><h4>'+escape(cat)+'</h4><div class="hb-extra-grid">'+CATALOG.filter(x=>x.category===cat).map(it=>{
 const thumb='<img src="'+escape(it.image)+'" alt="'+escape(it.name)+'" loading="lazy">'+(it.image2?'<img class="hb-second" src="'+escape(it.image2)+'" alt="" loading="lazy">':'');
 return '<div class="hb-extra-item"><div class="hb-extra-thumb">'+thumb+'</div><div class="hb-extra-info"><div class="hb-extra-name">'+escape(it.name)+'</div><div class="hb-extra-price">'+money(it.price)+(it.mode==="night"?'／晚':'／次或份')+'</div><div class="hb-extra-deposit">'+(it.deposit?'器材押金 '+money(it.deposit)+'／'+it.unit:'免器材押金')+'</div><div class="hb-extra-desc">'+escape(it.desc)+'</div><select data-extra-id="'+it.id+'" aria-label="'+escape(it.name)+'數量">'+Array.from({length:it.max+1},(_,i)=>'<option value="'+i+'">'+(i===0?'不加購':i+' '+it.unit)+'</option>').join('')+'</select></div></div>'
 }).join('')+'</div></section>').join('')+'<p class="hb-extra-note">設備租金以住宿晚數／露營晚數計算；炭精、泳池、投影機依次計費。器材押金為可退押金，<strong>不計入訂單租金或 30% 預訂訂金</strong>，由現場另外收取，點交後依規定退還。數量、時段、天候與實際庫存以營主確認為準。</p><p class="hb-extra-warning" role="status"></p></div>';
 const qty=()=>Object.fromEntries([...el.querySelectorAll("select[data-extra-id]")].map(x=>[x.dataset.extraId,Number(x.value)]).filter(x=>x[1]>0));
 const warn=el.querySelector(".hb-extra-warning");
 const selects=[...el.querySelectorAll("select[data-extra-id]")];
 selects.forEach(select=>select.addEventListener("change",()=>{
  const selected=qty();
  for(const [a,b] of CONFLICTS){if(selected[a]>0&&selected[b]>0){select.value="0";warn.textContent="同一組器材不可重複租借（烤爐、桌椅套組或燈串套組），已取消後選的項目。";change?.();return}}
  warn.textContent="";change?.();
 }));
 return {quantities:qty,calculate:n=>calculate(qty(),n),reset:()=>{selects.forEach(s=>s.value="0");warn.textContent=""}};
}
window.HallelujahBookingExtras={catalog:CATALOG,calculate,mount,money};
})();