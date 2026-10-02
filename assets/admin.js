(()=>{
const API='https://hkrttulwietizshbfigq.supabase.co/functions/v1/booking-api';
const $=s=>document.querySelector(s);const keyEl=$('#adminKey'),msg=$('#adminMessage'),dash=$('#dashboard'),rowsEl=$('#bookingRows');
const fmt=n=>`NT$${Number(n||0).toLocaleString('zh-TW')}`;
const dt=s=>s?new Date(s).toLocaleString('zh-TW',{hour12:false}):'—';
const statusName=s=>({pending:'待確認',confirmed:'已確認',paid:'已收款',cancelled:'已取消'})[s]||s;
const key=()=>sessionStorage.getItem('hallelujah_admin_key')||'';
function setMsg(t=''){msg.textContent=t}
async function api(action,opt={}){const r=await fetch(`${API}?action=${action}`,{...opt,headers:{'content-type':'application/json','x-admin-key':key(),...(opt.headers||{})}});let j={};try{j=await r.json()}catch{}if(!r.ok)throw Object.assign(new Error(j.error||'request_failed'),{status:r.status,data:j});return j}
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
async function load(){setMsg('讀取中…');try{const j=await api('admin_list');render(j.bookings||[]);dash.classList.remove('hidden');$('#adminLogout').classList.remove('hidden');setMsg('')}catch(e){dash.classList.add('hidden');setMsg(e.status===401?'管理金鑰錯誤。':'後台目前無法連線。')}}
async function updateStatus(id,status){if(status==='cancelled'&&!confirm('確定要取消這筆訂單嗎？'))return;setMsg('更新中…');try{await api('admin_update',{method:'POST',body:JSON.stringify({id:Number(id),status})});await load()}catch(e){setMsg(e.status===409?'無法確認：該日期房數已不足。':'更新失敗。')}}
$('#adminLogin').addEventListener('click',()=>{sessionStorage.setItem('hallelujah_admin_key',keyEl.value.trim());load()});
$('#adminLogout').addEventListener('click',()=>{sessionStorage.removeItem('hallelujah_admin_key');keyEl.value='';dash.classList.add('hidden');$('#adminLogout').classList.add('hidden');setMsg('已登出。')});
$('#adminRefresh').addEventListener('click',load);
if(key()){load()}
})();
