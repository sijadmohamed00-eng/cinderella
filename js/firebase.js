// ═══ firebase.js ═══
// ═══ FIREBASE REALTIME SYNC ═══
// ═══ FIREBASE CONFIG (REAL - call-centar-554a8) ═══
const _REAL_FB_CFG={
  apiKey:"AIzaSyBRUWmt_Oe1nI9SWSbq_GwXGFMgXALWlLM",
  authDomain:"call-centar-554a8.firebaseapp.com",
  databaseURL:"https://call-centar-554a8-default-rtdb.firebaseio.com",
  projectId:"call-centar-554a8",
  storageBucket:"call-centar-554a8.firebasestorage.app",
  messagingSenderId:"370604613719",
  appId:"1:370604613719:web:325db30f3d9b8a666c0312",
  measurementId:"G-YXM98JS1Y2"
};

function getFbCfg(){
  // Always use the real project config
  return _REAL_FB_CFG;
}

let fbApp=null;
// ════════════════════════════════════════════
//  FIREBASE SYNC — COMPLETE REWRITE
// ════════════════════════════════════════════
const SYNC_KEYS=['emps','att','msg','reports','archive','groupChat','leaveRequests','salesLog','adminLogs','loanRequests','shiftArchives','dailyShifts'];
let _fbListening=false;

function initFirebase(cfg){
  if(typeof firebase==='undefined'){
    _setSyncUI('fail','❌ SDK لم يُحمّل');
    return;
  }
  try{
    // Init app once — safe check
    try{
      if(!firebase.apps||firebase.apps.length===0){
        firebase.initializeApp(cfg||getFbCfg());
      }
    }catch(initErr){
      // already initialized — ignore
    }
    fbApp=firebase.apps[0];
    fbDB=firebase.database();
    fbSyncEnabled=true;

    // Test connection
    fbDB.ref('.info/connected').on('value', snap=>{
      const online=snap.val()===true;
      _setSyncUI(online?'ok':'fail', online?'🟢 متزامن':'🔴 انقطع الاتصال');
    });

    // Start listening for remote changes
    if(!_fbListening){
      _fbListening=true;
      _startListeners();
    }

    // On first connect: pull cloud data then push local if cloud empty
    _mergeOnConnect();

  }catch(e){
    _setSyncUI('fail','❌ '+e.message);
    console.error('FB init error:',e);
  }
}

function _setSyncUI(state, label){
  const ss=document.getElementById('syncStatus');
  const sb=document.getElementById('syncBadge');
  const dot=document.getElementById('empSyncDot');
  const colors={ok:'var(--green)',fail:'var(--red)',warn:'#ff9800'};
  const col=colors[state]||colors.warn;
  if(ss){ss.textContent=label;ss.style.color=col;}
  if(sb){sb.textContent=label;sb.style.color=col;sb.style.background=state==='ok'?'rgba(0,230,118,.12)':'rgba(233,69,96,.1)';}
  if(dot){dot.style.background=col;dot.style.boxShadow=state==='ok'?'0 0 6px var(--green)':'none';}
}

function _mergeOnConnect(){
  if(!fbDB)return;
  // Pull ALL cloud data first, then decide
  fbDB.ref('ccs').once('value').then(snap=>{
    const cloud=snap.val()||{};
    const cloudEmpty=!cloud.emps||!Array.isArray(cloud.emps)||cloud.emps.length===0;
    if(cloudEmpty){
      // Cloud is empty → push local data up
      _pushAllToCloud();
    } else {
      // Cloud has data → pull it locally (cloud wins)
      SYNC_KEYS.forEach(k=>{
        if(cloud[k]!==undefined&&cloud[k]!==null){
          localStorage.setItem('ccs2_'+k,JSON.stringify(cloud[k]));
        }
      });
      // Refresh UI after pull
      setTimeout(()=>{
        try{
          if(CU?.role==='admin')renderAdmin();
          else if(CU?.role==='emp'){const e=getEmp();if(e){refreshEmpUI(e);renderEmpMessages(e.id);}}
        }catch(e){}
      },300);
    }
  }).catch(e=>console.error('merge err:',e));
}

function _pushAllToCloud(){
  if(!fbDB)return;
  const updates={};
  SYNC_KEYS.forEach(k=>{
    const v=DB.get(k);
    if(v!==null&&v!==undefined)updates['ccs/'+k]=v;
  });
  if(Object.keys(updates).length>0){
    fbDB.ref().update(updates)
      .then(()=>console.log('Local data pushed to cloud OK'))
      .catch(e=>console.error('push err:',e));
  }
}

function _startListeners(){
  if(!fbDB)return;
  SYNC_KEYS.forEach(key=>{
    fbDB.ref('ccs/'+key).on('value', snap=>{
      const v=snap.val();
      if(v===null||v===undefined)return;
      // Write to local storage
      localStorage.setItem('ccs2_'+key,JSON.stringify(v));
      // Update UI live
      clearTimeout(window['_rt_'+key]);
      window['_rt_'+key]=setTimeout(()=>{
        try{
          if(key==='emps'||key==='att'){
            if(CU?.role==='admin'){
              if(document.getElementById('adminScreen')?.classList.contains('active'))renderAdmin();
            } else if(CU?.role==='emp'){
              const emp=getEmp();
              if(emp){refreshEmpUI(emp);renderDayGrid(emp.id);renderEmpAttPattern(emp.id);updAttBtns();updTodayStatus(emp.id);}
            }
          }
          if(key==='msg'&&CU?.role==='emp'){
            const emp=getEmp();if(emp)renderEmpMessages(emp.id);
            playNotifSound('msg');
          }
          if(key==='msg'&&CU?.role==='admin'){
            renderSentMessages();
            // Check if there's a new reply from employee
            const msgs=DB.get('msg')||[];
            const recent=msgs.filter(m=>m.type==='reply'&&m.ts&&(Date.now()-new Date(m.ts).getTime())<10000);
            if(recent.length>0)playNotifSound('msg');
          }
          if(key==='att'){
            // إشعار المدير عند تسجيل حضور/انصراف موظف
            if(CU?.role==='admin'){
              const att=DB.get('att')||[];
              const recent=att.filter(a=>a.ts&&(Date.now()-new Date(a.ts).getTime())<10000);
              if(recent.length>0){
                recent.forEach(a=>{
                  if(a.type==='ci')showToast(`✅ ${a.ename} سجّل الحضور — ${a.time}`,'s');
                  else showToast(`🚪 ${a.ename} سجّل الانصراف — ${a.time}`,'i');
                });
                playNotifSound('in');
              }
            }
          }
        }catch(e){}
      },300);
    });
  });
}

// Called by DB.set — writes to cloud immediately
function _syncToCloud(key, value){
  if(!fbDB||!fbSyncEnabled)return;
  fbDB.ref('ccs/'+key).set(value)
    .catch(e=>{
      console.error('sync write err:',key,e.code,e.message);
      _setSyncUI('fail','❌ خطأ كتابة: '+e.code);
    });
}
// ═══ END FIREBASE ═══


