// ═══════════════════════════════════════════════════
//  firebase.js — إعداد Firebase + المزامنة السحابية
//  نظام سندريلا v4
// ═══════════════════════════════════════════════════

// ── إعدادات Firebase الجديدة ──
const _REAL_FB_CFG = {
apiKey: “AIzaSyCwgMofJnj7lcSZQ5swhr7jWoqG0UZ48W0”,
authDomain: “cinderella-d6fb9.firebaseapp.com”,
databaseURL: “https://cinderella-d6fb9-default-rtdb.firebaseio.com”,
projectId: “cinderella-d6fb9”,
storageBucket: “cinderella-d6fb9.firebasestorage.app”,
messagingSenderId: “596861181608”,
appId: “1:596861181608:web:044de1a08ae5e51ba06c9d”
};

function getFbCfg() {
return _REAL_FB_CFG;
}

let fbApp = null;

// ── مفاتيح المزامنة ──
const SYNC_KEYS = [‘emps’,‘att’,‘msg’,‘reports’,‘archive’,‘groupChat’,‘leaveRequests’,‘salesLog’,‘adminLogs’,‘loanRequests’,‘shiftArchives’,‘dailyShifts’];
let _fbListening = false;

function initFirebase(cfg) {
if (typeof firebase === ‘undefined’) {
_setSyncUI(‘fail’, ‘❌ SDK لم يُحمّل’);
return;
}
try {
try {
if (!firebase.apps || firebase.apps.length === 0) {
firebase.initializeApp(cfg || getFbCfg());
}
} catch(initErr) {
// already initialized — ignore
}
fbApp = firebase.apps[0];
fbDB = firebase.database();
fbSyncEnabled = true;

```
// فحص الاتصال
fbDB.ref('.info/connected').on('value', snap => {
  const online = snap.val() === true;
  _setSyncUI(online ? 'ok' : 'fail', online ? '🟢 متزامن' : '🔴 انقطع الاتصال');
});

// بدء الاستماع للتغييرات
if (!_fbListening) {
  _fbListening = true;
  _startListeners();
}

// جلب البيانات من السحابة عند الاتصال
_mergeOnConnect();
```

} catch(e) {
_setSyncUI(‘fail’, ’❌ ’ + e.message);
console.error(‘FB init error:’, e);
}
}

function _setSyncUI(state, label) {
const ss = document.getElementById(‘syncStatus’);
const sb = document.getElementById(‘syncBadge’);
const dot = document.getElementById(‘empSyncDot’);
const colors = { ok: ‘var(–green)’, fail: ‘var(–red)’, warn: ‘#ff9800’ };
const col = colors[state] || colors.warn;
if (ss) { ss.textContent = label; ss.style.color = col; }
if (sb) { sb.textContent = label; sb.style.color = col; sb.style.background = state === ‘ok’ ? ‘rgba(0,230,118,.12)’ : ‘rgba(233,69,96,.1)’; }
if (dot) { dot.style.background = col; dot.style.boxShadow = state === ‘ok’ ? ‘0 0 6px var(–green)’ : ‘none’; }
}

function _mergeOnConnect() {
if (!fbDB) return;
fbDB.ref(‘ccs’).once(‘value’).then(snap => {
const cloud = snap.val() || {};
const cloudEmpty = !cloud.emps || !Array.isArray(cloud.emps) || cloud.emps.length === 0;
if (cloudEmpty) {
*pushAllToCloud();
} else {
// السحابة تفوز — جلب كل البيانات
SYNC_KEYS.forEach(k => {
if (cloud[k] !== undefined && cloud[k] !== null) {
localStorage.setItem(’ccs2*’ + k, JSON.stringify(cloud[k]));
}
});
// تحديث الواجهة بعد الجلب
setTimeout(() => {
try {
if (CU?.role === ‘admin’) renderAdmin();
else if (CU?.role === ‘emp’) {
const e = getEmp();
if (e) { refreshEmpUI(e); renderEmpMessages(e.id); }
}
} catch(e) {}
}, 300);
}
}).catch(e => console.error(‘merge err:’, e));
}

function _pushAllToCloud() {
if (!fbDB) return;
const updates = {};
SYNC_KEYS.forEach(k => {
const v = DB.get(k);
if (v !== null && v !== undefined) updates[‘ccs/’ + k] = v;
});
if (Object.keys(updates).length > 0) {
fbDB.ref().update(updates)
.then(() => console.log(‘Local data pushed to cloud OK’))
.catch(e => console.error(‘push err:’, e));
}
}

function *startListeners() {
if (!fbDB) return;
SYNC_KEYS.forEach(key => {
fbDB.ref(‘ccs/’ + key).on(‘value’, snap => {
const v = snap.val();
if (v === null || v === undefined) return;
localStorage.setItem(’ccs2*’ + key, JSON.stringify(v));
clearTimeout(window[’*rt*’ + key]);
window[’*rt*’ + key] = setTimeout(() => {
try {
if (key === ‘emps’ || key === ‘att’) {
if (CU?.role === ‘admin’) {
if (document.getElementById(‘adminScreen’)?.classList.contains(‘active’)) renderAdmin();
} else if (CU?.role === ‘emp’) {
const emp = getEmp();
if (emp) { refreshEmpUI(emp); renderDayGrid(emp.id); renderEmpAttPattern(emp.id); updAttBtns(); updTodayStatus(emp.id); }
}
}
if (key === ‘msg’ && CU?.role === ‘emp’) {
const emp = getEmp(); if (emp) renderEmpMessages(emp.id);
playNotifSound(‘msg’);
}
if (key === ‘msg’ && CU?.role === ‘admin’) {
renderSentMessages();
const msgs = DB.get(‘msg’) || [];
const recent = msgs.filter(m => m.type === ‘reply’ && m.ts && (Date.now() - new Date(m.ts).getTime()) < 10000);
if (recent.length > 0) playNotifSound(‘msg’);
}
if (key === ‘att’ && CU?.role === ‘admin’) {
const att = DB.get(‘att’) || [];
const recent = att.filter(a => a.ts && (Date.now() - new Date(a.ts).getTime()) < 10000);
if (recent.length > 0) {
recent.forEach(a => {
if (a.type === ‘ci’) showToast(`✅ ${a.ename} سجّل الحضور — ${a.time}`, ‘s’);
else showToast(`🚪 ${a.ename} سجّل الانصراف — ${a.time}`, ‘i’);
});
playNotifSound(‘in’);
}
}
} catch(e) {}
}, 300);
});
});
}

// كتابة فورية للسحابة عند أي تغيير
function _syncToCloud(key, value) {
if (!fbDB || !fbSyncEnabled) return;
fbDB.ref(‘ccs/’ + key).set(value)
.catch(e => {
console.error(‘sync write err:’, key, e.code, e.message);
_setSyncUI(‘fail’, ’❌ خطأ كتابة: ’ + e.code);
});
}

// ── Firebase UI (إعدادات من الواجهة) ──
function saveAndInitFirebase() {
const url = document.getElementById(‘fbDatabaseURL’)?.value.trim();
const key = document.getElementById(‘fbApiKey’)?.value.trim();
const pid = document.getElementById(‘fbProjectId’)?.value.trim();
const aid = document.getElementById(‘fbAppId’)?.value.trim();
if (!url || !key || !pid) { showToast(‘أدخل Database URL و API Key و Project ID’, ‘e’); return; }
const cfg = { apiKey: key, authDomain: pid + ‘.firebaseapp.com’, databaseURL: url, projectId: pid, storageBucket: pid + ‘.appspot.com’, appId: aid || ‘’, messagingSenderId: ‘’ };
localStorage.setItem(‘ccs2_fbcfg’, JSON.stringify(cfg));
const msg = document.getElementById(‘fbStatusMsg’);
if (msg) msg.textContent = ‘⏳ جاري الاتصال…’;
fbApp = null; fbDB = null; fbSyncEnabled = false;
try { if (firebase.apps && firebase.apps.length) firebase.apps[0].delete(); } catch(e) {}
setTimeout(() => {
initFirebase(cfg);
const msg2 = document.getElementById(‘fbStatusMsg’);
if (msg2) msg2.textContent = fbSyncEnabled ? ‘✅ تم الاتصال بنجاح!’ : ‘❌ فشل الاتصال’;
updateSyncBadge();
}, 2000);
showToast(‘⏳ جاري تفعيل المزامنة…’, ‘i’);
}

function testFirebase() {
if (!fbSyncEnabled || !fbDB) { showToast(‘فعّل المزامنة أولاً’, ‘e’); return; }
fbDB.ref(‘ccs/test’).set({ t: Date.now(), msg: ‘اختبار سندريلا’ })
.then(() => showToast(‘✅ اتصال Firebase يعمل!’, ‘s’))
.catch(e => showToast(’❌ خطأ: ’ + e.message, ‘e’));
}

function clearFirebaseConfig() {
if (!confirm(‘إلغاء المزامنة؟’)) return;
localStorage.removeItem(‘ccs2_fbcfg’);
fbApp = null; fbDB = null; fbSyncEnabled = false;
updateSyncBadge();
showToast(‘تم إلغاء المزامنة’, ‘i’);
}

function forcePushToCloud() {
if (!fbDB) {
showToast(‘⏳ جاري الاتصال…’, ‘i’);
initFirebase(_REAL_FB_CFG);
setTimeout(() => {
if (fbSyncEnabled) forcePushToCloud();
else showToast(‘❌ تعذّر الاتصال’, ‘e’);
}, 2000);
return;
}
const updates = {};
SYNC_KEYS.forEach(k => { const v = DB.get(k); if (v !== null && v !== undefined) updates[‘ccs/’ + k] = v; });
showToast(‘⏳ جاري رفع البيانات…’, ‘i’);
fbDB.ref().update(updates)
.then(() => showToast(‘✅ تم رفع كل البيانات للسحابة!’, ‘s’))
.catch(e => showToast(’❌ خطأ: ’ + e.message, ‘e’));
}

function updateSyncBadge() {
const badge = document.getElementById(‘syncBadge’);
const status = document.getElementById(‘syncStatus’);
if (fbSyncEnabled) {
if (badge) { badge.textContent = ‘🟢 مفعّل’; badge.style.background = ‘rgba(0,230,118,.12)’; badge.style.color = ‘var(–green)’; }
if (status) { status.textContent = ‘🟢 متزامن’; status.style.color = ‘var(–green)’; }
} else {
if (badge) { badge.textContent = ‘⚠️ غير مفعّل’; badge.style.background = ‘rgba(255,152,0,.12)’; badge.style.color = ‘#ff9800’; }
if (status) { status.textContent = ‘🔄 محلي’; status.style.color = ‘var(–t3)’; }
}
}

function loadFbInputs() {
const cfg = getFbCfg();
if (!cfg) return;
const u = document.getElementById(‘fbDatabaseURL’);
const k = document.getElementById(‘fbApiKey’);
const p = document.getElementById(‘fbProjectId’);
const a = document.getElementById(‘fbAppId’);
if (u) u.value = cfg.databaseURL || ‘’;
if (k) k.value = cfg.apiKey || ‘’;
if (p) p.value = cfg.projectId || ‘’;
if (a) a.value = cfg.appId || ‘’;
}