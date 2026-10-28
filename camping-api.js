// Mount with: app.use('/api/camping', require('./camping-api')(pool, admin));
// Requires database/camping-reservations-draft.sql to be applied first.
const express = require('express');
const crypto = require('crypto');
module.exports = (pool, admin) => {
 const router = express.Router();
 const date = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s+'T00:00:00Z'));
 const today = () => new Date(Date.now()+8*3600000).toISOString().slice(0,10);
 const days = (a,b) => Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
 const fail = (res,e) => { console.error('camping',e); res.status(500).json({error:'server_error'}); };
 const siteIds = ['3F-1','3F-2','4F-A-1','4F-A-2','4F-B-1','4F-B-2','5F-1','5F-2','6F-A-1','6F-A-2'];
 const activeOverlap = `SELECT DISTINCT rs.site_id FROM camping_reservation_sites rs JOIN camping_reservations r ON r.id=rs.reservation_id WHERE rs.site_id=ANY($1::text[]) AND rs.checkin<$3::date AND rs.checkout>$2::date AND (r.status='confirmed' OR (r.status='pending' AND r.hold_expires_at>now()))`;
 router.get('/availability', async(req,res)=>{
  const {checkin,checkout}=req.query;
  if(!date(checkin)||!date(checkout)||days(checkin,checkout)<1||days(checkin,checkout)>30)return res.status(400).json({error:'invalid_dates'});
  try {
   const [sites,occupied]=await Promise.all([pool.query('SELECT id,area,width_m,depth_m,nightly_price,active FROM camping_sites ORDER BY id'),pool.query(activeOverlap,[siteIds,checkin,checkout])]);
   const busy=new Set(occupied.rows.map(x=>x.site_id));
   res.json({sites:sites.rows.map(s=>({...s,available:s.active&&!busy.has(s.id)}))});
  }catch(e){fail(res,e)}
 });
 router.post('/bookings',async(req,res)=>{
  const b=req.body||{},ids=b.sites;
  if(!date(b.checkin)||!date(b.checkout)||b.checkin<today()||days(b.checkin,b.checkout)<1||days(b.checkin,b.checkout)>30||!Array.isArray(ids)||!ids.length||ids.length>10||new Set(ids).size!==ids.length||ids.some(x=>!siteIds.includes(x))||typeof b.name!=='string'||!b.name.trim()||b.name.length>80||typeof b.phone!=='string'||!/^[0-9+() -]{8,25}$/.test(b.phone)||!Number.isInteger(Number(b.guests))||Number(b.guests)<1||Number(b.guests)>60)return res.status(400).json({error:'invalid_booking'});
  const c=await pool.connect();
  try {
   await c.query('BEGIN');
   await c.query('SELECT pg_advisory_xact_lock(533202610)');
   const sites=await c.query('SELECT id,nightly_price FROM camping_sites WHERE id=ANY($1::text[]) AND active=true',[ids]);
   if(sites.rowCount!==ids.length){await c.query('ROLLBACK');return res.status(409).json({error:'inactive_site'})}
   const busy=await c.query(activeOverlap,[ids,b.checkin,b.checkout]);
   if(busy.rowCount){await c.query('ROLLBACK');return res.status(409).json({error:'occupied',sites:busy.rows.map(x=>x.site_id)})}
   const total=sites.rows.reduce((n,s)=>n+s.nightly_price,0)*days(b.checkin,b.checkout);
   const deposit=Math.round(total*0.3);
   const code='HC'+crypto.randomBytes(6).toString('hex').toUpperCase();
   const r=await c.query(`INSERT INTO camping_reservations(code,guest_name,guest_phone,checkin,checkout,guests,status,hold_expires_at,total,deposit_due,note) VALUES($1,$2,$3,$4,$5,$6,'pending',now()+interval '2 hours',$7,$8,$9) RETURNING id,code,status,hold_expires_at,total,deposit_due`,[code,b.name.trim(),b.phone.trim(),b.checkin,b.checkout,Number(b.guests),total,deposit,String(b.note||'').slice(0,1000)]);
   for(const id of ids)await c.query('INSERT INTO camping_reservation_sites(reservation_id,site_id,checkin,checkout,status) VALUES($1,$2,$3,$4,$5)',[r.rows[0].id,id,b.checkin,b.checkout,'pending']);
   await c.query('COMMIT');
   res.status(201).json({booking:{...r.rows[0],sites:ids,balance:total-deposit}});
  }catch(e){await c.query('ROLLBACK').catch(()=>{});fail(res,e)}finally{c.release()}
 });
 router.get('/admin/bookings',admin,async(req,res)=>{
  try{const r=await pool.query(`SELECT r.*,COALESCE(array_agg(s.site_id ORDER BY s.site_id) FILTER(WHERE s.site_id IS NOT NULL),'{}') AS sites FROM camping_reservations r LEFT JOIN camping_reservation_sites s ON s.reservation_id=r.id GROUP BY r.id ORDER BY r.created_at DESC LIMIT 500`);res.json({bookings:r.rows})}catch(e){fail(res,e)}
 });
 router.patch('/admin/bookings/:id',admin,async(req,res)=>{
  const status=req.body?.status;
  if(!['confirmed','cancelled','expired'].includes(status))return res.status(400).json({error:'invalid_status'});
  const c=await pool.connect();
  try {
   await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(533202610)');
   const r=await c.query('SELECT * FROM camping_reservations WHERE id=$1 FOR UPDATE',[req.params.id]);
   if(!r.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'not_found'})}
   if(status==='confirmed'){
    const b=r.rows[0],ids=(await c.query('SELECT site_id FROM camping_reservation_sites WHERE reservation_id=$1',[b.id])).rows.map(x=>x.site_id);
    const busy=await c.query(activeOverlap+' AND r.id<>$4',[ids,b.checkin,b.checkout,b.id]);
    if(busy.rowCount){await c.query('ROLLBACK');return res.status(409).json({error:'occupied'})}
   }
   await c.query('UPDATE camping_reservations SET status=$1,updated_at=now(),hold_expires_at=null WHERE id=$2',[status,req.params.id]);
   await c.query('UPDATE camping_reservation_sites SET status=$1 WHERE reservation_id=$2',[status,req.params.id]);
   await c.query('COMMIT');res.json({ok:true,status});
  }catch(e){await c.query('ROLLBACK').catch(()=>{});fail(res,e)}finally{c.release()}
 });
 router.post('/admin/bookings/:id/payments',admin,async(req,res)=>{
  const {kind,amount,method,reference}=req.body||{};
  if(!['deposit','balance','refund'].includes(kind)||!Number.isInteger(amount)||amount<=0||amount>1000000)return res.status(400).json({error:'invalid_payment'});
  const c=await pool.connect();
  try{
   await c.query('BEGIN');
   const r=await c.query('SELECT * FROM camping_reservations WHERE id=$1 FOR UPDATE',[req.params.id]);
   if(!r.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'not_found'})}
   const b=r.rows[0],nextDeposit=b.deposit_paid+(kind==='deposit'?amount:0),nextBalance=b.balance_paid+(kind==='balance'?amount:0);
   if(kind==='refund'||nextDeposit+nextBalance>b.total){await c.query('ROLLBACK');return res.status(400).json({error:'manual_refund_required_or_overpayment'})}
   await c.query('INSERT INTO camping_payments(reservation_id,kind,amount,method,reference,paid_at) VALUES($1,$2,$3,$4,$5,now())',[b.id,kind,amount,String(method||'bank_transfer').slice(0,60),String(reference||'').slice(0,100)]);
   await c.query('UPDATE camping_reservations SET deposit_paid=$1,balance_paid=$2,updated_at=now() WHERE id=$3',[nextDeposit,nextBalance,b.id]);
   await c.query('COMMIT');res.json({ok:true,deposit_paid:nextDeposit,balance_paid:nextBalance});
  }catch(e){await c.query('ROLLBACK').catch(()=>{});fail(res,e)}finally{c.release()}
 });
 return router;
};
