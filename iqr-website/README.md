# IQR — الحزمة الكاملة

## محتويات الحزمة

### 📁 website/
- **IQRSite.jsx** — الصفحة الرئيسية المحدّثة
  - قسم التحديات (6 كاردات بشبكة 3 أعمدة)
  - قسم الخدمات (19 خدمة على 4 محاور)
  - روابط الفوتر مصلّحة

### 📁 scraper/
- **scraper.js** — يسحب بيانات INVO لـ Firebase
- **package.json** — تبعيات المشروع

### 📁 dashboard/
- **CinderellaDashboard.jsx** — داشبورد سندريلا الحي
- **page.js** — صفحة Next.js للرابط /dashboard/cinderlla

---

## طريقة التركيب

### 1. website/IQRSite.jsx
انسخ لـ: components/IQRSite.jsx (استبدل الموجود)

### 2. scraper/ (على جهازك)
```powershell
cd scraper
npm install
node scraper.js
```

### 3. dashboard/ (في مشروع iqr-website)
```
أولاً: npm install firebase

أنشئ مجلد: app/dashboard/cinderlla/
انسخ:
  CinderellaDashboard.jsx → app/dashboard/cinderlla/CinderellaDashboard.jsx
  page.js                 → app/dashboard/cinderlla/page.js
```

---

## الروابط بعد الرفع
- iqrhq.me/ → الصفحة الرئيسية المحدّثة
- iqrhq.me/dashboard/cinderlla → داشبورد سندريلا
