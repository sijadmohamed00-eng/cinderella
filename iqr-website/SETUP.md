# طريقة الربط الكاملة

## الجزء 1 — Scraper (على جهازك)

### تثبيت:
```
1. فك ملف cinderella-bridge.zip
2. افتح PowerShell وروح للمجلد:
   cd C:\Users\lenovo\Desktop\cinderella-bridge
3. ثبّت المكتبات:
   npm install
4. شغّل:
   node scraper.js
```

### للتشغيل الدائم في الخلفية:
```
npm install -g pm2
pm2 start scraper.js --name "cinderella"
pm2 save
```

---

## الجزء 2 — داشبورد على iqrhq.me

### في مشروع iqr-website:

1. ثبّت Firebase:
   ```
   npm install firebase
   ```

2. أنشئ المجلد:
   ```
   app/dashboard/cinderlla/
   ```

3. انسخ ملفين من الزيب:
   - CinderellaDashboard.jsx  →  app/dashboard/cinderlla/CinderellaDashboard.jsx
   - page.js                  →  app/dashboard/cinderlla/page.js

4. في next.config.js أضف cinderlla للـ static params:
   ```js
   // app/dashboard/cinderlla/page.js موجود — Next.js يبنيه تلقائياً
   ```

5. ارفع على GitHub — Cloudflare يبني تلقائياً

### النتيجة:
iqrhq.me/dashboard/cinderlla → داشبورد حي من Firebase

---

## الجزء 3 — robots.txt

في app/robots.js أضف:
```js
disallow: ["/dashboard/"],
```
حتى لا تظهر داشبوردات العملاء في Google.

---

## هيكل البيانات في Firebase

```
cinderlla-9d209-default-rtdb/
└── restaurants/
    └── cinderlla/
        ├── dashboard/
        │   ├── totalOrders
        │   ├── totalIncome
        │   ├── totalVisitors
        │   ├── openOrders
        │   ├── rawCards[]
        │   └── lastSync
        ├── sales/
        │   └── 2026-05-04/
        │       └── branches/
        │           ├── Shaab/
        │           ├── Dora/
        │           ├── Basmaya/
        │           └── Ghazaliyya/
        └── meta/
            ├── lastSync
            ├── syncStatus
            ├── durationSec
            └── nextSync
```
