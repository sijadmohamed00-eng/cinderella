// ═══════════════════════════════════════════════════════════
// IQR Bridge — Puppeteer INVO Scraper
// مطعم سندريلا — cinderlla-9d209
// ═══════════════════════════════════════════════════════════

const puppeteer = require('puppeteer');
const https     = require('https');

const CONFIG = {
  email:         'syndrlla3@gmail.com',
  password:      '1999178',
  firebaseUrl:   'https://cinderlla-9d209-default-rtdb.firebaseio.com',
  firebaseKey:   'AIzaSyAHIkuNc8dBb9R5SNv5k5YPjqa2Nj17_h4',
  restaurantId:  'cinderlla',
  branches:      ['Shaab', 'Dora', 'Basmaya', 'Ghazaliyya'],
  intervalMinutes: 5,
};

// ════════════════════════════════════════════════════════════
// Firebase Write
// ════════════════════════════════════════════════════════════
function writeFirebase(path, data) {
  return new Promise((resolve) => {
    const body   = JSON.stringify(data);
    const urlStr = `${CONFIG.firebaseUrl}/${path}.json?auth=${CONFIG.firebaseKey}`;
    const urlObj = new URL(urlStr);
    const options = {
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   'PATCH',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { console.log(`✅ Firebase [${path}] → ${res.statusCode}`); resolve(true); });
    });
    req.on('error', e => { console.error('❌ Firebase error:', e.message); resolve(false); });
    req.write(body);
    req.end();
  });
}

function cleanNum(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[^0-9.-]/g, '')) || 0;
}

// ════════════════════════════════════════════════════════════
// Main Scrape
// ════════════════════════════════════════════════════════════
async function scrape() {
  const startTime = new Date();
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 IQR Bridge — بدء المزامنة', startTime.toLocaleString('ar-IQ'));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    page.setDefaultTimeout(30000);

    // ── 1. تسجيل الدخول ──────────────────────────────────────
    console.log('\n🔐 تسجيل الدخول...');
    await page.goto('https://cloud.invopos.com/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // أدخل الإيميل
    const emailSel = 'input[type="email"], input[formcontrolname="email"], input[placeholder*="mail"]';
    await page.waitForSelector(emailSel);
    await page.click(emailSel, { clickCount: 3 });
    await page.type(emailSel, CONFIG.email, { delay: 40 });

    // أدخل كلمة المرور
    const passSel = 'input[type="password"], input[formcontrolname="password"]';
    await page.click(passSel, { clickCount: 3 });
    await page.type(passSel, CONFIG.password, { delay: 40 });

    // اضغط دخول
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await new Promise(r => setTimeout(r, 3000));

    console.log('✅ دخول — URL:', page.url());

    if (page.url().includes('login')) {
      throw new Error('فشل تسجيل الدخول — تحقق من البيانات');
    }

    // ── 2. سحب الداشبورد الرئيسي ─────────────────────────────
    console.log('\n📊 سحب الداشبورد...');
    await page.goto('https://cloud.invopos.com/dashboard', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));

    const dashData = await page.evaluate(() => {
      const result = {
        totalOrders:    0,
        totalIncome:    0,
        totalVisitors:  0,
        openOrders:     0,
        totalPaid:      0,
        balance:        0,
        rawCards:       [],
        timestamp:      new Date().toISOString(),
      };

      // سحب كل الكروت
      const cards = document.querySelectorAll('mat-card, .mat-card, .summary-card, [class*="card"]');
      cards.forEach(card => {
        const labels = card.querySelectorAll('p, span, .subtitle, .mat-card-subtitle, h4');
        const values = card.querySelectorAll('h2, h3, strong, .value, .amount, [class*="value"]');
        if (labels.length && values.length) {
          const label = labels[0].innerText.trim();
          const value = values[0].innerText.trim();
          if (label && value) {
            result.rawCards.push({ label, value });
            const num = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
            if (label.includes('طلب') || label.includes('order') || label.includes('Order')) result.totalOrders = num;
            if (label.includes('دخل') || label.includes('income') || label.includes('Income')) result.totalIncome = num;
            if (label.includes('زوار') || label.includes('visit') || label.includes('Visit')) result.totalVisitors = num;
            if (label.includes('مفتوح') || label.includes('open') || label.includes('Open')) result.openOrders = num;
            if (label.includes('مدفوع') || label.includes('paid') || label.includes('Paid')) result.totalPaid = num;
            if (label.includes('رصيد') || label.includes('balance') || label.includes('Balance')) result.balance = num;
          }
        }
      });

      return result;
    });

    console.log('📊 الداشبورد:', dashData.rawCards.length, 'كرت');

    // ── 3. سحب ملخص المبيعات ─────────────────────────────────
    const today      = new Date().toISOString().split('T')[0];
    const salesData  = {};

    for (const branch of CONFIG.branches) {
      console.log(`\n💰 فرع: ${branch}...`);
      try {
        await page.goto('https://cloud.invopos.com/reports/reports/sales_summary', {
          waitUntil: 'networkidle2',
        });
        await new Promise(r => setTimeout(r, 4000));

        // اختيار الفرع
        try {
          const selects = await page.$$('mat-select');
          if (selects.length > 0) {
            await selects[0].click();
            await new Promise(r => setTimeout(r, 1500));
            const opts = await page.$$('mat-option');
            for (const opt of opts) {
              const txt = await opt.evaluate(el => el.innerText.trim());
              if (txt.toLowerCase().includes(branch.toLowerCase())) {
                await opt.click();
                await new Promise(r => setTimeout(r, 2000));
                break;
              }
            }
          }
        } catch (e) {
          console.log('  تعذر اختيار الفرع:', e.message);
        }

        // اضغط عرض
        try {
          const btns = await page.$$('button');
          for (const btn of btns) {
            const txt = await btn.evaluate(el => el.innerText.trim());
            if (txt.includes('عرض') || txt.includes('View') || txt.includes('Show')) {
              await btn.click();
              await new Promise(r => setTimeout(r, 3000));
              break;
            }
          }
        } catch (e) {}

        // سحب البيانات
        const branchSales = await page.evaluate(() => {
          const data = { stats: {}, salesByService: {}, totals: {}, tables: [] };

          // الجداول
          document.querySelectorAll('table').forEach((tbl, ti) => {
            const rows = [];
            tbl.querySelectorAll('tr').forEach(row => {
              const cells = [...row.querySelectorAll('td, th')].map(c => c.innerText.trim());
              if (cells.some(c => c)) rows.push(cells);
            });
            if (rows.length) data.tables.push(rows);
          });

          // إحصائيات
          document.querySelectorAll('tr').forEach(row => {
            const cells = [...row.querySelectorAll('td')];
            if (cells.length >= 2) {
              const k = cells[0].innerText.trim();
              const v = cells[cells.length - 1].innerText.trim();
              if (k && v && v !== k) data.stats[k] = v;
            }
          });

          // مبيعات حسب الخدمة
          const keywords = ['الشركات','الصالة','الدلفري','السفري','DineIn','TakeAway','CarHop','Delivery'];
          const bodyText = document.body.innerText;
          keywords.forEach(kw => {
            const lines = bodyText.split('\n');
            lines.forEach(line => {
              if (line.includes(kw) && line.match(/[\d,]+/)) {
                const nums = line.match(/[\d,]+/g);
                if (nums) data.salesByService[kw] = parseFloat(nums[nums.length - 1].replace(/,/g, '')) || 0;
              }
            });
          });

          // المجاميع
          document.querySelectorAll('strong, b, [class*="total"]').forEach(el => {
            const txt = el.innerText.trim();
            if (txt.includes('IQD')) {
              const parent = el.closest('tr, div, td');
              if (parent) {
                const label = parent.innerText.replace(txt, '').trim().slice(0, 60);
                if (label) data.totals[label] = parseFloat(txt.replace(/[^0-9.-]/g, '')) || 0;
              }
            }
          });

          return data;
        });

        salesData[branch] = { ...branchSales, scrapedAt: new Date().toISOString() };
        console.log(`  ✅ ${branch}: ${Object.keys(branchSales.stats).length} إحصائية`);

      } catch (e) {
        console.error(`  ❌ ${branch}:`, e.message);
        salesData[branch] = { error: e.message, scrapedAt: new Date().toISOString() };
      }
    }

    // ── 4. إرسال لـ Firebase ─────────────────────────────────
    console.log('\n📤 إرسال لـ Firebase...');

    await writeFirebase(`restaurants/${CONFIG.restaurantId}/dashboard`, {
      ...dashData,
      lastSync:   new Date().toISOString(),
      syncStatus: 'success',
    });

    await writeFirebase(`restaurants/${CONFIG.restaurantId}/sales/${today}`, {
      branches:  salesData,
      lastSync:  new Date().toISOString(),
    });

    const duration = Math.round((Date.now() - startTime) / 1000);
    await writeFirebase(`restaurants/${CONFIG.restaurantId}/meta`, {
      lastSync:      new Date().toISOString(),
      syncStatus:    'success',
      durationSec:   duration,
      nextSync:      new Date(Date.now() + CONFIG.intervalMinutes * 60000).toISOString(),
      branches:      CONFIG.branches,
    });

    console.log(`\n✅ تمت المزامنة في ${duration} ثانية`);
    console.log(`⏰ المزامنة القادمة بعد ${CONFIG.intervalMinutes} دقائق`);

  } catch (e) {
    console.error('\n❌ خطأ:', e.message);
    await writeFirebase(`restaurants/${CONFIG.restaurantId}/meta`, {
      lastSync:   new Date().toISOString(),
      syncStatus: 'error',
      error:      e.message,
    }).catch(() => {});
  } finally {
    await browser.close();
  }
}

// ── تشغيل ───────────────────────────────────────────────────
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🍽️  IQR Bridge — مطعم سندريلا');
console.log(`⏰  مزامنة كل ${CONFIG.intervalMinutes} دقائق`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

scrape();
setInterval(scrape, CONFIG.intervalMinutes * 60 * 1000);
