// ═══════════════════════════════════════════════════
//  db.js — قاعدة البيانات المحلية (localStorage) + Helpers
//  نظام سندريلا v4
//  ⚠️  Firebase يجلب البيانات الحقيقية — لا موظفين افتراضيين هنا
// ═══════════════════════════════════════════════════

// ── قاعدة البيانات المحلية ──
let fbDB = null, fbSyncEnabled = false;

const DB = {
get(k) {
try { return JSON.parse(localStorage.getItem(‘ccs2_’ + k)); }
catch { return null; }
},
set(k, v) {
localStorage.setItem(‘ccs2_’ + k, JSON.stringify(v));
if (typeof SYNC_KEYS !== ‘undefined’ && SYNC_KEYS.includes(k) && typeof _syncToCloud === ‘function’)
*syncToCloud(k, v);
},
del(k) { localStorage.removeItem(’ccs2*’ + k); }
};

// ── دوال المساعدة العامة ──
function todayStr() { return new Date().toISOString().split(‘T’)[0]; }
function fmtN(n) { return (n || 0).toLocaleString(‘ar-IQ’); }
function fmtNS(n) { if (n >= 1000000) return (n / 1000000).toFixed(1) + ‘M’; if (n >= 1000) return Math.round(n / 1000) + ‘K’; return fmtN(n); }
function fmtT(d) { return d.toLocaleTimeString(‘ar-IQ’, { hour: ‘2-digit’, minute: ‘2-digit’, hour12: true }); }
function fmtD(s) { try { return new Date(s + ‘T00:00:00’).toLocaleDateString(‘ar-IQ’, { weekday: ‘short’, day: ‘numeric’, month: ‘short’ }); } catch { return s; } }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function calcDist(la1, lo1, la2, lo2) {
const R = 6371000, dL = (la2 - la1) * Math.PI / 180, dO = (lo2 - lo1) * Math.PI / 180;
const a = Math.sin(dL / 2) ** 2 + Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dO / 2) ** 2;
return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── تهيئة البيانات الافتراضية ──
// ⚠️  لا نضيف موظفين افتراضيين — Firebase يجلب البيانات الحقيقية
function initData() {
if (!DB.get(‘adminCreds’)) DB.set(‘adminCreds’, { u: _d(‘41,59,48,48,59,62,5,59,62,55,51,52’), pw: _d(‘27,62,55,51,52,26,104,106,104,111’) });
if (!DB.get(‘tgId’)) DB.set(‘tgId’, TG_CHAT_DEFAULT);
// باقي المفاتيح تُملأ من Firebase عند الاتصال
if (!DB.get(‘att’)) DB.set(‘att’, []);
if (!DB.get(‘msg’)) DB.set(‘msg’, []);
if (!DB.get(‘reports’)) DB.set(‘reports’, []);
if (!DB.get(‘archive’)) DB.set(‘archive’, { periods: [], snapshots: {} });
if (!DB.get(‘groupChat’)) DB.set(‘groupChat’, []);
if (!DB.get(‘leaveRequests’)) DB.set(‘leaveRequests’, []);
if (!DB.get(‘salesLog’)) DB.set(‘salesLog’, []);
if (!DB.get(‘adminLogs’)) DB.set(‘adminLogs’, []);
// emps لا تُضاف هنا — تأتي من Firebase
}
