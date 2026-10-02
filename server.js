const express=require('express');
const cors=require('cors');
const {Pool}=require('pg');
const app=express();
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
const TOTAL=4,WD=1600,WE=2000,HOLD_HOURS=2;
app.use(cors({origin:true}));
app.use(express.json());

const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||''));
const rate=s=>{const d=new Date(s+'T12:00:00+08:00'),w=d.getDay();return (w===0||w===6)?WE:WD};
const nights=(a,b)=>{const out=[];for(let d=new Date(a+'T12:00:00+08:00'),e=new Date(b+'T12:00:00+08:00');d<e;d.setDate(d.getDate()+1))out.push(d.toISOString().slice(0,10));return out};
const code=()=>`HL${new Date().toISOString().slice(2,10).replaceAll('-','')}${Math.floor(100000+Math.random()*900000)}`;

async function init(){
 await pool.query(`CREATE TABLE IF NOT EXISTS bookings(
 id BIGSERIAL PRIMARY KEY,code TEXT UNIQUE NOT NULL,created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW(),
 status TEXT NOT NULL DEFAULT 'pending',hold_expires_at TIMESTAMPTZ,name TEXT NOT NULL,phone TEXT NOT NULL,line_name TEXT,
 checkin DATE NOT NULL,checkout DATE NOT NULL,nights INT NOT NULL,rooms INT NOT NULL,guests INT NOT NULL,total INT NOT NULL,deposit INT NOT NULL,balance INT NOT NULL,note TEXT);
 CREATE INDEX IF NOT EXISTS bookings_dates_idx ON bookings(checkin,checkout);`);
}

async function bookedOn(client,date,excludeId=0){
 const q=await client.query(`SELECT COALESCE(SUM(rooms),0)::int AS n FROM bookings
 WHERE id<>$2 AND checkin<=$1::date AND checkout>$1::date
 AND (status IN ('confirmed','paid') OR (status='pending' AND hold_expires_at>NOW()))`,[date,excludeId]);
 return Number(q.rows[0].n||0);
}
async function minAvail(client,a,b,excludeId=0){
 const ns=nights(a,b);let min=TOTAL;
 for(const d of ns) min=Math.min(min,TOTAL-await bookedOn(client,d,excludeId));
 return min;
}
function admin(req,res,next){if(req.get('x-admin-key')!==process.env.ADMIN_KEY)return res.status(401).json({error:'unauthorized'});next()}

app.get('/health',async(_q,res)=>{try{await pool.query('SELECT 1');res.json({ok:true})}catch(e){res.status(500).json({ok:false})}});
app.get('/api/availability',async(req,res)=>{
 try{
  const {from,to}=req.query;if(!validDate(from)||!validDate(to))return res.status(400).json({error:'invalid_dates'});
  const days=[];for(let d=new Date(from+'T12:00:00+08:00'),e=new Date(to+'T12:00:00+08:00');d<=e;d.setDate(d.getDate()+1)){
   const s=d.toISOString().slice(0,10);days.push({date:s,available:TOTAL-await bookedOn(pool,s),rate:rate(s)});
  }
  res.json({totalRooms:TOTAL,dates:days});
 }catch(e){console.error(e);res.status(500).json({error:'server_error'})}
});

app.post('/api/bookings',async(req,res)=>{
 const c=await pool.connect();
 try{
  const b=req.body||{},r=Number(b.rooms),g=Number(b.guests);
  if(!b.name||!b.phone||!validDate(b.checkin)||!validDate(b.checkout)||r<1||r>4||g<1||g>16||g>r*4)return res.status(400).json({error:'invalid_booking'});
  const ns=nights(b.checkin,b.checkout);if(!ns.length||ns.length>30)return res.status(400).json({error:'invalid_dates'});
  await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(5332026)');
  const avail=await minAvail(c,b.checkin,b.checkout);if(r>avail){await c.query('ROLLBACK');return res.status(409).json({error:'sold_out',available:avail})}
  const total=ns.reduce((s,d)=>s+rate(d)*r,0),deposit=Math.round(total*.3),balance=total-deposit,id=code();
  const q=await c.query(`INSERT INTO bookings(code,status,hold_expires_at,name,phone,line_name,checkin,checkout,nights,rooms,guests,total,deposit,balance,note)
  VALUES($1,'pending',NOW()+INTERVAL '2 hours',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
  RETURNING id,code,status,hold_expires_at,checkin,checkout,nights,rooms,guests,total,deposit,balance`,
  [id,String(b.name).trim(),String(b.phone).trim(),String(b.lineName||'').trim(),b.checkin,b.checkout,ns.length,r,g,total,deposit,balance,String(b.note||'').trim()]);
  await c.query('COMMIT');res.status(201).json({booking:q.rows[0],holdHours:HOLD_HOURS});
 }catch(e){try{await c.query('ROLLBACK')}catch{}console.error(e);res.status(500).json({error:'server_error'})}finally{c.release()}
});

app.get('/api/admin/bookings',admin,async(_q,res)=>{
 try{const q=await pool.query(`SELECT * FROM bookings WHERE checkout>=CURRENT_DATE-INTERVAL '30 days' ORDER BY created_at DESC LIMIT 500`);res.json({bookings:q.rows})}
 catch(e){res.status(500).json({error:'server_error'})}
});
app.patch('/api/admin/bookings/:id',admin,async(req,res)=>{
 const c=await pool.connect();
 try{
  const id=Number(req.params.id),st=String(req.body?.status||'');if(!['pending','confirmed','paid','cancelled'].includes(st))return res.status(400).json({error:'invalid_status'});
  await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(5332026)');const q=await c.query('SELECT * FROM bookings WHERE id=$1 FOR UPDATE',[id]);if(!q.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'not_found'})}
  const b=q.rows[0];if(st==='confirmed'||st==='paid'){const av=await minAvail(c,b.checkin.toISOString().slice(0,10),b.checkout.toISOString().slice(0,10),id);if(b.rooms>av){await c.query('ROLLBACK');return res.status(409).json({error:'sold_out',available:av})}}
  const hold=st==='pending'?"NOW()+INTERVAL '2 hours'":'NULL';const u=await c.query(`UPDATE bookings SET status=$1,hold_expires_at=${hold},updated_at=NOW() WHERE id=$2 RETURNING id,code,status,hold_expires_at`,[st,id]);await c.query('COMMIT');res.json({booking:u.rows[0]});
 }catch(e){try{await c.query('ROLLBACK')}catch{}res.status(500).json({error:'server_error'})}finally{c.release()}
});

app.listen(process.env.PORT||10000,()=>init().then(()=>console.log('booking api ready')).catch(e=>{console.error(e);process.exit(1)}));
