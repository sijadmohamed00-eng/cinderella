"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { BlogGate } from "../../../subscription/SubscriptionGate";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{background:#000814;overflow-x:hidden;font-family:'Cairo',sans-serif}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#1a4fc4;border-radius:99px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
  .prose h2{font-family:'Cairo',sans-serif;font-size:26px;font-weight:900;color:#f0f4ff;margin:52px 0 18px;padding-right:18px;border-right:3px solid #1a4fc4;line-height:1.3}
  .prose h3{font-family:'Cairo',sans-serif;font-size:19px;font-weight:700;color:rgba(240,244,255,.85);margin:36px 0 12px}
  .prose p{font-family:'Cairo',sans-serif;font-size:16px;color:rgba(240,244,255,.6);line-height:2.1;margin-bottom:22px}
  .prose strong{color:#f0f4ff;font-weight:700}
  .prose ul{margin:0 0 24px 0;padding:0;list-style:none}
  .prose ul li{font-family:'Cairo',sans-serif;font-size:15px;color:rgba(240,244,255,.58);line-height:1.9;margin-bottom:12px;padding-right:28px;position:relative}
  .prose ul li::before{content:'';position:absolute;right:0;top:10px;width:8px;height:8px;border-radius:50%;background:#1a4fc4;box-shadow:0 0 8px rgba(26,79,196,.6)}
  .prose ol{margin:0 0 24px 0;padding:0;counter-reset:step;list-style:none}
  .prose ol li{font-family:'Cairo',sans-serif;font-size:15px;color:rgba(240,244,255,.58);line-height:1.9;margin-bottom:14px;padding-right:42px;position:relative;counter-increment:step}
  .prose ol li::before{content:counter(step);position:absolute;right:0;top:2px;width:26px;height:26px;border-radius:6px;background:rgba(26,79,196,.15);border:1px solid rgba(26,79,196,.3);color:#1a4fc4;font-size:12px;font-weight:700;font-family:'Space Mono',monospace;display:flex;align-items:center;justify-content:center}
  .prose blockquote{border-right:3px solid #1a4fc4;padding:20px 28px;background:rgba(26,79,196,.06);border-radius:0 10px 10px 0;margin:32px 0}
  .prose blockquote p{color:rgba(240,244,255,.72);font-style:italic;margin:0;font-size:17px;line-height:1.9}
  .prose .stat-box{background:linear-gradient(135deg,rgba(26,79,196,.08),rgba(0,195,255,.04));border:1px solid rgba(26,79,196,.2);border-radius:14px;padding:28px 32px;margin:32px 0;display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .prose .stat-item{text-align:center}
  .prose .stat-num{font-family:'Space Mono',monospace;font-size:36px;font-weight:700;line-height:1;margin-bottom:8px}
  .prose .stat-label{font-family:'Cairo',sans-serif;font-size:12px;color:rgba(240,244,255,.4);font-weight:600}
  .prose .tip-box{background:rgba(0,255,136,.05);border:1px solid rgba(0,255,136,.2);border-radius:10px;padding:20px 24px;margin:24px 0;display:flex;gap:14px;align-items:flex-start}
  .prose .tip-icon{font-size:22px;flex-shrink:0;margin-top:2px}
  .prose .tip-text{font-family:'Cairo',sans-serif;font-size:14px;color:rgba(240,244,255,.65);line-height:1.8}
  .prose .warn-box{background:rgba(255,214,10,.05);border:1px solid rgba(255,214,10,.2);border-radius:10px;padding:20px 24px;margin:24px 0;display:flex;gap:14px;align-items:flex-start}
  .prose table{width:100%;border-collapse:collapse;margin:28px 0}
  .prose th{font-family:'Cairo',sans-serif;font-size:12px;font-weight:700;color:rgba(240,244,255,.4);letter-spacing:.08em;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.07);text-align:right}
  .prose td{font-family:'Cairo',sans-serif;font-size:14px;color:rgba(240,244,255,.6);padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.04);text-align:right}
  .prose tr:last-child td{border-bottom:none}
  .prose tr:hover td{background:rgba(26,79,196,.04)}
`;

const FREE_SLUGS = ["inventory-waste"];

const POSTS = {
  "inventory-waste":{title:"كيف تقلل هدر مطعمك بنسبة 30% خلال شهر واحد",category:"المخزون",categoryColor:"#ffd60a",date:"15 أبريل 2026",readTime:"6 دقائق",icon:"📦",tags:["مخزون","هدر","أرباح","تكاليف"],excerpt:"الهدر الغذائي هو أكبر عدو لأرباح مطعمك — نكشف الأسباب الحقيقية وكيف تعالجها بأنظمة بسيطة.",content:`<div class="stat-box"><div class="stat-item"><div class="stat-num" style="color:#ffd60a">30%</div><div class="stat-label">متوسط الهدر في مطاعم العراق</div></div><div class="stat-item"><div class="stat-num" style="color:#00ff88">-28%</div><div class="stat-label">تراجع الهدر بعد تطبيق النظام</div></div><div class="stat-item"><div class="stat-num" style="color:#1a4fc4">3 أشهر</div><div class="stat-label">وقت الوصول للنتائج</div></div></div><h2>لماذا الهدر يدمر أرباحك بصمت؟</h2><p>في متوسط المطاعم العراقية، يصل الهدر الغذائي إلى <strong>25-35% من إجمالي تكاليف المواد الخام</strong>. هذا يعني أنك إذا كنت تصرف 3,000,000 دينار شهرياً على المواد، فأنت تخسر ما يقارب 900,000 دينار في الهواء — كل شهر.</p><p>الأكثر إيلاماً أن معظم أصحاب المطاعم لا يرون هذه الخسارة بشكل مباشر. الهدر يختبئ في مخلفات المطبخ، في المواد المنتهية الصلاحية، في الطلبيات الزائدة.</p><blockquote><p>الهدر ليس مشكلة مطبخ — هي مشكلة نظام. كل مطعم يمكن تقليل هدره بنسبة 25-30% خلال 60 يوماً.</p></blockquote><h2>الأسباب الحقيقية للهدر</h2><ul><li><strong>غياب نظام الـ FIFO:</strong> مواد جديدة تُستخدم قبل القديمة، والقديمة تفسد في الخلف</li><li><strong>عدم حساب وصفات الطبخ بدقة:</strong> لا أحد يعرف بالضبط كم غرام من كل مادة يدخل في كل صنف</li><li><strong>الطلبيات العشوائية:</strong> تطلب بالتخمين لا بناءً على معدل الاستهلاك الفعلي</li><li><strong>لا حدود دنيا للمخزون:</strong> تكتشف نفاد مادة فقط عندما يطلبها زبون</li></ul><h2>الخطة العملية: 4 خطوات خلال شهر</h2><h3>الخطوة الأولى: الجرد الشامل</h3><p>ابدأ بجرد يومي كامل لكل ما في مطبخك — كل مادة خام، كمياتها، وتاريخ انتهاء صلاحيتها.</p><div class="tip-box"><div class="tip-icon">✅</div><div class="tip-text">استخدم جدول Excel بسيط: اسم المادة، الكمية عند بداية اليوم، الكمية عند نهايته، والفرق. بعد أسبوع ستعرف أين يختفي المخزون.</div></div><h3>الخطوة الثانية: حساب الوصفات بدقة</h3><p>لكل صنف في قائمتك، حدد بالضبط كم غرام من كل مادة يدخل في تحضيره. هذا ما يُسمى <strong>Recipe Costing</strong>.</p><h3>الخطوة الثالثة: ربط الطلبيات بالمبيعات</h3><p>بدل الطلب العشوائي، اطلب بناءً على معدل مبيعاتك خلال الأسبوعين الماضيين.</p><h3>الخطوة الرابعة: تطبيق FIFO</h3><p>كل مادة تدخل للمخزون تذهب للخلف، والقديمة تبقى في الأمام. علّم موظفيك هذه القاعدة.</p><h2>النتائج المتوقعة</h2><ul><li>تقليل الهدر بنسبة 25-30% خلال أول 30 يوم</li><li>توفير 15-20% من تكاليف المواد الخام شهرياً</li><li>القضاء على حالات نفاد المواد المفاجئة</li><li>رفع هامش الربح الإجمالي بـ 8-12 نقطة مئوية</li></ul>`},
  "peak-hours":{title:"ساعات الذروة: كيف تستعد وتضاعف إيراداتك",category:"التحليلات",categoryColor:"#00c3ff",date:"8 أبريل 2026",readTime:"5 دقائق",icon:"📊",tags:["تحليل","ذروة","إيرادات"],excerpt:"معظم المطاعم تخسر في وقت الذروة لأنها غير مستعدة.",content:`<div class="stat-box"><div class="stat-item"><div class="stat-num" style="color:#00c3ff">65%</div><div class="stat-label">من الإيرادات تأتي في 4 ساعات ذروة</div></div><div class="stat-item"><div class="stat-num" style="color:#00ff88">+35%</div><div class="stat-label">زيادة الإيرادات مع التخطيط</div></div><div class="stat-item"><div class="stat-num" style="color:#ffd60a">-40%</div><div class="stat-label">خسارة رضا العملاء بدون استعداد</div></div></div><h2>لماذا الذروة تكلّفك؟</h2><p>ساعات الذروة في معظم المطاعم هي الأقل كفاءة — طلبات تتأخر، موظفون يتشتتون، زبائن يغضبون. السبب بسيط: الذروة تكشف كل نقاط الضعف في نظامك.</p><blockquote><p>الذروة فرصة ذهبية — من يستعد جيداً يضاعف إيراداته.</p></blockquote><h2>أولاً: اعرف ذروتك بالأرقام</h2><ul><li>توزيع الطلبات على الساعات</li><li>مقارنة بين أيام الأسبوع</li><li>تحديد مدة الذروة الدقيقة</li></ul><h2>ثانياً: الاستعداد قبل الذروة بساعة</h2><ol><li>Mise en Place: كل المقادير محضّرة مسبقاً</li><li>تجهيز المحطات بكل ما تحتاجه</li><li>تحديد الأدوار بوضوح</li><li>اجتماع 5 دقائق مع الفريق</li><li>اختبار المعدات</li></ol><h2>ثالثاً: بعد الذروة — التقييم الفوري</h2><p>خصص 15 دقيقة بعد انتهاء الذروة: ماذا سار بشكل جيد؟ أين حدثت اختناقات؟ ماذا سنفعل مختلفاً؟</p>`},
  "staff-management":{title:"إدارة موظفي المطعم: من الفوضى إلى النظام",category:"الموظفون",categoryColor:"#00ff88",date:"1 أبريل 2026",readTime:"8 دقائق",icon:"👥",tags:["موظفون","إدارة","ورديات"],excerpt:"فريق غير منظم يكلفك أكثر من فريق صغير منضبط.",content:`<div class="stat-box"><div class="stat-item"><div class="stat-num" style="color:#00ff88">68%</div><div class="stat-label">من مشاكل المطاعم سببها بشري</div></div><div class="stat-item"><div class="stat-num" style="color:#ffd60a">3x</div><div class="stat-label">تكلفة استبدال موظف مقابل تدريبه</div></div><div class="stat-item"><div class="stat-num" style="color:#1a4fc4">-45%</div><div class="stat-label">تراجع الأخطاء مع SOPs واضحة</div></div></div><h2>المشكلة الحقيقية ليست الموظفين</h2><p>معظم الموظفين يريدون أن يؤدوا عملهم بشكل صحيح — لكنهم لا يعرفون بالضبط ما المطلوب منهم. لا يوجد توصيف وظيفي واضح، لا إجراءات محددة، ولا معيار لقياس الأداء.</p><h2>الخطوة الأولى: توصيف واضح لكل دور</h2><ul><li>استقبال الزبون بتحية محددة خلال 15 ثانية</li><li>إدخال الطلب بدقة مع تأكيد كل صنف</li><li>إبلاغ الزبون بوقت الانتظار</li><li>التعامل مع الشكاوى: الاعتذار أولاً</li></ul><h2>الخطوة الثانية: جداول ورديات ذكية</h2><p>ضع أكثر الموظفين تجربة في ساعات الذروة، ولا تضع موظفين جدد في الذروة وحدهم.</p><h2>الخطوة الثالثة: نظام تقييم الأداء</h2><p>ما لا يُقاس لا يتحسن. قيّم موظفيك بأرقام واضحة أسبوعياً: سرعة الخدمة، دقة الطلبات، رضا العملاء.</p><h2>الخطوة الرابعة: التدريب المستمر</h2><ol><li>تدريب أسبوعي قصير (15-20 دقيقة) بموضوع واحد</li><li>مراجعة الأخطاء بدون لوم</li><li>تدريب الأقران: الموظف الماهر يُدرّب الجديد</li></ol>`},
  "menu-engineering":{title:"هندسة قائمة الطعام: أي أصناف تجلب الربح؟",category:"الربحية",categoryColor:"#1a4fc4",date:"24 مارس 2026",readTime:"7 دقائق",icon:"🍽️",tags:["قائمة","ربحية","تسعير"],excerpt:"ليس كل صنف في قائمتك يستحق مكانه.",content:`<h2>ما هي هندسة القائمة؟</h2><p>هندسة القائمة هي أسلوب علمي لتحليل كل صنف من ناحيتين: مدى شعبيته وهامش ربحه. كل صنف يقع في أحد أربعة تصنيفات.</p><blockquote><p>القائمة الطويلة وهم. المطعم الناجح عنده 25-35 صنفاً مدروساً بدل 80 صنفاً نصفها يخسرك.</p></blockquote><h2>المصفوفة الرباعية</h2><h3>⭐ النجوم — مبيعات عالية + ربح عالٍ</h3><p>احتفظ بهم، رقّهم، اجعلهم في مكان بارز. لا تغيّر وصفتهم.</p><h3>🧩 الألغاز — مبيعات منخفضة + ربح عالٍ</h3><p>فرص ضائعة. أبرزهم في القائمة، درّب النوادل على اقتراحهم.</p><h3>🐄 الأبقار — مبيعات عالية + ربح منخفض</h3><p>حسّن الوصفة لتقليل التكلفة، أو ارفع السعر تدريجياً.</p><h3>🐕 الكلاب — مبيعات منخفضة + ربح منخفض</h3><p>احذفهم. يشغلون مكاناً في القائمة ويكلّفك تخزين مواد.</p><h2>كيف تحسب هامش ربح أي صنف</h2><ol><li>احسب تكلفة المواد الخام</li><li>هامش الربح = سعر البيع - تكلفة المواد</li><li>نسبة الهامش = الهامش ÷ سعر البيع × 100</li></ol>`},
  "order-routing":{title:"توجيه الطلبات الذكي: أنهِ فوضى المطبخ",category:"العمليات",categoryColor:"#00c3ff",date:"15 مارس 2026",readTime:"5 دقائق",icon:"⚡",tags:["طلبات","مطبخ","كفاءة"],excerpt:"الفوضى في المطبخ ليست قدراً — هي نتيجة غياب نظام.",content:`<h2>من أين تأتي الفوضى؟</h2><p>بدون نظام توجيه واضح: الطلبات تتأخر وتضيع، الطباخ لا يعرف أيهم الأقدم ولا كم من الوقت مضى.</p><blockquote><p>المطبخ المنظم لا يحتاج صراخاً. الأوامر تتدفق بشكل هادئ وكل شخص يعرف دوره.</p></blockquote><h2>مبدأ FIFO في الطلبات</h2><p>كل طلب يُرتّب زمنياً. لا يُبدأ بطلب جديد إذا كان هناك طلب أقدم لم ينتهِ من نفس المحطة.</p><h2>تقسيم الطلب على المحطات</h2><p>طلب برغر + سلطة + عصير يذهب لثلاث محطات في وقت واحد، لا بالتتابع.</p><h2>3 مستويات التوجيه</h2><h3>المستوى الأول: اللوح والبطاقات</h3><p>لوح في المطبخ مقسّم لمحطات، كل طلب بطاقة تُعلَّق عند الاستلام وتُزال عند الإنجاز.</p><h3>المستوى الثاني: طابعة المطبخ KOT</h3><p>الطلب يُدخل من الكاشير ويطبع مباشرة في المطبخ. لا صراخ، لا أخطاء سمعية.</p><h3>المستوى الثالث: شاشة المطبخ KDS</h3><p>شاشة تُظهر كل الطلبات مرتبة زمنياً مع مؤقت لكل طلب.</p>`},
  "iraq-restaurant-market":{title:"سوق المطاعم في العراق 2026",category:"السوق العراقي",categoryColor:"#ffd60a",date:"5 مارس 2026",readTime:"10 دقائق",icon:"🇮🇶",tags:["عراق","سوق","تحليل"],excerpt:"تحليل شامل لواقع قطاع المطاعم في العراق.",content:`<div class="stat-box"><div class="stat-item"><div class="stat-num" style="color:#ffd60a">42%</div><div class="stat-label">نمو قطاع المطاعم 2023-2026</div></div><div class="stat-item"><div class="stat-num" style="color:#00c3ff">8M+</div><div class="stat-label">سكان بغداد</div></div><div class="stat-item"><div class="stat-num" style="color:#00ff88">23%</div><div class="stat-label">نمو التوصيل خلال عام</div></div></div><h2>واقع السوق العراقي</h2><p>قطاع المطاعم في العراق يشهد نمواً ملحوظاً — الطبقة الوسطى تتوسع وإنفاقها على الطعام خارج المنزل يتزايد سنة بعد سنة.</p><blockquote><p>العراق سوق ضخم وغير مُشبع. المطعم الذي يُدار احترافياً يُنافس عشرات المطاعم غير المنظمة.</p></blockquote><h2>أبرز الفرص</h2><ul><li>انتشار التوصيل عبر المنصات</li><li>غياب المنافسة الاحترافية خارج بغداد</li><li>الشباب يطلب تنوعاً أكبر</li><li>الرقمنة المتسارعة</li></ul><h2>التحديات الحقيقية</h2><ul><li>ارتفاع تكاليف المواد الخام وتقلبها</li><li>شُح الكوادر المدرّبة</li><li>المنافسة غير المنظمة</li><li>انقطاع الكهرباء</li></ul>`},
  "digital-transformation":{title:"التحول الرقمي: ما تحتاجه فعلاً",category:"التقنية",categoryColor:"#00c3ff",date:"20 أبريل 2026",readTime:"7 دقائق",icon:"💻",tags:["تقنية","رقمنة","نظام"],excerpt:"ليس كل تقنية تستحق استثمارك.",content:`<h2>الفخ الشائع: التقنية للتقنية</h2><p>كثير من أصحاب المطاعم يشترون أجهزة وبرامج باهظة اعتقاداً أنها ستحل مشاكلهم. ثم يكتشفون أن الجهاز يجمع الغبار.</p><blockquote><p>مطعم بـ Excel منضبط يُحقق نتائج أفضل من مطعم بأغلى برنامج لا يُستخدم صح.</p></blockquote><h2>الأولويات الرقمية</h2><h3>الأولوية الأولى: نظام الكاشير POS</h3><p>يُسجّل كل طلب، يُرسله للمطبخ، ويجمع بيانات المبيعات تلقائياً. اختر نظاماً سهل الاستخدام بالعربية ويعمل بدون إنترنت.</p><h3>الأولوية الثانية: Google My Business (مجاني)</h3><p>مطعمك مُسجّل على Google Maps؟ تقييماتك محدّثة؟ هذا مجاني ويجلب زبائن حقيقيين كل يوم.</p><h3>الأولوية الثالثة: Instagram منظم</h3><p>3-4 منشورات أسبوعياً تُظهر طعامك وفريقك وأجواء مطعمك.</p><h2>ما لا تحتاجه</h2><ul><li>تطبيق مخصص لمطعمك</li><li>نظام CRM متطور</li><li>روبوت ذكاء اصطناعي للتواصل</li></ul>`},
  "customer-experience":{title:"تجربة الزبون: لماذا يعود أو لا يعود؟",category:"الزبائن",categoryColor:"#00ff88",date:"25 أبريل 2026",readTime:"6 دقائق",icon:"🤝",tags:["زبائن","خدمة","تجربة"],excerpt:"سر مطاعم تملأ طوال الأسبوع.",content:`<h2>لماذا زبائن يعودون وآخرون لا؟</h2><p>الجواب في الغالب ليس الطعام. مطاعم بطعام عادي تملأ كل يوم، ومطاعم بطعام ممتاز تُغلق. الفارق هو <strong>تجربة الزبون الكاملة</strong>.</p><blockquote><p>الزبون يغفر طعاماً أقل مما توقع إذا عاملته بشكل جيد.</p></blockquote><h2>7 لحظات حاسمة في تجربة الزبون</h2><ol><li>قبل الوصول: بحثه عنك أونلاين</li><li>الوصول والاستقبال: أهم 15 ثانية</li><li>قراءة القائمة والطلب</li><li>الانتظار: أبلغه بالوقت الحقيقي</li><li>تقديم الطلب</li><li>أثناء الأكل: تحقق مرة واحدة</li><li>الحساب والمغادرة: الانطباع الأخير</li></ol><h2>التعامل مع الشكاوى</h2><ol><li>اسمع بالكامل بدون مقاطعة</li><li>اعتذر بصدق</li><li>قدّم حلاً فورياً</li><li>لا تجادل أمام الزبائن الآخرين</li></ol>`},
  "supplier-management":{title:"إدارة الموردين: بناء علاقات تضمن جودتك",category:"العمليات",categoryColor:"#00c3ff",date:"28 أبريل 2026",readTime:"6 دقائق",icon:"🚚",tags:["موردون","مشتريات","جودة"],excerpt:"مورد موثوق يساوي استقرار مطعمك.",content:`<h2>لماذا الموردون شركاء؟</h2><p>المورد الجيد يضمن لك ثلاثة أشياء: <strong>الجودة الثابتة، الاستمرارية، والأولوية في الأزمات</strong>. في مواسم الشح، المورد الذي تعامل معه بانتظام يخدمك قبل غيرك.</p><blockquote><p>في رمضان 2025، ارتفعت أسعار الدجاج وشحّ المعروض. المطاعم التي كان عندها علاقات قوية مع موردييها حصلت على احتياجاتها.</p></blockquote><h2>معايير اختيار المورد الجيد</h2><ul><li>الجودة الثابتة في كل تسليم</li><li>الالتزام بالوقت</li><li>التواصل المبكر عند المشاكل</li></ul><h2>قاعدة الثلاثة موردين</h2><p>لكل مادة أساسية، يجب أن يكون عندك مورد رئيسي ومورد بديل جاهز. هذا يحميك من الانقطاع المفاجئ.</p><h2>كيف تبني علاقة قوية</h2><ol><li>الدفع بانتظام وفي الموعد</li><li>إخباره مسبقاً عند تغير الاحتياج</li><li>التغذية الراجعة المباشرة عند مشكلة الجودة</li><li>الزيارة العرضية لمستودعه</li></ol>`},
};

const ALL_POSTS_LIST = [
  {slug:"inventory-waste",title:"كيف تقلل هدر مطعمك بنسبة 30%",category:"المخزون",categoryColor:"#ffd60a",icon:"📦",readTime:"6 دقائق"},
  {slug:"peak-hours",title:"ساعات الذروة: كيف تستعد وتضاعف إيراداتك",category:"التحليلات",categoryColor:"#00c3ff",icon:"📊",readTime:"5 دقائق"},
  {slug:"staff-management",title:"إدارة موظفي المطعم: من الفوضى إلى النظام",category:"الموظفون",categoryColor:"#00ff88",icon:"👥",readTime:"8 دقائق"},
  {slug:"menu-engineering",title:"هندسة قائمة الطعام: أي أصناف تجلب الربح؟",category:"الربحية",categoryColor:"#1a4fc4",icon:"🍽️",readTime:"7 دقائق"},
  {slug:"order-routing",title:"توجيه الطلبات الذكي",category:"العمليات",categoryColor:"#00c3ff",icon:"⚡",readTime:"5 دقائق"},
  {slug:"iraq-restaurant-market",title:"سوق المطاعم في العراق 2026",category:"السوق العراقي",categoryColor:"#ffd60a",icon:"🇮🇶",readTime:"10 دقائق"},
  {slug:"digital-transformation",title:"التحول الرقمي: ما تحتاجه فعلاً",category:"التقنية",categoryColor:"#00c3ff",icon:"💻",readTime:"7 دقائق"},
  {slug:"customer-experience",title:"تجربة الزبون: لماذا يعود أو لا يعود؟",category:"الزبائن",categoryColor:"#00ff88",icon:"🤝",readTime:"6 دقائق"},
  {slug:"supplier-management",title:"إدارة الموردين",category:"العمليات",categoryColor:"#00c3ff",icon:"🚚",readTime:"6 دقائق"},
];

function Nav({categoryColor}) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 80);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"20px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",background:scrolled?"rgba(0,8,20,.97)":"rgba(0,8,20,.7)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,.05)",transition:"all .4s ease",direction:"rtl"}}>
        <a href="/" style={{fontFamily:"Space Mono",fontSize:20,fontWeight:700,color:"#f0f4ff",textDecoration:"none",display:"flex",alignItems:"center",gap:10}}>
          <span style={{width:8,height:8,background:"#1a4fc4",borderRadius:"50%",animation:"blink 2s infinite"}}/>IQR<span style={{color:"#1a4fc4",fontSize:12,fontFamily:"Cairo",marginRight:6,fontWeight:400}}>لإدارة المطاعم</span>
        </a>
        <div style={{display:"flex",gap:20,alignItems:"center"}}>
          <a href="/blog/" style={{fontFamily:"Cairo",fontSize:13,fontWeight:700,color:"rgba(240,244,255,.5)",textDecoration:"none"}}>← المدونة</a>
          <a href="/pricing/" style={{fontFamily:"Cairo",fontSize:13,fontWeight:700,padding:"8px 20px",background:"rgba(205,127,50,.15)",color:"#cd7f32",border:"1px solid rgba(205,127,50,.3)",borderRadius:4,textDecoration:"none"}}>🔑 الاشتراكات</a>
        </div>
      </nav>
      <div style={{position:"fixed",top:0,left:0,right:0,height:2,zIndex:101}}>
        <div style={{height:"100%",background:`linear-gradient(to left,${categoryColor},#1a4fc4)`,width:`${progress}%`,transition:"width .1s ease",boxShadow:`0 0 8px ${categoryColor}`}}/>
      </div>
    </>
  );
}

export default function BlogPostClient({params: propParams}) {
  const routeParams = useParams();
  const rawSlug = propParams?.slug || routeParams?.slug || "inventory-waste";
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const post = POSTS[slug];
  const isFree = FREE_SLUGS.includes(slug);

  if (!post) {
    return (
      <>
        <style>{G}</style>
        <div style={{background:"#000814",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",direction:"rtl"}}>
          <div style={{fontSize:48,marginBottom:20}}>📄</div>
          <h1 style={{fontFamily:"Cairo",fontSize:28,fontWeight:900,color:"#f0f4ff",marginBottom:12}}>المقال قيد التحضير</h1>
          <a href="/blog/" style={{fontFamily:"Cairo",fontSize:14,fontWeight:700,padding:"12px 28px",background:"#1a4fc4",color:"#fff",borderRadius:8,textDecoration:"none"}}>العودة للمدونة</a>
        </div>
      </>
    );
  }

  const related = ALL_POSTS_LIST.filter(p=>p.slug!==slug).slice(0,3);
  const ArticleContent = () => <div className="prose" dangerouslySetInnerHTML={{__html: post.content}} />;

  return (
    <>
      <style>{G}</style>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
        <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(26,79,196,.07),transparent 70%)",top:0,right:0,filter:"blur(80px)",animation:"orb 15s ease-in-out infinite"}}/>
      </div>
      <Nav categoryColor={post.categoryColor}/>

      <header style={{paddingTop:120,paddingBottom:60,paddingLeft:48,paddingRight:48,maxWidth:860,margin:"0 auto",position:"relative",zIndex:2,direction:"rtl",animation:"fadeUp .8s ease both"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:32}}>
          <a href="/blog/" style={{fontFamily:"Cairo",fontSize:12,color:"rgba(240,244,255,.3)",textDecoration:"none"}}>المدونة</a>
          <span style={{color:"rgba(240,244,255,.15)",fontSize:14}}>›</span>
          <span style={{fontFamily:"Cairo",fontSize:12,color:post.categoryColor,fontWeight:700}}>{post.category}</span>
          {isFree && <span style={{fontFamily:"Cairo",fontSize:10,fontWeight:700,color:"#00ff88",background:"rgba(0,255,136,.1)",border:"1px solid rgba(0,255,136,.2)",borderRadius:99,padding:"2px 8px"}}>مجاني</span>}
        </div>
        <div style={{fontSize:56,marginBottom:24}}>{post.icon}</div>
        <h1 style={{fontFamily:"Cairo",fontSize:"clamp(28px,4.5vw,52px)",fontWeight:900,color:"#f0f4ff",lineHeight:1.15,marginBottom:20}}>{post.title}</h1>
        <p style={{fontFamily:"Cairo",fontSize:17,color:"rgba(240,244,255,.5)",lineHeight:1.8,marginBottom:32,maxWidth:650}}>{post.excerpt}</p>
        <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700,padding:"5px 14px",borderRadius:99,background:`${post.categoryColor}15`,color:post.categoryColor,border:`1px solid ${post.categoryColor}30`}}>{post.category}</span>
          <span style={{fontFamily:"Cairo",fontSize:13,color:"rgba(240,244,255,.3)"}}>{post.date}</span>
          <span style={{fontFamily:"Space Mono",fontSize:12,color:"rgba(240,244,255,.3)"}}>{post.readTime}</span>
        </div>
        <div style={{height:1,background:`linear-gradient(to left,transparent,${post.categoryColor}60,transparent)`,marginTop:40}}/>
      </header>

      <main style={{maxWidth:860,margin:"0 auto",padding:"0 48px 60px",position:"relative",zIndex:2,direction:"rtl"}}>
        {isFree ? (
          <ArticleContent />
        ) : (
          <BlogGate>
            <ArticleContent />
          </BlogGate>
        )}
      </main>

      {/* CTA */}
      <div style={{maxWidth:860,margin:"0 auto 80px",padding:"0 48px",position:"relative",zIndex:2}}>
        <div style={{background:"linear-gradient(135deg,rgba(26,79,196,.1),rgba(0,195,255,.05))",border:"1px solid rgba(26,79,196,.25)",borderRadius:16,padding:"48px",textAlign:"center",direction:"rtl"}}>
          <div style={{fontSize:36,marginBottom:16}}>🚀</div>
          <h3 style={{fontFamily:"Cairo",fontSize:24,fontWeight:900,color:"#f0f4ff",marginBottom:12}}>تبي تطبق هذا في مطعمك؟</h3>
          <p style={{fontFamily:"Cairo",fontSize:15,color:"rgba(240,244,255,.45)",marginBottom:32,lineHeight:1.8,maxWidth:500,margin:"0 auto 32px"}}>محادثة مجانية مع فريق IQR — نفهم وضعك ونحدد من أين تبدأ.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="https://wa.me/9647734383431" target="_blank" style={{fontFamily:"Cairo",fontSize:14,fontWeight:700,padding:"14px 36px",background:"#1a4fc4",color:"#fff",borderRadius:8,textDecoration:"none",boxShadow:"0 0 30px rgba(26,79,196,.3)"}}>📲 تواصل على واتساب</a>
            <a href="/pricing/" style={{fontFamily:"Cairo",fontSize:14,fontWeight:700,padding:"13px 36px",background:"transparent",color:"rgba(240,244,255,.6)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,textDecoration:"none"}}>🔑 الخطة البرونزية</a>
          </div>
        </div>
      </div>

      {/* RELATED */}
      <section style={{maxWidth:860,margin:"0 auto 100px",padding:"0 48px",position:"relative",zIndex:2,direction:"rtl"}}>
        <h2 style={{fontFamily:"Cairo",fontSize:24,fontWeight:900,color:"#f0f4ff",marginBottom:24}}>استمر في القراءة</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
          {related.map(r=>(
            <a key={r.slug} href={`/blog/${r.slug}/`} style={{display:"block",background:"#0a1628",border:"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"24px",textDecoration:"none",transition:"all .25s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor="rgba(26,79,196,.3)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor="rgba(255,255,255,.05)"}}>
              <div style={{fontSize:28,marginBottom:14}}>{r.icon}</div>
              <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,background:`${r.categoryColor}15`,color:r.categoryColor,border:`1px solid ${r.categoryColor}25`}}>{r.category}</span>
              <h3 style={{fontFamily:"Cairo",fontSize:15,fontWeight:900,color:"#f0f4ff",margin:"14px 0 10px",lineHeight:1.4}}>{r.title}</h3>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:16,color:"#1a4fc4"}}>
                <span style={{fontFamily:"Cairo",fontSize:12,fontWeight:700}}>اقرأ المقال</span>
                <span>←</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer style={{background:"#000510",borderTop:"1px solid rgba(255,255,255,.05)",padding:"40px 48px",textAlign:"center",position:"relative",zIndex:2}}>
        <p style={{fontFamily:"Cairo",fontSize:12,color:"rgba(240,244,255,.2)"}}>© 2026 IQR لإدارة وتطوير المطاعم — العراق — جميع الحقوق محفوظة</p>
      </footer>
    </>
  );
}
