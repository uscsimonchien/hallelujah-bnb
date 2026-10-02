(() => {
  const TOTAL_ROOMS = 4;
  const WEEKDAY_RATE = 1600;
  const WEEKEND_RATE = 2000;
  const DEPOSIT_RATE = 0.30;
  const STORAGE_KEY = 'hallelujah_booking_requests_v1';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const fromIso = (s) => {
    if (!s) return null;
    const [y,m,d] = s.split('-').map(Number);
    return new Date(y, m-1, d, 12, 0, 0, 0);
  };
  const fmt = (n) => `NT$${Number(n || 0).toLocaleString('zh-TW')}`;
  const today = new Date(); today.setHours(12,0,0,0);

  const form = $('#bookingForm');
  if (!form) return;
  const checkinEl = $('#bookingCheckin');
  const checkoutEl = $('#bookingCheckout');
  const roomsEl = $('#bookingRooms');
  const guestsEl = $('#bookingGuests');
  const calendarGrid = $('#bookingCalendar');
  const monthTitle = $('#calendarMonthTitle');
  const prevBtn = $('#calendarPrev');
  const nextBtn = $('#calendarNext');
  const alertBox = $('#availabilityAlert');
  const submitBtn = $('#bookingSubmit');
  const resultBox = $('#bookingResult');

  let shownMonth = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  let checkin = null;
  let checkout = null;

  const loadOrders = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  };
  const saveOrders = (orders) => localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  const nightRate = (d) => {
    const day = d.getDay();
    return (day === 0 || day === 6) ? WEEKEND_RATE : WEEKDAY_RATE;
  };

  const datesBetween = (start, end) => {
    const arr = [];
    if (!start || !end || end <= start) return arr;
    const d = new Date(start);
    while (d < end) {
      arr.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  };

  const orderOverlapsDate = (order, date) => {
    const s = fromIso(order.checkin);
    const e = fromIso(order.checkout);
    if (!s || !e) return false;
    return date >= s && date < e && order.status !== '已取消';
  };

  const bookedRoomsOn = (date) => loadOrders().reduce((sum, order) => {
    return sum + (orderOverlapsDate(order, date) ? Number(order.rooms || 0) : 0);
  }, 0);

  const availableRoomsOn = (date) => Math.max(0, TOTAL_ROOMS - bookedRoomsOn(date));

  const minAvailability = (start, end) => {
    const nights = datesBetween(start, end);
    if (!nights.length) return TOTAL_ROOMS;
    return Math.min(...nights.map(availableRoomsOn));
  };

  const isInSelectedRange = (d) => checkin && checkout && d > checkin && d < checkout;
  const sameDate = (a,b) => a && b && iso(a) === iso(b);

  function renderCalendar(){
    monthTitle.textContent = `${shownMonth.getFullYear()} 年 ${shownMonth.getMonth()+1} 月`;
    calendarGrid.innerHTML = '';

    const first = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), 1, 12);
    const offset = first.getDay();
    const start = new Date(first); start.setDate(first.getDate() - offset);

    for(let i=0;i<42;i++){
      const d = new Date(start); d.setDate(start.getDate()+i);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      if(d.getMonth() !== shownMonth.getMonth()) btn.classList.add('other');
      const isPast = d < today;
      const avail = availableRoomsOn(d);
      if(isPast){ btn.classList.add('past'); btn.disabled = true; }
      if(avail <= 0 && !isPast){ btn.classList.add('full'); btn.disabled = true; }
      if(isInSelectedRange(d)) btn.classList.add('in-range');
      if(sameDate(d, checkin) || sameDate(d, checkout)) btn.classList.add('selected');

      btn.innerHTML = `<span class="cal-date">${d.getDate()}</span><span class="cal-stock">${avail > 0 ? `可訂 ${avail} 間` : '已滿'}</span><span class="cal-rate">${fmt(nightRate(d))}</span>`;
      btn.addEventListener('click', () => selectDate(d));
      calendarGrid.appendChild(btn);
    }
  }

  function selectDate(d){
    const clicked = new Date(d); clicked.setHours(12,0,0,0);
    if (!checkin || (checkin && checkout)) {
      checkin = clicked;
      checkout = null;
    } else if (clicked <= checkin) {
      checkin = clicked;
      checkout = null;
    } else {
      checkout = clicked;
    }
    checkinEl.value = checkin ? iso(checkin) : '';
    checkoutEl.value = checkout ? iso(checkout) : '';
    updateSummary();
    renderCalendar();
  }

  function calc(){
    const rooms = Number(roomsEl.value || 1);
    const guests = Number(guestsEl.value || 0);
    const nights = datesBetween(checkin, checkout);
    const subtotal = nights.reduce((sum,d)=>sum + nightRate(d) * rooms, 0);
    const deposit = Math.round(subtotal * DEPOSIT_RATE);
    const balance = subtotal - deposit;
    const availability = (checkin && checkout) ? minAvailability(checkin, checkout) : TOTAL_ROOMS;
    return {rooms, guests, nights, subtotal, deposit, balance, availability};
  }

  function updateSummary(){
    const c = calc();
    $('#sumDates').textContent = checkin && checkout ? `${iso(checkin)} → ${iso(checkout)}` : '請選擇日期';
    $('#sumNights').textContent = c.nights.length ? `${c.nights.length} 晚` : '—';
    $('#sumRooms').textContent = `${c.rooms} 間`;
    $('#sumGuests').textContent = c.guests ? `${c.guests} 人` : '—';
    $('#sumTotal').textContent = c.subtotal ? fmt(c.subtotal) : '—';
    $('#sumDeposit').textContent = c.deposit ? `${fmt(c.deposit)}（30%）` : '—';
    $('#sumBalance').textContent = c.balance ? fmt(c.balance) : '—';

    let message = '請先選擇入住與退房日期。';
    let warn = false;
    let valid = !!(checkin && checkout && checkout > checkin && c.guests > 0 && c.rooms > 0);
    if(checkin && checkout){
      if(c.rooms > c.availability){ message = `這段日期目前本裝置紀錄僅剩 ${c.availability} 間，請調整房間數。`; warn = true; valid = false; }
      else message = `此日期區間目前可安排 ${c.availability} 間；您選擇 ${c.rooms} 間。`;
      if(c.guests > c.rooms * 4){ message = `${c.rooms} 間最多建議 ${c.rooms*4} 人入住，請增加房間數。`; warn = true; valid = false; }
      if(c.guests > 16){ message = '全區住宿上限為 16 人。'; warn = true; valid = false; }
    }
    alertBox.textContent = message;
    alertBox.classList.toggle('warn', warn);
    submitBtn.disabled = !valid;
  }

  function makeCode(){
    const now = new Date();
    const rand = Math.floor(1000 + Math.random()*9000);
    return `HL${String(now.getFullYear()).slice(-2)}${pad(now.getMonth()+1)}${pad(now.getDate())}${rand}`;
  }

  function buildLineMessage(order){
    return [
      '您好，我已從哈雷露亞民宿官網建立預訂申請：',
      `預訂編號：${order.code}`,
      `姓名：${order.name}`,
      `電話：${order.phone}`,
      `入住：${order.checkin}`,
      `退房：${order.checkout}`,
      `住宿：${order.nights} 晚／${order.rooms} 間／${order.guests} 人`,
      `預估總額：${fmt(order.total)}`,
      `預估訂金 30%：${fmt(order.deposit)}`,
      `備註：${order.note || '無'}`,
      '請協助確認實際房況與訂房資料，謝謝。'
    ].join('\n');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const c = calc();
    if(submitBtn.disabled) return;
    const fd = new FormData(form);
    const order = {
      code: makeCode(),
      createdAt: new Date().toISOString(),
      status: '待民宿確認',
      name: String(fd.get('name') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      lineName: String(fd.get('lineName') || '').trim(),
      checkin: iso(checkin), checkout: iso(checkout),
      nights: c.nights.length, rooms: c.rooms, guests: c.guests,
      total: c.subtotal, deposit: c.deposit, balance: c.balance,
      note: String(fd.get('note') || '').trim()
    };
    if(!order.name || !order.phone){
      alert('請填寫姓名與聯絡電話。'); return;
    }
    const orders = loadOrders(); orders.push(order); saveOrders(orders);

    $('#resultCode').textContent = order.code;
    $('#resultText').innerHTML = `已建立 <strong>待確認預訂申請</strong>。<br>${order.checkin} → ${order.checkout}，${order.nights} 晚、${order.rooms} 間、${order.guests} 人。<br>預估總額 ${fmt(order.total)}，預估訂金 ${fmt(order.deposit)}。`;
    resultBox.classList.add('show');
    resultBox.scrollIntoView({behavior:'smooth', block:'center'});

    const msg = buildLineMessage(order);
    $('#copyBooking').onclick = async () => {
      try { await navigator.clipboard.writeText(msg); alert('已複製預訂內容。'); }
      catch { alert('複製失敗，請手動複製。'); }
    };
    $('#sendBookingLine').onclick = () => window.open(`https://line.me/R/msg/text/?${encodeURIComponent(msg)}`, '_blank');
    renderCalendar();
    updateSummary();
  });

  [roomsEl, guestsEl].forEach(el => el.addEventListener('change', updateSummary));
  checkinEl.min = iso(today);
  checkoutEl.min = iso(new Date(today.getFullYear(),today.getMonth(),today.getDate()+1,12));
  checkinEl.addEventListener('change', () => {
    checkin = fromIso(checkinEl.value);
    if(checkin){ const minOut = new Date(checkin); minOut.setDate(minOut.getDate()+1); checkoutEl.min = iso(minOut); }
    if(checkout && checkin && checkout <= checkin){ checkout = null; checkoutEl.value=''; }
    shownMonth = checkin ? new Date(checkin.getFullYear(), checkin.getMonth(), 1, 12) : shownMonth;
    updateSummary(); renderCalendar();
  });
  checkoutEl.addEventListener('change', () => { checkout = fromIso(checkoutEl.value); updateSummary(); renderCalendar(); });
  prevBtn.addEventListener('click', () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth()-1, 1,12); renderCalendar(); });
  nextBtn.addEventListener('click', () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth()+1, 1,12); renderCalendar(); });

  renderCalendar();
  updateSummary();
})();
