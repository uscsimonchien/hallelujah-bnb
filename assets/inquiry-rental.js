/* Pure equipment rental on inquiry.html; intentionally independent of lodging booking-v2.js. */
(()=>{
'use strict';
const root=document.getElementById('rentalOnlyPanel');
if(!root||!window.HallelujahBookingExtras)return;
const $=id=>document.getElementById(id);
const api='https://hkrttulwietizshbfigq.supabase.co/functions/v1/camping-api';
const pickup=$('rentalPickup'),returns=$('rentalReturn'),submit=$('rentalOnlySubmit'),summary=$('rentalOnlySummary'),notice=$('rentalOnlyStatus'),result=$('rentalOnlyResult');
const today=()=>{const now=new Date(Date.now()+8*3600000);return now.toISOString().slice(0,10);};
const fmt=x=>'NT$'+Number(x||0).toLocaleString('zh-TW');
const nightCount=()=>{
  if(!pickup.value||!returns.value)return 0;
  const n=(Date.parse(returns.value+'T00:00:00Z')-Date.parse(pickup.value+'T00:00:00Z'))/86400000;
  return Number.isInteger(n)?n:0;
};
let busy=false;
function refresh(){
 const n=nightCount();
 try{
  const priced=extras.calculate(n);
  const valid=n>=1&&n<=30&&pickup.value>=today()&&priced.items.length>0;
  if(valid){
   const down=Math.round(priced.total*.3);
   summary.textContent='設備租金 '+fmt(priced.total)+'｜訂金 30% '+fmt(down)+'\n取件尾款 '+fmt(priced.total-down)+'｜器材押金（另收、可退） '+fmt(priced.securityDeposit);
   notice.textContent='不需訂房或選營位；送出後請與營主確認設備庫存、取還時間及訂金。';
  }else{
   summary.textContent='請選擇有效取件與歸還日期（1–30 晚），並至少選購一項設備。';
   notice.textContent='純設備租借不占用房間或營位，租借數量依營主庫存確認。';
  }
  submit.disabled=busy||!valid;
 }catch(err){
  summary.textContent=String(err.message||'請檢查租借品項');
  submit.disabled=true;
 }
}
const extras=window.HallelujahBookingExtras.mount($('rentalOnlyExtras'),refresh);
pickup.min=today();
const next=s=>{const d=new Date(s+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10);};
returns.min=next(today());
pickup.addEventListener('change',()=>{
 if(pickup.value){
  returns.min=next(pickup.value);
  if(returns.value&&returns.value<=pickup.value)returns.value='';
 }
 refresh();
});
returns.addEventListener('change',refresh);
const modes=[...document.querySelectorAll('input[name="inquiryBookingMode"]')];
const switchMode=()=>{
 const rental=modes.some(x=>x.checked&&x.value==='rental');
 $('lodgingBookingShell').hidden=rental;
 root.hidden=!rental;
 document.querySelector('.booking-rates').hidden=rental;
 $('inquiryBookingModeHint').textContent=rental?'不須選房間或營位；只需選擇設備、數量、取件及歸還日期。':'依照空房月曆訂房，也可以切換成只租設備。';
 refresh();
};
modes.forEach(x=>x.addEventListener('change',switchMode));
const qs=new URLSearchParams(location.search);
if(qs.get('mode')==='rental'){
 const option=modes.find(x=>x.value==='rental');
 if(option)option.checked=true;
}
switchMode();
$('rentalOnlyForm').addEventListener('submit',async event=>{
 event.preventDefault();
 if(busy||submit.disabled)return;
 busy=true;refresh();notice.textContent='正在建立純設備租借申請…';
 try{
  const n=nightCount(),priced=extras.calculate(n);
  if(!priced.items.length||n<1||n>30||pickup.value<today())throw Error('請選擇日期與至少一項設備');
  const name=$('rentalName').value.trim(),phone=$('rentalPhone').value.trim();
  if(!name||!phone)throw Error('請填寫姓名及聯絡電話');
  const body={name,phone,checkin:pickup.value,checkout:returns.value,note:$('rentalNote').value.trim(),
   extras:Object.entries(extras.quantities()).map(([id,qty])=>({id,qty}))};
  const response=await fetch(api+'?action=rental-bookings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  let parsed={};try{parsed=await response.json()}catch{}
  if(!response.ok)throw Error(parsed.error==='equipment_unavailable'?'選擇日期內部分設備已被訂走，請調整數量或日期':parsed.error==='invalid_rental_order'?'品項或數量不符合租借規定，請重新檢查':parsed.error||'建立訂單失敗，請與營主聯絡');
  const order=parsed.booking;
  const lines=['🧰 純設備租借訂單已建立','訂單編號：'+order.code,'取件：'+order.checkin,'歸還：'+order.checkout,
   '房間／營位：無（純租借）','設備：'+(order.extras||[]).map(x=>x.name+' × '+x.qty+(x.unit||'')).join('、'),
   '總租金：'+fmt(order.total),'應付訂金：'+fmt(order.deposit_due),'取件尾款：'+fmt(order.balance),
   '器材押金（另收、可退）：'+fmt(order.equipment_deposit_due),
   '請透過官方 LINE 聯絡營主，確認庫存、付款及取件方式。'];
  result.textContent=lines.join('\n');result.hidden=false;
  notice.textContent='設備租借申請建立成功，請保存訂單編號。';
  $('rentalOnlyForm').reset();extras.reset();
  pickup.value='';returns.value='';
  result.scrollIntoView({behavior:'smooth',block:'center'});
 }catch(err){notice.textContent='預訂未成功：'+String(err.message||err);}
 finally{busy=false;refresh();}
});
refresh();
})();
