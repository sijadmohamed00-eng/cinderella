// ═══════════════════════════════════════════════════
//  manual_att.js — شبكة الحضور + الحضور اليدوي
//  نظام سندريلا v4
//  إصلاح: الأيام من 1 إلى آخر يوم بالشهر فقط
//  إصلاح: الحضور يُحسب بتاريخ الدخول (CI) فقط
// ═══════════════════════════════════════════════════

// ── شبكة الحضور الشهري (لوحة المدير) ──
function renderMonthAttGrid(emps, att, ps, pe, today) {
const grid  = document.getElementById(‘monthAttGrid’);
const badge = document.getElementById(‘monthAttBadge’);
if (!grid) return;

const leaveDays = DB.get(‘leaveDays’) || [];
const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();

// من اليوم 1 إلى آخر يوم في الشهر الحالي فقط
const firstDay = new Date(y, m, 1);
const lastDay  = new Date(y, m + 1, 0); // آخر يوم بالشهر

const days = [];
let cur = new Date(firstDay);
while (cur <= lastDay) {
days.push(cur.toISOString().split(‘T’)[0]);
cur.setDate(cur.getDate() + 1);
}

let totalPresent = 0, totalLeave = 0;

const dayStats = days.map(d => {
// الحضور بتاريخ الدخول (CI) فقط — لا علاقة بتاريخ الانصراف
const pres = emps.filter(e =>
att.some(a => a.eid === e.id && a.date === d && a.type === ‘ci’)
).length;
const onLeave = emps.filter(e =>
leaveDays.some(l => l.eid === e.id && l.date === d)
).length;
if (d <= today) { totalPresent += pres; totalLeave += onLeave; }
return { d, pres, onLeave };
});

const passedDays = days.filter(d => d <= today).length;
if (badge) badge.textContent = totalPresent + ’ تسجيل حضور في ’ + passedDays + ’ يوم’;

grid.innerHTML = dayStats.map(({ d, pres, onLeave }) => {
const isFuture = d > today;
const dayNum   = parseInt(d.split(’-’)[2]);
let bg, color, title;
if (isFuture) {
bg = ‘var(–bg3)’; color = ‘var(–t3)’; title = d;
} else if (pres === emps.length && emps.length > 0) {
bg = ‘rgba(0,230,118,.25)’; color = ‘var(–green)’; title = d + ’ — الكل حضروا’;
} else if (pres > 0) {
bg = ‘rgba(240,192,64,.2)’; color = ‘var(–gold)’; title = d + ’ — ’ + pres + ‘/’ + emps.length;
} else if (onLeave > 0) {
bg = ‘rgba(206,147,216,.25)’; color = ‘var(–purple)’; title = d + ’ — ’ + onLeave + ’ مجاز’;
} else {
bg = ‘var(–bg3)’; color = ‘var(–t3)’; title = d;
}
return ‘<div title="' + title + '" style="width:30px;height:30px;border-radius:6px;background:' + bg + ';color:' + color + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;cursor:default">’ + dayNum + ‘</div>’;
}).join(’’);
}

// ── شبكة أيام الموظف الفردي ──
function renderDayGrid(eid) {
const c = document.getElementById(‘empDG’); if (!c) return;
const att       = DB.get(‘att’) || [];
const leaveDays = DB.get(‘leaveDays’) || [];
const now       = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
const today = todayStr();
const days = [];
let cur = new Date(monthStart);
while (cur <= monthEnd) {
const ds = cur.toISOString().split(‘T’)[0];
const future  = ds > today;
// الحضور بتاريخ الدخول فقط
const hasCI   = att.some(a => a.eid === eid && a.date === ds && a.type === ‘ci’);
const isLeave = leaveDays.some(l => l.eid === eid && l.date === ds)
|| att.some(a => a.eid === eid && a.date === ds && a.type === ‘leave’);
const cls = future ? ‘f’ : hasCI ? ‘p’ : isLeave ? ‘lv’ : ‘f’;
days.push(’<div class="dc ' + cls + '" title="' + fmtD(ds) + '">’ + cur.getDate() + ‘</div>’);
cur.setDate(cur.getDate() + 1);
}
c.innerHTML = days.join(’’);
}

// ── نقاط الحضور (الموظف) ──
function renderEmpAttPattern(eid) {
const c = document.getElementById(‘empAttPattern’); if (!c) return;
const att       = DB.get(‘att’) || [];
const leaveDays = DB.get(‘leaveDays’) || [];
const now = new Date(), y = now.getFullYear(), m = now.getMonth();
const monthStart = new Date(y, m, 1);
const monthEnd   = new Date(y, m + 1, 0);
const today = new Date(); today.setHours(23, 59, 59);
let cur = new Date(monthStart);
const dots = [];
while (cur <= monthEnd) {
const ds = cur.toISOString().split(‘T’)[0];
const future  = cur > today;
// الحضور بتاريخ الدخول فقط
const has     = att.some(a => a.eid === eid && a.date === ds && a.type === ‘ci’);
const isLeave = leaveDays.some(l => l.eid === eid && l.date === ds)
|| att.some(a => a.eid === eid && a.date === ds && a.type === ‘leave’);
const cls = future ? ‘future’ : has ? ‘present’ : isLeave ? ‘on-leave’ : ‘future’;
dots.push(’<div class="att-dot ' + cls + '" title="' + cur.toLocaleDateString('ar-IQ') + '">’ + cur.getDate() + ‘</div>’);
cur.setDate(cur.getDate() + 1);
}
c.innerHTML = dots.join(’’);
}

// ── Badges الإشعارات ──
function updatePendingBadges() {
const leaves = (DB.get(‘leaveRequests’) || []).filter(r => r.status === ‘pending’).length;
const loans  = (DB.get(‘loanRequests’)  || []).filter(r => r.status === ‘pending’).length;
[‘leaveBadge’,‘leaveNavBadge’].forEach(id => {
const el = document.getElementById(id);
if (el) { el.textContent = leaves || ‘’; el.style.display = leaves ? ‘flex’ : ‘none’; }
});
[‘loanBadge’,‘loanNavBadge’].forEach(id => {
const el = document.getElementById(id);
if (el) { el.textContent = loans || ‘’; el.style.display = loans ? ‘flex’ : ‘none’; }
});
const nb = document.getElementById(‘notifBadgeTotal’);
if (nb) { const t = leaves + loans; nb.textContent = t || ‘’; nb.style.display = t ? ‘flex’ : ‘none’; }
}

function _setBadge(id, count) {
const el = document.getElementById(id);
if (!el) return;
el.textContent = count || ‘’;
el.setAttribute(‘data-v’, count || 0);
el.style.display = count ? ‘flex’ : ‘none’;
}

// ── الحضور اليدوي (فردي) ──
function _populateManAttEmps() {
const sel = document.getElementById(‘manAttEmp’); if (!sel) return;
const emps = DB.get(‘emps’) || [];
sel.innerHTML = ‘<option value="">اختر موظف…</option>’ +
emps.map(e => ‘<option value="' + e.id + '">’ + e.name + ‘</option>’).join(’’);
}

function adminManualAtt() {
const eid  = document.getElementById(‘manAttEmp’)?.value;
const date = document.getElementById(‘manAttDate’)?.value;
const tin  = document.getElementById(‘manAttIn’)?.value  || ‘09:00’;
const tout = document.getElementById(‘manAttOut’)?.value || ‘’;
if (!eid || !date) { showToast(‘اختر الموظف والتاريخ’, ‘e’); return; }
const emps = DB.get(‘emps’) || [];
const emp  = emps.find(e => e.id === eid); if (!emp) return;
const att  = DB.get(‘att’) || [];
const alreadyCI = att.find(a => a.eid === eid && a.date === date && a.type === ‘ci’);
if (alreadyCI) { showToast(‘يوجد تسجيل حضور لهذا اليوم مسبقاً’, ‘e’); return; }
// تسجيل الحضور (CI) — بتاريخ الدخول
att.push({ id: genId(), eid, ename: emp.name, type: ‘ci’, date, time: tin, ts: date + ‘T’ + tin + ‘:00’, dist: 0, isManual: true });
// تسجيل الانصراف (CO) إذا موجود — بنفس تاريخ الدخول
if (tout) {
const inDt  = new Date(date + ‘T’ + tin  + ‘:00’);
let   outDt = new Date(date + ‘T’ + tout + ‘:00’);
if (outDt <= inDt) outDt.setDate(outDt.getDate() + 1); // عابر للمنتصف
const mins = Math.round((outDt - inDt) / 60000);
att.push({ id: genId(), eid, ename: emp.name, type: ‘co’, date, time: tout, ts: outDt.toISOString(), dist: 0, durMins: mins, isManual: true });
}
DB.set(‘att’, att);
addAdminLog(‘check_in’, ’حضور يدوي: ’ + emp.name + ’ — ’ + date, { eid, date });
renderAdmin();
showToast(’✅ تم تسجيل الحضور ليدوياً لـ ’ + emp.name, ‘s’);
}

// ── الحضور اليدوي (متعدد الأيام) ──
function adminManualAttMulti() {
const eid = document.getElementById(‘manAttMultiEmp’)?.value;
if (!eid) { showToast(‘اختر الموظف’, ‘e’); return; }
const checks = document.querySelectorAll(’.manAttDayCheck:checked’);
if (!checks.length) { showToast(‘اختر يوماً واحداً على الأقل’, ‘e’); return; }
const tin  = document.getElementById(‘manAttMultiIn’)?.value  || ‘09:00’;
const tout = document.getElementById(‘manAttMultiOut’)?.value || ‘’;
const emps = DB.get(‘emps’) || [];
const emp  = emps.find(e => e.id === eid); if (!emp) return;
const att  = DB.get(‘att’) || [];
let added  = 0;
checks.forEach(ch => {
const date = ch.value;
if (att.find(a => a.eid === eid && a.date === date && a.type === ‘ci’)) return;
att.push({ id: genId(), eid, ename: emp.name, type: ‘ci’, date, time: tin, ts: date + ‘T’ + tin + ‘:00’, dist: 0, isManual: true });
if (tout) {
const inDt  = new Date(date + ‘T’ + tin  + ‘:00’);
let   outDt = new Date(date + ‘T’ + tout + ‘:00’);
if (outDt <= inDt) outDt.setDate(outDt.getDate() + 1);
const mins = Math.round((outDt - inDt) / 60000);
att.push({ id: genId(), eid, ename: emp.name, type: ‘co’, date, time: tout, ts: outDt.toISOString(), dist: 0, durMins: mins, isManual: true });
}
added++;
});
DB.set(‘att’, att);
addAdminLog(‘check_in’, ‘حضور يدوي متعدد: ’ + emp.name + ’ — ’ + added + ’ يوم’, { eid, count: added });
renderAdmin();
showToast(’✅ تم تسجيل ’ + added + ’ يوم لـ ’ + emp.name, ‘s’);
}

function selectAllMultiDays()  { document.querySelectorAll(’.manAttDayCheck’).forEach(c => c.checked = true); }
function clearAllMultiDays()   { document.querySelectorAll(’.manAttDayCheck’).forEach(c => c.checked = false); }

function confirmManualAttMulti() {
const eid = document.getElementById(‘manAttMultiEmp’)?.value;
if (!eid) { showToast(‘اختر الموظف’, ‘e’); return; }
const checks = document.querySelectorAll(’.manAttDayCheck:checked’);
if (!checks.length) { showToast(‘اختر أياماً’, ‘e’); return; }
adminManualAttMulti();
closeModal(‘manAttMultiModal’);
}