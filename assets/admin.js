(()=>{
const API='https://hkrttulwietizshbfigq.supabase.co/functions/v1/booking-api';
const $=s=>document.querySelector(s);const keyEl=$('#adminKey'),msg=$('#adminMessage'),dash=$('#dashboard'),rowsEl=$('#bookingRows');
const fmt=n=>`NT$${Number(n||0).toLocaleString('zh-TW')}`;
const dt=s=>s?new Date(s).toLocaleString('zh-TW',{hour12:false}):'—';
const statusName=s=>({pending:'待確認',confirmed:'已確認',paid:'已收款',cancelled:'已取消'})[s]||s;
const key=()=>sessionStorage.getItem('hallelujah_admin_key')||'';
function setMsg(t=''){msg.textContent=t}
async function api(action,opt={}){const r=await fetch(`${API}?action=${action}`,{...opt,headers:{'content-type':'application/json','x-admin-key':key(),...(opt.headers||{})}});let j={};try{j=await r.json()}catch{}if(!r.ok)throw Object.assign(new Error(j.error||'request_failed'),{status:r.status,data:j});return j}
async function createPublicBooking(body){const r=await fetch(API+'?action=create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});let j={};try{j=await r.json()}catch{}if(!r.ok)throw Object.assign(new Error(j.error||'request_failed'),{status:r.status,data:j});return j}
function render(list){
 $('#statPending').textContent=list.filter(x=>x.status==='pending').length;
 $('#statConfirmed').textContent=list.filter(x=>x.status==='confirmed').length;
 $('#statPaid').textContent=list.filter(x=>x.status==='paid').length;
 $('#statTotal').textContent=list.length;
 rowsEl.innerHTML=list.map(b=>`<tr>
 <td><span class="status-chip ${b.status}">${statusName(b.status)}</span>${b.status==='pending'&&b.hold_expires_at?`<div style="font-size:11px;color:#777;margin-top:5px">保留至 ${dt(b.hold_expires_at)}</div>`:''}</td>
 <td><strong>${b.code}</strong><div style="font-size:12px;color:#777">${dt(b.created_at)}</div></td>
 <td><strong>${escapeHtml(b.name)}</strong><div>${escapeHtml(b.phone)}</div>${b.line_name?`<div style="font-size:12px;color:#777">LINE：${escapeHtml(b.line_name)}</div>`:''}</td>
 <td>${String(b.checkin).slice(0,10)} → ${String(b.checkout).slice(0,10)}<div style="font-size:12px;color:#777">${b.nights} 晚</div></td>
 <td>${b.rooms} 間／${b.guests} 人</td>
 <td><strong>${fmt(b.total)}</strong><div style="font-size:12px;color:#777">訂金 ${fmt(b.deposit)}／尾款 ${fmt(b.balance)}</div></td>
 <td style="max-width:220px">${escapeHtml(b.note||'')}</td>
 <td><div class="admin-actions">
   <button class="ok" data-id="${b.id}" data-status="confirmed">確認</button>
   <button class="paid" data-id="${b.id}" data-status="paid">已收款</button>
   <button class="pending" data-id="${b.id}" data-status="pending">待確認</button>
   <button class="cancel" data-id="${b.id}" data-status="cancelled">取消</button>
 </div></td></tr>`).join('')||'<tr><td colspan="8">目前沒有訂單。</td></tr>';
 rowsEl.querySelectorAll('button[data-id]').forEach(btn=>btn.addEventListener('click',()=>updateStatus(btn.dataset.id,btn.dataset.status)));
}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function load(){setMsg('讀取中…');try{const j=await api('admin_list');render(j.bookings||[]);dash.classList.remove('hidden');$('#adminLogout').classList.remove('hidden');await loadLineStatus();setMsg('')}catch(e){dash.classList.add('hidden');setMsg(e.status===401?'管理金鑰錯誤。':'後台目前無法連線。')}}
async function updateStatus(id,status){if(status==='cancelled'&&!confirm('確定要取消這筆訂單嗎？'))return;setMsg('更新中…');try{await api('admin_update',{method:'POST',body:JSON.stringify({id:Number(id),status})});await load()}catch(e){setMsg(e.status===409?'無法確認：該日期房數已不足。':'更新失敗。')}}
$('#adminLogin').addEventListener('click',()=>{sessionStorage.setItem('hallelujah_admin_key',keyEl.value.trim());load()});
$('#adminLogout').addEventListener('click',()=>{sessionStorage.removeItem('hallelujah_admin_key');keyEl.value='';dash.classList.add('hidden');$('#adminLogout').classList.add('hidden');setMsg('已登出。')});
$('#adminRefresh').addEventListener('click',load);

async function loadLineStatus(){
 const statusEl=$('#lineConfigStatus'),targetsEl=$('#lineTargets'),urlEl=$('#lineWebhookUrl'),pairBtn=$('#linePairBtn'),testBtn=$('#lineTestBtn');
 if(!statusEl)return;
 try{
  const x=await api('line_status');
  const configured=x.configured?.token&&x.configured?.secret;
  statusEl.innerHTML=configured?'<span class="line-good">✅ Channel access token 與 Channel secret 已設定</span>':'<span class="line-warn">⚠️ 尚未完成 LINE API 金鑰設定</span>';
  urlEl.textContent='Webhook URL：'+(x.webhookUrl||'');
  const ts=x.targets||[];
  targetsEl.innerHTML=ts.length?ts.map(t=>`<div class="line-target"><span>${escapeHtml(t.label||t.target_type||'LINE')}</span><span class="${t.enabled?'line-good':'line-warn'}">${t.enabled?'啟用':'停用'}</span></div>`).join(''):'尚未綁定任何 LINE 通知對象。';
  pairBtn.disabled=!configured;testBtn.disabled=!configured||!ts.some(t=>t.enabled);
 }catch{statusEl.textContent='LINE 設定讀取失敗。'}
}
const pairBtn=$('#linePairBtn');
if(pairBtn)pairBtn.addEventListener('click',async()=>{
 const codeEl=$('#linePairCode'),hint=$('#linePairHint');pairBtn.disabled=true;
 try{const x=await api('line_pair_code',{method:'POST',body:'{}'});codeEl.textContent=x.code;hint.textContent='請在 10 分鐘內，到哈雷露亞民宿官方 LINE 傳送這組綁定碼。';}
 catch{setMsg('無法產生 LINE 綁定碼。')}finally{pairBtn.disabled=false}
});
const testBtn=$('#lineTestBtn');
if(testBtn)testBtn.addEventListener('click',async()=>{
 testBtn.disabled=true;setMsg('傳送 LINE 測試通知中…');
 try{await api('line_test',{method:'POST',body:'{}'});setMsg('LINE 測試通知已送出。')}
 catch(e){setMsg(e.data?.error==='no_targets'?'尚未綁定 LINE 通知對象。':'LINE 測試通知傳送失敗。')}
 finally{await loadLineStatus()}
});

const manualForm=$('#manualBookingForm');
if(manualForm){
 const ci=$('#manualCheckin'),co=$('#manualCheckout'),rooms=$('#manualRooms'),guests=$('#manualGuests'),source=$('#manualSource'),btn=$('#manualSubmit');
 const now=new Date(),today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 ci.min=today;co.min=today;
 ci.addEventListener('change',()=>{if(ci.value){const d=new Date(ci.value+'T12:00:00');d.setDate(d.getDate()+1);co.min=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;if(co.value&&co.value<=ci.value)co.value=''}});
 rooms.addEventListener('change',()=>{const max=Number(rooms.value)*4;if(Number(guests.value)>max)guests.value=String(max)});
 source.addEventListener('change',()=>{const block=source.value==='封房';$('#manualName').placeholder=block?'可留白，系統會填「人工封房」':'客人姓名';$('#manualPhone').placeholder=block?'可留白':'客人電話'});
 manualForm.addEventListener('submit',async e=>{
  e.preventDefault();if(!key()){setMsg('請先登入後台。');return}
  const fd=new FormData(manualForm),src=String(fd.get('source')||'其他'),r=Number(fd.get('rooms')||1),block=src==='封房';
  const checkin=String(fd.get('checkin')||''),checkout=String(fd.get('checkout')||''),g=block?Math.max(1,r):Number(fd.get('guests')||1);
  const name=String(fd.get('name')||'').trim()||(block?'人工封房':'人工訂房');
  const phone=String(fd.get('phone')||'').trim()||(block?'ADMIN':'未提供');
  const noteRaw=String(fd.get('note')||'').trim(),note=`[${src}]${noteRaw?' '+noteRaw:''}`;
  if(!checkin||!checkout||checkout<=checkin){setMsg('請確認入住與退房日期。');return}
  if(!block&&g>r*4){setMsg(`${r} 間最多安排 ${r*4} 人，請調整入住人數。`);return}
  btn.disabled=true;btn.textContent='新增中…';setMsg('正在同步中央房況…');
  let createdId=0;
  try{
   const j=await api('admin_create',{method:'POST',body:JSON.stringify({name,phone,lineName:src==='LINE'?name:'',checkin,checkout,rooms:r,guests:g,note})});
   createdId=Number(j.booking?.id||0);if(!createdId)throw new Error('missing_booking_id');
   manualForm.reset();guests.value='1';rooms.value='1';source.value='LINE';await load();
   setMsg(`已新增${block?'封房':'人工訂房'}，房況已立即同步。`);
  }catch(err){
   setMsg(err.status===409?'新增失敗：這段日期的剩餘房數不足。':'新增失敗，請稍後再試。');
  }finally{btn.disabled=false;btn.textContent='新增並立即占房'}
 });
}

if(key()){load()}
})();
