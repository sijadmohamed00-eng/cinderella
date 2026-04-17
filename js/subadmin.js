// ═══ subadmin.js ═══
//  SUB-ADMIN SYSTEM — نظام المديرين الفرعيين
// ══════════════════════════════════════════════════════

const ALL_PERMS=['view_overview','view_emp','manage_emp','att','salary','incentives','deductions','shifts','reports','leave','messages','sales','logs','settings'];
const PERM_LABELS={
  view_overview:'نظرة عامة',view_emp:'عرض الموظفين',manage_emp:'إدارة الموظفين',
  att:'سجل الحضور',salary:'الرواتب',incentives:'الحوافز',deductions:'الخصومات',
  shifts:'الشفتات',reports:'التقارير',leave:'طلبات الإجازة',
  messages:'الرسائل',sales:'المبيعات',logs:'سجل العمليات',settings:'الإعدادات'
};

// Tab → permission mapping
const TAB_PERM={
  ov:'view_overview',emp:'view_emp',att:'att',sal:'salary',
  inc:'incentives',sh:'shifts',rate:'view_emp',leave:'leave',
  arch:'reports',rep:'reports',msg:'messages',logs:'logs',
  sales:'sales',map:'view_emp',groupchat:'messages',advrep:'reports',cfg:'settings'
};

let SA_MODE=false; // currently logged in as sub-admin
let CU_PERMS=null; // active sub-admin permissions (null = all)

function getSubAdmins(){return DB.get('subAdmins')||[];}

function openAddSubAdmin(){
  document.getElementById('subAdminEditId').value='';
  document.getElementById('subAdminModalTitle').textContent='➕ إضافة مدير فرعي';
  ['saName','saUser','saPass'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('saRole').value='manager';
  ALL_PERMS.forEach(p=>{const el=document.getElementById('perm_'+p);if(el)el.checked=false;});
  openModal('subAdminModal');
}

function openEditSubAdmin(id){
  const admins=getSubAdmins();
  const sa=admins.find(a=>a.id===id);if(!sa)return;
  document.getElementById('subAdminEditId').value=id;
  document.getElementById('subAdminModalTitle').textContent='✏️ تعديل مدير فرعي';
  document.getElementById('saName').value=sa.name;
  document.getElementById('saUser').value=sa.u;
  document.getElementById('saPass').value=sa.pw;
  document.getElementById('saRole').value=sa.role||'manager';
  ALL_PERMS.forEach(p=>{const el=document.getElementById('perm_'+p);if(el)el.checked=(sa.perms||[]).includes(p);});
  openModal('subAdminModal');
}

function selectAllPerms(val){
  ALL_PERMS.forEach(p=>{const el=document.getElementById('perm_'+p);if(el)el.checked=val;});
}

function saveSubAdmin(){
  const name=document.getElementById('saName').value.trim();
  const u=document.getElementById('saUser').value.trim();
  const pw=document.getElementById('saPass').value.trim();
  const role=document.getElementById('saRole').value;
  if(!name||!u||!pw){showToast('يرجى ملء الحقول المطلوبة','e');return;}
  const perms=ALL_PERMS.filter(p=>{const el=document.getElementById('perm_'+p);return el&&el.checked;});
  const admins=getSubAdmins();
  const editId=document.getElementById('subAdminEditId').value;
  if(editId){
    const i=admins.findIndex(a=>a.id===editId);
    if(i!==-1){admins[i]={...admins[i],name,u,pw,role,perms};}
    showToast('✅ تم تعديل المدير الفرعي','s');
  } else {
    if(admins.find(a=>a.u===u)){showToast('اليوزر مستخدم مسبقاً','e');return;}
    admins.push({id:genId(),name,u,pw,role,perms,jd:todayStr()});
    showToast(`✅ تم إضافة ${name} كمدير فرعي`,'s');
  }
  DB.set('subAdmins',admins);
  closeModal('subAdminModal');
  renderSubAdminList();
}

function deleteSubAdmin(id){
  if(!confirm('حذف هذا المدير الفرعي؟'))return;
  const admins=getSubAdmins().filter(a=>a.id!==id);
  DB.set('subAdmins',admins);
  renderSubAdminList();
  showToast('تم الحذف','i');
}

function renderSubAdminList(){
  const c=document.getElementById('subAdminList');if(!c)return;
  const admins=getSubAdmins();
  if(!admins.length){
    c.innerHTML='<div class="empty"><div class="ei">👑</div><p>لا يوجد مديرون فرعيون<br><small>أضف مديراً فرعياً لتحديد صلاحياته</small></p></div>';
    return;
  }
  const roleNames={manager:'مدير فرعي',assistant:'مساعد مدير',supervisor:'مشرف'};
  const roleColors={manager:'var(--gold)',assistant:'var(--cyan)',supervisor:'var(--purple)'};
  c.innerHTML=admins.map(sa=>`
    <div style="background:var(--bg3);border:1px solid var(--br);border-radius:12px;padding:12px 14px;margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(206,147,216,.15);border:1px solid rgba(206,147,216,.25);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:var(--purple)">${sa.name[0]}</div>
          <div>
            <div style="font-size:13px;font-weight:700">${sa.name}</div>
            <div style="font-size:11px;color:var(--t3)">@${sa.u} · <span style="color:${roleColors[sa.role]||'var(--t2)'}">${roleNames[sa.role]||sa.role}</span></div>
          </div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sc btn-sm" onclick="openEditSubAdmin('${sa.id}')">✏️ تعديل</button>
          <button class="btn btn-dn btn-sm" onclick="deleteSubAdmin('${sa.id}')">🗑️</button>
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${(sa.perms||[]).map(p=>`<span style="background:rgba(206,147,216,.1);color:var(--purple);border:1px solid rgba(206,147,216,.2);border-radius:6px;padding:2px 8px;font-size:10px">${PERM_LABELS[p]||p}</span>`).join('')}
        ${!(sa.perms||[]).length?'<span style="color:var(--t3);font-size:11px">لا توجد صلاحيات</span>':''}
      </div>
    </div>`).join('');
}

// Check if current sub-admin has a specific permission
function hasPerm(perm){
  if(!SA_MODE||!CU_PERMS)return true; // main admin has all
  return CU_PERMS.includes(perm);
}

// Hide sidebar/mobile-nav items based on permissions
function applySubAdminPermissions(){
  if(!SA_MODE)return;
  // Hide sidebar items
  document.querySelectorAll('#adminScreen .sitem').forEach(item=>{
    const onclick=item.getAttribute('onclick')||'';
    const match=onclick.match(/showATab\('(\w+)'/);
    if(match){
      const tab=match[1];
      const perm=TAB_PERM[tab];
      if(perm&&!hasPerm(perm)){item.style.display='none';}
    }
  });
  // Hide mobile nav items
  document.querySelectorAll('#adminScreen .mnav-item').forEach(item=>{
    const onclick=item.getAttribute('onclick')||'';
    const match=onclick.match(/showATab\('(\w+)'/);
    if(match){
      const tab=match[1];
      const perm=TAB_PERM[tab];
      if(perm&&!hasPerm(perm)){item.style.display='none';}
    }
  });
  // Hide add employee button if no manage_emp perm
  if(!hasPerm('manage_emp')){
    document.querySelectorAll('[onclick*="openAddEmp"]').forEach(el=>el.style.display='none');
    document.querySelectorAll('[onclick*="qDel"]').forEach(el=>el.style.display='none');
    document.querySelectorAll('[onclick*="openDetail"]').forEach(el=>{
      // hide delete inside detail too
    });
  }
  // Change topbar to show sub-admin info
  const uname=document.querySelector('#adminScreen .uname');
  const urole=document.querySelector('#adminScreen .urole');
  if(uname&&CU?.saName)uname.textContent=CU.saName;
  if(urole&&CU?.saRole){
    const roleNames={manager:'مدير فرعي',assistant:'مساعد مدير',supervisor:'مشرف'};
    urole.textContent=roleNames[CU.saRole]||CU.saRole;
    urole.style.color='var(--purple)';
  }
}

// ══════════════════════════════════════════════════════
//  END SUB-ADMIN SYSTEM
// ══════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════
//  LOAN / سلفة SYSTEM
// ══════════════════════════════════════════════════════

// ── السلفة المخصصة ──
