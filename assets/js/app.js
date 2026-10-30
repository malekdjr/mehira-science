/* ============================================================================
   MEHIRA SCIENCE — منطق الموقع
   لا حاجة لتعديل هذا الملف. كل المحتوى في content.js
   ========================================================================== */
(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  /* يمنع كسر الصفحة إن احتوى المحتوى على رموز HTML */
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* وضع المعاينة: لوحة التحكم تضع مسودة في المتصفح وتفتح الموقع بـ ?preview */
  const draft = (() => {
    if (!/[?&]preview\b/.test(location.search)) return null;
    try { return JSON.parse(localStorage.getItem('mehira.draft')); } catch (e) { return null; }
  })();
  const C = draft || window.CONTENT;
  if (!C) { console.error('MEHIRA: content.js لم يُحمَّل'); return; }
  if (draft) {
    const bar = document.createElement('div');
    bar.className = 'preview-bar';
    bar.innerHTML = 'وضع المعاينة — هذه التغييرات لم تُنشر بعد. <a href="./">عرض الموقع المنشور</a>';
    document.body.prepend(bar);
  }

  /* ===================================================== أيقونات */
  const ICON = {
    book:  '<path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2H4zm16 0h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2H20z"/>',
    play:  '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 5.5 7 4.5-7 4.5z"/>',
    check: '<path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>',
    target:'<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>',
    clock: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.6V6h-2v7.4l5 3 1-1.7z"/>',
    quiz:  '<path d="M11 18h2v-2h-2zm1-16a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM12 6a4 4 0 0 0-4 4h2a2 2 0 1 1 3.4 1.4l-1.2 1.3A3 3 0 0 0 11 15h2a1.7 1.7 0 0 1 .6-1.3l.9-.9A4 4 0 0 0 12 6z"/>',
    video: '<path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11z"/>',
    file:  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 7V3.5L18.5 9zM8 13h8v2H8zm0 4h8v2H8zm0-8h3v2H8z"/>',
    down:  '<path d="M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z"/>',
    pin:   '<path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>',
    chat:  '<path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2zm3 6v2h2V9zm4 0v2h2V9zm4 0v2h2V9z"/>',
    send:  '<path d="M3 20.5 21 12 3 3.5 3 10l12 2-12 2z"/>'
  };
  const ico = (name, cls) =>
    `<svg class="${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICON[name] || ICON.check}</svg>`;

  /* ===================================================== التواصل */
  function wireContacts() {
    const c = C.contact || {};
    $$('[data-phone]').forEach(n => { n.textContent = c.phone || ''; });
    $$('[data-tel]').forEach(n => { n.href = 'tel:' + (c.phoneDial || c.phone || '').replace(/\s/g, ''); });

    const waText = encodeURIComponent('السلام عليكم أستاذ، أريد الاستفسار عن التسجيل في أفواج العلوم الطبيعية.');
    $$('[data-wa]').forEach(n => { n.href = `https://wa.me/${c.whatsapp}?text=${waText}`; });
    $$('[data-ig]').forEach(n => { n.href = c.instagram || '#'; });

    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ===================================================== الأرقام */
  function renderStats() {
    const g = $('#statsGrid');
    if (!g) return;
    (C.stats || []).forEach(s => {
      g.appendChild(el('div', 'stat reveal', `<b>${esc(s.value)}</b><span>${esc(s.label)}</span>`));
    });
  }

  /* ===================================================== المزايا والمنهجية */
  function renderAbout() {
    const f = $('#featuresGrid');
    if (f) (C.features || []).forEach(x => {
      f.appendChild(el('article', 'feature reveal',
        `<div class="feature__ico">${ico(x.icon)}</div>
         <h3>${esc(x.title)}</h3><p>${esc(x.text)}</p>`));
    });

    const m = $('#methodSteps');
    if (m) (C.method || []).forEach(x => {
      m.appendChild(el('li', '', `<b>${esc(x.title)}</b><p>${esc(x.text)}</p>`));
    });
  }

  /* ===================================================== التقدّم (محلي) */
  const STORE = 'mehira.progress.v1';
  const loadProgress = () => {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  };
  const saveProgress = (p) => {
    try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) { /* وضع التصفح الخاص */ }
  };
  let progress = loadProgress();

  const allUnits = () =>
    (C.fields || []).flatMap(f => (f.units || []).map(u => ({ field: f, unit: u, key: f.id + ':' + u.code })));

  function refreshProgress() {
    const units = allUnits();
    /* وحدة بمستويات تُحسب بنسبة المستويات المُنجزة */
    const part = (u) => levelsOf(u.unit)
      ? passedCount(u.key, u.unit) / u.unit.levels.length
      : (progress[u.key] && progress[u.key].passed ? 1 : 0);
    const done = units.filter(u => part(u) === 1).length;
    const started = units.some(u => part(u) > 0);
    const pct = units.length ? Math.round(units.reduce((n, u) => n + part(u), 0) / units.length * 100) : 0;

    const bar = $('#progressBar');
    if (bar) bar.style.width = pct + '%';

    const lbl = $('#progressLabel');
    if (lbl) {
      lbl.textContent = !started
        ? 'لم تبدأ بعد — اختر وحدة وابدأ الاختبار'
        : `تقدّمك ${pct}% — أنجزت ${done} من ${units.length} وحدة بالكامل`;
    }
  }

  /* ===================================================== الدروس */
  let activeField = (C.fields && C.fields[0]) ? C.fields[0].id : null;

  function renderTabs() {
    const t = $('#fieldTabs');
    if (!t) return;
    t.innerHTML = '';
    (C.fields || []).forEach(f => {
      const b = el('button', 'tab' + (f.id === activeField ? ' is-active' : ''),
        `${esc(f.title)} — ${esc(f.subtitle)}`);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(f.id === activeField));
      b.addEventListener('click', () => { activeField = f.id; renderTabs(); renderUnits(); });
      t.appendChild(b);
    });
  }

  function renderUnits() {
    const g = $('#unitsGrid');
    if (!g) return;
    g.innerHTML = '';

    const field = (C.fields || []).find(f => f.id === activeField);
    if (!field || !(field.units || []).length) {
      g.appendChild(el('div', 'empty', `${ico('book')}<p>لا توجد وحدات في هذا المجال بعد.</p>`));
      return;
    }

    field.units.forEach(u => {
      const key = field.id + ':' + u.code;
      const st = progress[key];
      const L = levelsOf(u);
      const qn = questionCount(u);
      const lvDone = L ? passedCount(key, u) : 0;
      const done = L ? lvDone > 0 : st && st.passed;
      const stateText = L
        ? (lvDone ? `المستوى ${lvDone}/${L.length}` : 'لم تبدأ')
        : (done ? 'أنجزت ' + st.score + '/' + st.total : 'لم تبدأ');
      const files = resourcesFor(field.id, u.code).length;

      const card = el('button', 'unit reveal is-in' + (L ? ' unit--levels' : ''));
      card.type = 'button';
      card.innerHTML =
        `<div class="unit__top">
           <span class="unit__num">${esc(u.code)}</span>
           <span class="unit__state ${done ? 'unit__state--done' : 'unit__state--todo'}">${esc(stateText)}</span>
         </div>
         <h3>${esc(u.title)}</h3>
         <p>${esc(u.desc)}</p>
         ${L ? `<div class="unit__lv">${L.map((_, i) => `<i class="${i < lvDone ? 'is-on' : ''}"></i>`).join('')}<small>${L.length} مستويات · أسئلة كتابية</small></div>` : ''}
         <div class="unit__meta">
           <span>${ico('clock')}${esc(u.duration || '—')}</span>
           <span>${ico('quiz')}${qn} سؤال</span>
           ${files ? `<span>${ico('file')}${files} ملخص</span>` : ''}
           <span class="unit__go">افتح ←</span>
         </div>`;
      card.addEventListener('click', () => openLesson(field, u));
      g.appendChild(card);
    });
  }

  /* ===================================================== البرنامج */
  const STATUS = {
    open: { label: 'متاح',          cls: 'open' },
    full: { label: 'مغلق',          cls: 'full' },
    new:  { label: 'جديد',          cls: 'new'  },
    soon: { label: 'يُعلن لاحقاً',  cls: 'soon' }
  };
  const groups  = () => (C.schedule && C.schedule.groups) || [];
  const centers = () => C.centers || [];
  const centerOf = (id) => centers().find(c => c.id === id) || { id, name: id || '', ar: '' };
  const statusOf = (gr) => STATUS[gr.status] || STATUS.open;
  const timeOf = (gr) => `${gr.from} → ${gr.to}`;
  const mapLink = (c) => c.mapUrl ||
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c.map || c.name);

  function renderSchedule() {
    const note = $('#scheduleNote');
    if (note) note.textContent = (C.schedule && C.schedule.note) || '';

    const poster = $('#schedulePoster');
    if (poster) {
      if (C.schedule && C.schedule.poster) poster.href = C.schedule.poster;
      else poster.remove();
    }

    const g = $('#groupsGrid');
    if (!g) return;
    groups().forEach(gr => {
      const c = centerOf(gr.center), st = statusOf(gr);
      g.appendChild(el('article', `group group--${st.cls} reveal`,
        `<header class="group__head"><span>${esc(gr.name)}</span><small>${esc(c.name)}</small></header>
         <div class="group__body">
           <div class="group__row">
             <span class="group__day">${esc(gr.day)}</span>
             <span class="group__time">${esc(timeOf(gr))}</span>
           </div>
           <div class="group__row">
             <span class="group__day">${esc(c.ar)}</span>
             <span class="chip chip--${st.cls}">${esc(st.label)}</span>
           </div>
         </div>`));
    });
  }

  /* ===================================================== الملخصات (PDF) */
  const resources = () => (C.resources || []).filter(r => r && r.file);
  const resourcesFor = (fieldId, code) => resources().filter(r => r.field === fieldId && (!r.unit || r.unit === code));
  const fmtSize = (b) => !b ? '' : b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';

  function resourceHtml(r) {
    const f = (C.fields || []).find(x => x.id === r.field);
    const u = f && r.unit ? (f.units || []).find(x => x.code === r.unit) : null;
    const where = f ? `${f.title}${u ? ' · ' + u.code + ' — ' + u.title : ' · كل الوحدات'}` : 'عام';
    return `<a class="res" href="${esc(r.file)}" download target="_blank" rel="noopener">
              <span class="res__i">${ico('file')}<b>PDF</b></span>
              <span class="res__t"><b>${esc(r.title || 'ملخص')}</b><small>${esc(where)}${r.size ? ' · ' + fmtSize(r.size) : ''}</small></span>
              <span class="res__d">${ico('down')}<span>تحميل</span></span>
            </a>`;
  }

  function renderResources() {
    const g = $('#resourcesGrid');
    if (!g) return;
    const list = resources();
    if (!list.length) {
      g.innerHTML = `<div class="empty">${ico('file')}<p>ستُضاف ملخصات الأستاذ بصيغة PDF قريباً.</p></div>`;
      return;
    }
    const groups = [{ id: '', title: 'ملفات عامة' }].concat((C.fields || []).map(f => ({ id: f.id, title: `${f.title} — ${f.subtitle}` })));
    g.innerHTML = groups.map(gr => {
      const items = list.filter(r => (r.field || '') === gr.id);
      return items.length ? `<div class="res-group"><h3>${esc(gr.title)}</h3><div class="res-list">${items.map(resourceHtml).join('')}</div></div>` : '';
    }).join('');
  }

  /* ===================================================== المراكز */
  function renderCenters() {
    const g = $('#centersGrid');
    if (!g) return;
    centers().forEach(c => {
      const list = groups().filter(gr => gr.center === c.id);
      const open = list.filter(gr => gr.status !== 'full').length;
      const rows = list.map(gr => {
        const st = statusOf(gr);
        return `<li><span>${esc(gr.day)} <b dir="ltr">${esc(timeOf(gr))}</b></span>
                    <span class="chip chip--${st.cls}">${esc(st.label)}</span></li>`;
      }).join('');
      g.appendChild(el('article', 'center-card reveal',
        `<div class="center-card__top">
           <span class="center-card__pin">${ico('pin')}</span>
           <div><h3 dir="ltr">${esc(c.name)}</h3><p>${esc(c.ar)} · وهران</p></div>
         </div>
         <ul class="center-card__list">${rows || '<li><span>لا توجد أفواج حالياً</span></li>'}</ul>
         <div class="center-card__foot">
           <span>${list.length} ${list.length === 1 ? 'فوج' : 'أفواج'} · ${open} متاح</span>
           <a href="${esc(mapLink(c))}" target="_blank" rel="noopener">الخريطة ←</a>
         </div>`));
    });
  }

  /* ===================================================== التسجيلات */
  function renderRegistration() {
    const g = $('#regCards');
    if (g) (C.registration || []).forEach(r => {
      const items = (r.items || []).map(i =>
        `<li>${ico('check')}<span>${esc(i)}</span></li>`).join('');
      g.appendChild(el('article', 'reg-card reveal' + (r.hot ? ' reg-card--hot' : ''),
        `${r.tag ? `<span class="reg-card__tag">${esc(r.tag)}</span>` : ''}
         <h3>${esc(r.title)}</h3>
         <p class="reg-card__sub">${esc(r.sub)}</p>
         <ul>${items}</ul>`));
    });

    /* قائمة الأفواج تُبنى من برنامج الحصص */
    const area = $('#f-area');
    if (area) {
      area.appendChild(el('option', '', 'لا يهم / حسب المتاح'));
      groups().filter(gr => gr.status !== 'full').forEach(gr => {
        area.appendChild(el('option', '',
          esc(`${gr.name} — ${centerOf(gr.center).name} (${gr.day} ${gr.from})`)));
      });
    }

    const form = $('#regForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#f-name'), phone = $('#f-phone');
      let bad = false;
      [name, phone].forEach(f => {
        const ok = f.value.trim().length > 1;
        f.classList.toggle('is-bad', !ok);
        if (!ok && !bad) { f.focus(); bad = true; }
      });
      if (bad) return;

      const msg =
        'السلام عليكم أستاذ، أريد التسجيل.\n' +
        '• الاسم: ' + name.value.trim() + '\n' +
        '• الهاتف: ' + phone.value.trim() + '\n' +
        '• الدفعة: ' + $('#f-year').value + '\n' +
        '• الثانوية: ' + ($('#f-school').value.trim() || '—') + '\n' +
        '• الفوج المفضّل: ' + ($('#f-area').value || '—') +
        ($('#f-msg').value.trim() ? '\n• ملاحظة: ' + $('#f-msg').value.trim() : '');

      window.open(`https://wa.me/${C.contact.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  }

  /* ===================================================== شهادات */
  function renderQuotes() {
    const g = $('#quotesGrid');
    if (!g) return;
    (C.quotes || []).forEach(q => {
      g.appendChild(el('article', 'quote reveal',
        `<div class="quote__mark">”</div>
         <p>${esc(q.text)}</p>
         <div class="quote__by">
           <span class="quote__av">${esc((q.name || '؟').trim().charAt(0))}</span>
           <span><b>${esc(q.name)}</b><small>${esc(q.meta)}</small></span>
         </div>`));
    });
  }

  /* ===================================================== أسئلة شائعة */
  function renderFaq() {
    const g = $('#faqList');
    if (!g) return;
    (C.faq || []).forEach((f, i) => {
      const item = el('div', 'faq__item reveal');
      item.innerHTML =
        `<button class="faq__q" type="button" aria-expanded="false" aria-controls="faq-a-${i}">
           <span>${esc(f.q)}</span>
           <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
         </button>
         <div class="faq__a" id="faq-a-${i}"><p>${esc(f.a)}</p></div>`;
      const btn = $('.faq__q', item), pan = $('.faq__a', item);
      btn.addEventListener('click', () => {
        const open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
        pan.style.maxHeight = open ? pan.scrollHeight + 'px' : '0';
      });
      g.appendChild(item);
    });
  }

  /* ===================================================== نافذة الدرس */
  const modal = $('#lessonModal');
  let current = null;
  let lastFocus = null;

  function openLesson(field, unit) {
    current = { field, unit, key: field.id + ':' + unit.code };
    lastFocus = document.activeElement;

    $('#lessonField').textContent = `${field.title} · ${field.subtitle}`;
    $('#lessonTitle').textContent = `${unit.code} — ${unit.title}`;

    /* الفيديو */
    const p = $('#player');
    if (unit.video) {
      p.innerHTML =
        `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(unit.video)}?rel=0"
                 title="${esc(unit.title)}" allowfullscreen
                 allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
    } else {
      p.innerHTML =
        `<div class="player__soon">${ico('video')}
           <b>الفيديو قريباً</b>
           <p>سيُضاف شرح هذه الوحدة بالفيديو قريباً بإذن الله.</p>
         </div>`;
    }

    /* النقاط */
    const pts = $('#lessonPoints');
    pts.innerHTML = '';
    (unit.points || []).forEach(t => pts.appendChild(el('li', '', `<span>${esc(t)}</span>`)));

    /* وثيقة الوحدة ومصدرها (كتاب الأستاذ) */
    const fig = $('#lessonFigure');
    fig.innerHTML = unit.figure ? figureHtml(unit.figure.img, unit.figure.cap) : '';
    const src = $('#lessonSource');
    src.hidden = !unit.source;
    src.innerHTML = unit.source ? `${ico('book')}<span>المصدر: ${esc(unit.source)}</span>` : '';

    /* ملخصات PDF الخاصة بهذه الوحدة */
    const files = resourcesFor(field.id, unit.code);
    const fl = $('#lessonFiles');
    fl.innerHTML = files.length
      ? `<h4 class="pane__h">ملخصات للتحميل</h4><div class="res-list">${files.map(resourceHtml).join('')}</div>`
      : '';

    /* زر الاختبار يذكر المستويات */
    $('#goQuiz').textContent = levelsOf(unit) ? `ابدأ الاختبار (${unit.levels.length} مستويات)` : 'ابدأ الاختبار';

    showPane('lesson');
    buildQuiz();

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.modal__x', modal).focus();
  }

  function closeLesson() {
    modal.hidden = true;
    document.body.style.overflow = '';
    $('#player').innerHTML = '';     /* يوقف الفيديو */
    current = null;
    if (lastFocus) lastFocus.focus();
  }

  function showPane(name) {
    $$('.modal__tab', modal).forEach(t => t.classList.toggle('is-active', t.dataset.pane === name));
    $$('.pane', modal).forEach(p => p.classList.toggle('is-active', p.dataset.paneBody === name));
    $('.modal__body').scrollTop = 0;
  }

  if (modal) {
    $$('[data-close]', modal).forEach(n => n.addEventListener('click', closeLesson));
    $$('.modal__tab', modal).forEach(t => t.addEventListener('click', () => showPane(t.dataset.pane)));
    $('#goQuiz').addEventListener('click', () => showPane('quiz'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeLesson();
    });
  }

  /* وثيقة (صورة) قابلة للتكبير — تفتح بحجمها الكامل في نافذة جديدة */
  function figureHtml(src, cap) {
    return `<figure class="doc">
              <a href="${esc(src)}" target="_blank" rel="noopener" title="تكبير الوثيقة">
                <img src="${esc(src)}" alt="${esc(cap || 'وثيقة')}" loading="lazy">
              </a>
              ${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}
            </figure>`;
  }

  /* ===================================================== محرّك الاختبار
     وحدة عادية: unit.quiz (اختيار من متعدد).
     وحدة بمستويات: unit.levels = [{ title, desc, pass, questions: [...] }]
       أنواع الأسئلة: mcq · tf (صح/خطأ) · write (إجابة كتابية تُصحَّح بسلّم تنقيط) */
  const LSTORE = 'mehira.levels.v1';
  const ASTORE = 'mehira.answers.v1';
  const readStore = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
  const writeStore = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* */ } };
  let levelProg = readStore(LSTORE);
  let drafts = readStore(ASTORE);

  const WRITE_WEIGHT = 2;                 /* السؤال الكتابي = سؤالين من الاختيار */
  const levelsOf = (u) => (Array.isArray(u.levels) && u.levels.length ? u.levels : null);
  const levelPass = (L) => Number(L.pass) || 60;
  const levelState = (key, i) => (levelProg[key] && levelProg[key][i]) || null;
  const passedCount = (key, u) => (levelsOf(u) || []).filter((L, i) => (levelState(key, i) || {}).passed).length;
  const isUnlocked = (key, i) => i === 0 || !!(levelState(key, i - 1) || {}).passed;
  const questionCount = (u) => levelsOf(u)
    ? u.levels.reduce((n, L) => n + (L.questions || []).length, 0)
    : (u.quiz || []).length;

  const TYPE_LABEL = { mcq: 'اختيار من متعدد', tf: 'صح أم خطأ', write: 'إجابة كتابية' };
  const KIND_LABEL = { analysis: 'تحليل وثيقة', interpret: 'تفسير', text: 'نص علمي', apply: 'تطبيق / حساب', hypothesis: 'فرضية' };

  let run = null;   /* { qs, li, qi, got: [], max: [], answered } */

  function buildQuiz() {
    if (!current) return;
    if (levelsOf(current.unit)) renderLevels();
    else startRun(current.unit.quiz || [], -1);
  }

  /* ---------------------------------------------- اختيار المستوى */
  function renderLevels() {
    run = null;
    const wrap = $('#quizWrap');
    const { unit, key } = current;
    const L = levelsOf(unit);
    const done = passedCount(key, unit);
    wrap.innerHTML =
      `<div class="lv-head">
         <div><b>اختبار متدرّج — ${L.length} مستويات</b>
           <p>كل مستوى يفتح الذي بعده. المستويات الأخيرة فيها أسئلة كتابية على نمط البكالوريا تُصحَّح حسب المنهجية والمصطلحات.</p></div>
         <span class="lv-head__p">${done}/${L.length}</span>
       </div>`;
    const grid = el('div', 'lv-grid');
    L.forEach((lv, i) => {
      const st = levelState(key, i);
      const open = isUnlocked(key, i);
      const types = {};
      (lv.questions || []).forEach(q => { const t = q.type || 'mcq'; types[t] = (types[t] || 0) + 1; });
      const chips = Object.entries(types).map(([t, n]) =>
        `<span class="lv-chip lv-chip--${t}">${n} ${esc(TYPE_LABEL[t] || t)}</span>`).join('');
      const b = el('button', 'lv' + (st && st.passed ? ' is-passed' : '') + (open ? '' : ' is-locked'),
        `<span class="lv__n">${st && st.passed ? ico('check') : i + 1}</span>
         <span class="lv__body">
           <b>${esc(lv.title || 'المستوى ' + (i + 1))}</b>
           <small>${esc(lv.desc || '')}</small>
           <span class="lv__chips">${chips}</span>
         </span>
         <span class="lv__state">${!open ? '🔒 أنجز المستوى السابق' : st ? `أفضل نتيجة ${st.best}%` : 'ابدأ ←'}</span>`);
      b.type = 'button';
      b.disabled = !open;
      b.addEventListener('click', () => startRun(lv.questions || [], i));
      grid.appendChild(b);
    });
    wrap.appendChild(grid);
    if (done) {
      const reset = el('button', 'lv-reset', 'إعادة كل المستويات من البداية');
      reset.type = 'button';
      reset.addEventListener('click', () => {
        if (!confirm('مسح نتائج مستويات هذه الوحدة؟')) return;
        delete levelProg[key];
        writeStore(LSTORE, levelProg);
        syncUnitProgress();
        renderLevels();
      });
      wrap.appendChild(reset);
    }
  }

  function startRun(qs, li) {
    run = { qs, li, qi: 0, got: [], max: qs.map(q => (q.type === 'write' ? WRITE_WEIGHT : 1)), answered: false };
    renderStep();
  }

  /* ---------------------------------------------- عرض السؤال */
  function renderStep() {
    const wrap = $('#quizWrap');
    wrap.innerHTML = '';
    const { qs } = run;

    if (!qs.length) {
      wrap.appendChild(el('div', 'empty', `${ico('quiz')}<p>لا توجد أسئلة هنا بعد.</p>`));
      return;
    }
    if (run.qi >= qs.length) return renderResult();

    const q = qs[run.qi];
    run.answered = false;

    if (run.li >= 0) {
      const lv = levelsOf(current.unit)[run.li];
      const top = el('div', 'quiz__lv',
        `<button type="button" class="quiz__back">← المستويات</button><span>${esc(lv.title || '')}</span>`);
      $('.quiz__back', top).addEventListener('click', () => {
        if (run.qi > 0 && !confirm('الخروج من المستوى؟ لن تُحفظ نتيجته.')) return;
        renderLevels();
      });
      wrap.appendChild(top);
    }

    wrap.appendChild(el('div', 'quiz__bar',
      `<span class="quiz__count">${run.qi + 1} / ${qs.length}</span>
       <span class="quiz__track"><i style="width:${(run.qi / qs.length) * 100}%"></i></span>`));

    const meta = [];
    if (q.type === 'write') meta.push(`<span class="quiz__tag quiz__tag--write">${ico('quiz')}سؤال كتابي · ${esc(KIND_LABEL[q.kind] || 'تحليل')}</span>`);
    else if (q.type === 'tf') meta.push(`<span class="quiz__tag">صح أم خطأ؟</span>`);
    if (q.ref) meta.push(`<span class="quiz__src">${ico('book')}<span>من كتاب الأستاذ · ${esc(q.ref)}</span></span>`);
    if (meta.length) wrap.appendChild(el('div', 'quiz__meta', meta.join('')));

    wrap.appendChild(el('p', 'quiz__q', esc(q.q).replace(/\n/g, '<br>')));
    if (q.img) wrap.appendChild(el('div', 'quiz__doc', figureHtml(q.img, q.cap || 'الوثيقة — من كتاب الأستاذ')));
    if (q.table) wrap.appendChild(el('div', 'quiz__table', tableHtml(q.table)));

    if (q.type === 'write') return renderWrite(q, wrap);
    if (q.type === 'tf') return renderChoices(q, wrap, ['صحيح', 'خطأ'], q.answer ? 0 : 1);
    return renderChoices(q, wrap, q.options || [], q.answer);
  }

  /* جدول من نص: سطر لكل صف، والخانات مفصولة بـ | — السطر الأول عناوين */
  function tableHtml(src) {
    const rows = String(src).trim().split('\n').map(r => r.split('|').map(c => c.trim()));
    const [head, ...body] = rows;
    return `<table class="dtable"><thead><tr>${head.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
            <tbody>${body.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th>${esc(c)}</th>` : `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }

  function renderChoices(q, wrap, labels, correct) {
    const opts = el('div', 'quiz__opts' + (q.type === 'tf' ? ' quiz__opts--tf' : ''));
    const letters = ['أ', 'ب', 'ج', 'د', 'هـ'];
    labels.forEach((text, i) => {
      const k = q.type === 'tf' ? (i === 0 ? '✓' : '✗') : (letters[i] || i + 1);
      const b = el('button', 'opt', `<span class="opt__k">${k}</span><span>${esc(text)}</span>`);
      b.type = 'button';
      b.addEventListener('click', () => {
        if (run.answered) return;
        run.answered = true;
        $$('.opt', opts).forEach((x, j) => {
          x.disabled = true;
          if (j === correct) x.classList.add('is-right');
          else if (j === i) x.classList.add('is-wrong');
        });
        const ok = i === correct;
        run.got[run.qi] = ok ? 1 : 0;
        if (q.explain) {
          wrap.appendChild(el('p', 'quiz__exp',
            `<b>${ok ? 'إجابة صحيحة' : 'الإجابة الصحيحة'}:</b> ${esc(q.explain)}`));
        }
        wrap.appendChild(nextNav());
        $('.quiz__nav .btn', wrap).focus();
      });
      opts.appendChild(b);
    });
    wrap.appendChild(opts);
  }

  function nextNav(extra) {
    const nav = el('div', 'quiz__nav');
    if (extra) nav.appendChild(extra);
    const last = run.qi + 1 >= run.qs.length;
    const next = el('button', 'btn btn--primary', last ? 'عرض النتيجة' : 'السؤال التالي');
    next.type = 'button';
    next.addEventListener('click', () => { run.qi++; renderStep(); $('.modal__body').scrollTop = 0; });
    nav.appendChild(next);
    return nav;
  }

  /* ---------------------------------------------- السؤال الكتابي */
  function renderWrite(q, wrap) {
    const G = window.MehiraGrader;
    const dkey = `${current.key}|${run.li}|${run.qi}`;
    const guide = G && G.METHOD[q.kind];

    if (guide) {
      wrap.appendChild(el('details', 'wq__guide',
        `<summary>${ico('target')} منهجية الإجابة: ${esc(guide.name)}</summary>
         <ol>${guide.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`));
    }

    const box = el('div', 'wq');
    const ta = el('textarea', 'wq__ta');
    ta.rows = q.kind === 'text' ? 12 : 8;
    ta.placeholder = 'اكتب إجابتك هنا كما تكتبها في ورقة البكالوريا…';
    ta.value = drafts[dkey] || '';
    const count = el('span', 'wq__count');
    const check = el('button', 'btn btn--primary', `${ico('check')} صحّح إجابتي`);
    check.type = 'button';
    const paint = () => {
      const n = G ? G.wordCount(ta.value) : 0;
      count.textContent = `${n} كلمة` + (q.min ? ` · المنصوح به ${q.min} كلمة على الأقل` : '');
      count.classList.toggle('is-low', !!q.min && n < q.min);
      check.disabled = n < 3;
    };
    ta.addEventListener('input', () => { drafts[dkey] = ta.value; writeStore(ASTORE, drafts); paint(); });
    paint();
    const feedback = el('div', 'wq__fb');
    box.append(ta, el('div', 'wq__bar', ''), feedback);
    $('.wq__bar', box).append(count, check);
    wrap.appendChild(box);

    let nav = null;
    check.addEventListener('click', () => {
      if (!G) return;
      const r = G.grade(q, ta.value);
      run.got[run.qi] = Math.round((r.score / r.total) * WRITE_WEIGHT * 100) / 100;
      feedback.innerHTML = feedbackHtml(q, r);
      check.innerHTML = `${ico('check')} أعد التصحيح بعد التعديل`;
      if (!nav) { nav = nextNav(); wrap.appendChild(nav); }
      feedback.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    if (!G) feedback.innerHTML = '<p class="wq__warn">تعذّر تحميل المصحّح الآلي. حدّث الصفحة.</p>';
  }

  function feedbackHtml(q, r) {
    const crit = (list) => list.map(c =>
      `<li class="${c.ok ? 'is-ok' : c.partial ? 'is-part' : 'is-miss'}">
         <span class="fb__i">${c.ok ? '✓' : c.partial ? '◐' : '✗'}</span>
         <span class="fb__t">${esc(c.t)}</span>
         <span class="fb__p" dir="ltr">${c.got} / ${c.p}</span>
       </li>`).join('');
    const missing = [...r.content, ...r.method].filter(c => !c.ok);
    return `
      <div class="fb fb--${r.bandKey}">
        <div class="fb__head">
          <div><small>علامتك</small><b dir="ltr">${r.score} / ${r.total}</b></div>
          <div class="fb__band">${esc(r.band)} · ${r.pct}%</div>
        </div>
        <div class="fb__track"><i style="width:${r.pct}%"></i></div>
        ${r.short ? `<p class="wq__warn">⚠ إجابتك قصيرة (${r.words} كلمة). في البكالوريا تحتاج إجابة مفصّلة${q.kind === 'apply' ? ' ولا تكتفِ بالنتيجة' : ' — خُفّضت العلامة'}.</p>` : ''}
        ${r.warnings.map(w => `<p class="wq__warn">⚠ ${esc(w)}</p>`).join('')}
        ${r.content.length ? `<h5>المضمون العلمي</h5><ul class="fb__list">${crit(r.content)}</ul>` : ''}
        ${r.method.length ? `<h5>المنهجية</h5><ul class="fb__list">${crit(r.method)}</ul>` : ''}
        ${missing.length ? `<p class="fb__tip">💡 لتحسين إجابتك أضف: ${missing.slice(0, 3).map(c => '«' + esc(c.t) + '»').join('، ')}.</p>` : '<p class="fb__tip fb__tip--ok">🎉 إجابة كاملة! كل عناصر سلّم التنقيط موجودة.</p>'}
        ${q.model ? `<details class="fb__model"><summary>الإجابة النموذجية</summary><p>${esc(q.model).replace(/\n/g, '<br>')}</p></details>` : ''}
        <p class="fb__note">التصحيح آلي حسب سلّم تنقيط الأستاذ (الكلمات العلمية والمنهجية). قارن دائماً مع الإجابة النموذجية.</p>
      </div>`;
  }

  /* ---------------------------------------------- النتيجة */
  function syncUnitProgress() {
    if (!current) return;
    const { unit, key } = current;
    const L = levelsOf(unit);
    if (L) {
      const n = passedCount(key, unit);
      progress[key] = { score: n, total: L.length, passed: n === L.length, levels: true, at: Date.now() };
      saveProgress(progress);
    }
    refreshProgress();
    renderUnits();
  }

  function renderResult() {
    const wrap = $('#quizWrap');
    const got = run.got.reduce((a, b) => a + (b || 0), 0);
    const max = run.max.reduce((a, b) => a + b, 0) || 1;
    const pct = Math.round(got / max * 100);
    const leveled = run.li >= 0;
    const L = leveled ? levelsOf(current.unit) : null;
    const need = leveled ? levelPass(L[run.li]) : 60;
    const passed = pct >= need;

    if (leveled) {
      const prev = levelState(current.key, run.li) || {};
      (levelProg[current.key] = levelProg[current.key] || {})[run.li] = {
        best: Math.max(prev.best || 0, pct), passed: !!prev.passed || passed, at: Date.now()
      };
      writeStore(LSTORE, levelProg);
      syncUnitProgress();
    } else if (current) {
      const prev = progress[current.key];
      const score = Math.round(got);
      if (!prev || score > prev.score) {
        progress[current.key] = { score, total: run.qs.length, passed, at: Date.now() };
        saveProgress(progress);
        refreshProgress();
        renderUnits();
      }
    }

    const hasNext = leveled && run.li + 1 < L.length;
    const title = passed
      ? (leveled ? (hasNext ? 'أحسنت! فتحت المستوى التالي 🎉' : 'أحسنت! أنهيت كل المستويات 🏆') : 'أحسنت! نتيجة جيدة')
      : (leveled ? `تحتاج ${need}% على الأقل لفتح المستوى التالي` : 'تحتاج مراجعة الوحدة');

    const R = 62, CIRC = 2 * Math.PI * R;
    wrap.innerHTML =
      `<div class="result">
         <div class="result__ring">
           <svg viewBox="0 0 144 144">
             <defs><linearGradient id="gRes" x1="0" y1="1" x2="1" y2="0">
               <stop offset="0" stop-color="#9FB2E8"/><stop offset=".5" stop-color="#6FB6EE"/><stop offset="1" stop-color="#2DE1C2"/>
             </linearGradient></defs>
             <circle class="bg" cx="72" cy="72" r="${R}"/>
             <circle class="fg" cx="72" cy="72" r="${R}"
                     stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"/>
           </svg>
           <span class="result__pct">${pct}%</span>
         </div>
         <h4>${title}</h4>
         <p>مجموع نقاطك <b>${Math.round(got * 100) / 100}</b> من <b>${max}</b>${run.max.some(m => m > 1) ? ' (السؤال الكتابي على نقطتين)' : ''}.</p>
         <div class="result__actions">
           ${passed && hasNext ? '<button class="btn btn--primary" type="button" id="nextLevel">المستوى التالي ←</button>' : ''}
           <button class="btn ${passed && hasNext ? 'btn--ghost' : 'btn--primary'}" type="button" id="again">${leveled ? 'إعادة المستوى' : 'إعادة الاختبار'}</button>
           ${leveled ? '<button class="btn btn--ghost" type="button" id="allLevels">كل المستويات</button>' : ''}
           <button class="btn btn--ghost" type="button" id="backLesson">العودة للدرس</button>
         </div>
       </div>`;

    requestAnimationFrame(() => {
      const fg = $('.result__ring .fg', wrap);
      if (fg) fg.style.strokeDashoffset = String(CIRC * (1 - pct / 100));
    });

    const li = run.li, qs = run.qs;
    $('#again').addEventListener('click', () => startRun(qs, li));
    $('#backLesson').addEventListener('click', () => showPane('lesson'));
    if ($('#allLevels')) $('#allLevels').addEventListener('click', renderLevels);
    if ($('#nextLevel')) $('#nextLevel').addEventListener('click', () => startRun(L[li + 1].questions || [], li + 1));
  }

  /* ===================================================== تفاعلات عامة */
  function wireChrome() {
    const header = $('#siteHeader');
    const nav = $('#nav');
    const burger = $('#burger');

    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }));

    const sections = $$('main section[id]');
    const links = $$('#nav a');

    const onScroll = () => {
      header.classList.toggle('is-stuck', window.scrollY > 10);
      let cur = '';
      sections.forEach(s => { if (window.scrollY >= s.offsetTop - 140) cur = s.id; });
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const reset = $('#resetProgress');
    if (reset) reset.addEventListener('click', () => {
      if (!confirm('هل تريد فعلاً حذف تقدّمك في كل الوحدات؟')) return;
      progress = {};
      saveProgress(progress);
      refreshProgress();
      renderUnits();
    });
  }

  /* ===================================================== العدّ التنازلي للبكالوريا */
  const bacTarget = () => Date.parse((C.bac && C.bac.date) || '');

  function bacLeft() {
    const ms = Math.max(0, bacTarget() - Date.now());
    return {
      ms,
      d: Math.floor(ms / 864e5),
      h: Math.floor(ms / 36e5) % 24,
      m: Math.floor(ms / 6e4) % 60,
      s: Math.floor(ms / 1e3) % 60
    };
  }

  function wireCountdown() {
    const box = $('#bacCountdown');
    if (!box || isNaN(bacTarget())) { if (box) box.remove(); return; }

    $('#bacLabel').textContent = C.bac.label || '';
    $('#bacDate').textContent = C.bac.dateText || '';
    const cells = { d: $('[data-cd="d"]', box), h: $('[data-cd="h"]', box), m: $('[data-cd="m"]', box), s: $('[data-cd="s"]', box) };
    const badge = $('#bacDays');
    const pad = (n) => String(n).padStart(2, '0');

    const tick = () => {
      const t = bacLeft();
      if (t.ms === 0) {
        box.classList.add('is-done');
        $('.countdown__grid', box).innerHTML = '<p class="countdown__done">بالتوفيق لكل المترشحين 🤍</p>';
        if (badge) badge.textContent = '🎓';
        clearInterval(timer);
        return;
      }
      cells.d.textContent = t.d;
      cells.h.textContent = pad(t.h);
      cells.m.textContent = pad(t.m);
      cells.s.textContent = pad(t.s);
      if (badge) badge.textContent = t.d + ' يوم';
    };
    const timer = setInterval(tick, 1000);
    tick();
  }

  /* ===================================================== المساعد الآلي */
  const norm = (s) => String(s || '').toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[؟?!.,،:;()«»"'\-–—]/g, ' ').replace(/\s+/g, ' ').trim();

  /* الكلمات القصيرة (3 أحرف فأقل) يجب أن تكون كلمة كاملة */
  const hits = (q, keys) => {
    const tokens = q.split(' ');
    return keys.filter(k => (k.length <= 3 ? tokens.includes(k) : q.includes(k))).length;
  };

  const waUrl = (text) => `https://wa.me/${C.contact.whatsapp}?text=${encodeURIComponent(text)}`;
  const groupLine = (gr) => {
    const st = statusOf(gr);
    return `<li><b>${esc(gr.name)}</b> — <bdi dir="ltr">${esc(centerOf(gr.center).name)}</bdi> : ${esc(gr.day)}
              <bdi dir="ltr">${esc(timeOf(gr))}</bdi> <span class="chip chip--${st.cls}">${esc(st.label)}</span></li>`;
  };

  const BOT_INTENTS = [
    { keys: ['سلام', 'مرحبا', 'اهلا', 'salut', 'bonjour', 'salam'],
      reply: () => esc(C.bot.greeting) },
    { keys: ['هاتف', 'رقم', 'اتصال', 'اتصل', 'نتصل', 'واتساب', 'whatsapp', 'tel', 'انستغرام', 'instagram', 'contact', 'تواصل'],
      reply: () => `📞 الهاتف: <a href="tel:${esc(C.contact.phoneDial)}" dir="ltr">${esc(C.contact.phone)}</a><br>
                    💬 <a href="${esc(waUrl('السلام عليكم أستاذ، عندي استفسار.'))}" target="_blank" rel="noopener">راسل الأستاذ على واتساب</a><br>
                    📷 <a href="${esc(C.contact.instagram)}" target="_blank" rel="noopener">انستغرام @professeur_mehira</a>` },
    { keys: ['تسجيل', 'سجل', 'نسجل', 'اسجل', 'inscri', 'ثمن', 'سعر', 'اسعار', 'prix', 'شحال', 'دفع', 'الدفع'],
      reply: () => `للتسجيل: املأ <a href="#register">استمارة التسجيل</a> فتُرسل معلوماتك مباشرة عبر واتساب،
                    أو اتصل بالرقم <a href="tel:${esc(C.contact.phoneDial)}" dir="ltr">${esc(C.contact.phone)}</a>.<br>
                    للأسعار وتفاصيل الدفع تواصل مع الأستاذ مباشرة — <a href="${esc(waUrl('السلام عليكم أستاذ، أريد معرفة تفاصيل التسجيل والأسعار.'))}" target="_blank" rel="noopener">واتساب</a>.` },
    { keys: ['باك', 'بكالوريا', 'bac', 'امتحان', 'كم بقي', 'بقا', 'تنازلي', 'جوان'],
      reply: () => {
        const t = bacLeft();
        return t.ms === 0
          ? 'انتهى العدّ التنازلي — بالتوفيق لكل المترشحين 🤍'
          : `⏳ باقي <b>${t.d}</b> يوماً و <b>${t.h}</b> ساعة على <b>${esc(C.bac.label)}</b> (${esc(C.bac.dateText)}).<br>كل يوم مراجعة يصنع الفرق 💪`;
      } },
    { keys: ['فوج', 'افواج', 'توقيت', 'وقت', 'اوقات', 'موعد', 'مواعيد', 'حصه', 'حصص', 'جدول', 'برنامج', 'groupe', 'horaire', 'متاح'],
      reply: () => {
        const av = groups().filter(gr => gr.status !== 'full');
        const full = groups().length - av.length;
        return `الأفواج المتاحة حالياً:<ul>${av.map(groupLine).join('')}</ul>
                ${full ? `و ${full} أفواج مغلقة (ممتلئة). ` : ''}<a href="#schedule">عرض الجدول كاملاً</a>`;
      } },
    { keys: ['مركز', 'مراكز', 'مكان', 'اماكن', 'عنوان', 'وين', 'اين', 'centre', 'adresse', 'lieu', 'خريطه', 'map'],
      reply: () => `الحصص في وهران، في ${centers().length} مراكز:<ul>${centers().map(c => {
          const n = groups().filter(gr => gr.center === c.id).length;
          return `<li><b dir="ltr">${esc(c.name)}</b> (${esc(c.ar)}) — ${n} ${n === 1 ? 'فوج' : 'أفواج'} · <a href="${esc(mapLink(c))}" target="_blank" rel="noopener">الخريطة</a></li>`;
        }).join('')}</ul><a href="#centers">تفاصيل المراكز</a>` },
    { keys: ['استاذ', 'مهيره', 'من انت', 'prof', 'من هو'],
      reply: () => `الأستاذ <b>أحمد مهيرة</b> — أستاذ علوم الطبيعة والحياة لأقسام البكالوريا في وهران.
                    منهجيته: الفهم قبل الحفظ، ملخّصات واضحة، وتمارين على نمط البكالوريا. شعاره: «هدفكم هو هدفنا».<br>
                    <a href="#about">تعرّف على المنهجية</a>` },
    { keys: ['درس', 'دروس', 'وحده', 'وحدات', 'اختبار', 'quiz', 'cours', 'فيديو', 'كتاب', 'ملخص'],
      reply: () => `في <a href="#lessons">فضاء الدروس</a>: كل وحدة فيها أهم النقاط ثم اختبار قصير مع تصحيح فوري.
                    أسئلة الوحدات 1 → 3 (تركيب البروتين، بنية ووظيفة البروتين، الأنزيمات) مأخوذة من <b>كتاب الوحدات</b> للأستاذ مع وثائقه.<br>
                    ويمكنك سؤالي مباشرة عن درس، مثلاً: «ما هو الاستنساخ؟»` }
  ];

  function botAnswer(raw) {
    const q = norm(raw);
    if (!q) return '';

    /* يوم محدّد → أفواج ذلك اليوم */
    const tokens = q.split(' ');
    const day = [...new Set(groups().map(gr => gr.day))].find(d => {
      const nd = norm(d), bare = nd.replace(/^ال/, '');
      return tokens.some(t => [nd, bare, 'ب' + nd, 'يوم' + bare].includes(t));
    });
    if (day) {
      const list = groups().filter(gr => gr.day === day);
      return `أفواج يوم <b>${esc(day)}</b>:<ul>${list.map(groupLine).join('')}</ul>`;
    }

    /* مركز محدّد → أفواج ذلك المركز */
    const STOP = ['les', 'des', 'school', 'centre', 'ville', 'boulevard', 'assistance'];
    const found = centers().filter(c => {
      const keys = [norm(c.name), norm(c.ar), norm(c.ar).replace(/^ال/, '')]
        .concat(norm(c.name).split(' ').filter(w => w.length >= 4 && !STOP.includes(w)));
      return keys.some(k => k && q.includes(k));
    });
    if (found.length) {
      return found.map(c => {
        const list = groups().filter(gr => gr.center === c.id);
        return `<b dir="ltr">${esc(c.name)}</b> (${esc(c.ar)}):<ul>${list.map(groupLine).join('') || '<li>لا توجد أفواج حالياً</li>'}</ul>
                <a href="${esc(mapLink(c))}" target="_blank" rel="noopener">فتح في الخريطة</a>`;
      }).join('<br>');
    }

    /* أفضل تطابق: أسئلة الدروس (وزن 2) ثم المعلومات العامة */
    let best = null, bestScore = 0;
    ((C.bot && C.bot.kb) || []).forEach(k => {
      const sc = hits(q, k.keys.map(norm)) * 2;
      if (sc > bestScore) { best = { kb: k }; bestScore = sc; }
    });
    BOT_INTENTS.forEach(it => {
      const sc = hits(q, it.keys.map(norm));
      if (sc > bestScore) { best = { intent: it }; bestScore = sc; }
    });

    if (best && best.kb) {
      return `${esc(best.kb.a)}${best.kb.ref ? `<small class="bot__ref">📘 كتاب الأستاذ — ${esc(best.kb.ref)}</small>` : ''}`;
    }
    if (best && best.intent) return best.intent.reply();

    return `لم أفهم سؤالك جيداً 🤔 جرّب أحد الاقتراحات بالأسفل،
            أو <a href="${esc(waUrl('السلام عليكم أستاذ، عندي سؤال: ' + raw))}" target="_blank" rel="noopener">أرسل سؤالك للأستاذ على واتساب</a>.`;
  }

  function wireBot() {
    const fab = $('#botFab'), panel = $('#botPanel');
    if (!fab || !panel || !C.bot) return;
    const log = $('#botLog'), form = $('#botForm'), input = $('#botInput'), chips = $('#botChips');
    $('#botName').textContent = C.bot.name || 'المساعد';

    const say = (html, who) => {
      const m = el('div', 'bot__msg bot__msg--' + who, html);
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
    };
    const ask = (text) => {
      text = String(text || '').trim();
      if (!text) return;
      say(esc(text), 'me');
      const typing = el('div', 'bot__msg bot__msg--bot bot__typing', '<i></i><i></i><i></i>');
      log.appendChild(typing);
      log.scrollTop = log.scrollHeight;
      setTimeout(() => { typing.remove(); say(botAnswer(text), 'bot'); }, 420);
    };

    (C.bot.suggestions || []).forEach(s => {
      const b = el('button', 'bot__chip', esc(s));
      b.type = 'button';
      b.addEventListener('click', () => ask(s));
      chips.appendChild(b);
    });

    let greeted = false;
    const toggle = (open) => {
      panel.hidden = !open;
      fab.setAttribute('aria-expanded', String(open));
      fab.classList.toggle('is-open', open);
      if (open) {
        if (!greeted) { say(esc(C.bot.greeting), 'bot'); greeted = true; }
        input.focus();
      }
    };
    fab.addEventListener('click', () => toggle(panel.hidden));
    $('#botClose').addEventListener('click', () => { toggle(false); fab.focus(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden && modal.hidden) toggle(false);
    });
    /* الروابط الداخلية تغلق النافذة على الهاتف حتى يظهر القسم */
    log.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a && window.innerWidth < 640) toggle(false);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      ask(input.value);
      input.value = '';
    });
  }

  /* ظهور تدريجي عند التمرير */
  function wireReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(i => i.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px' });
    items.forEach(i => io.observe(i));
  }

  /* ===================================================== التشغيل */
  wireContacts();
  renderStats();
  renderAbout();
  renderTabs();
  renderUnits();
  renderResources();
  renderSchedule();
  renderCenters();
  renderRegistration();
  renderQuotes();
  renderFaq();
  refreshProgress();
  wireChrome();
  wireCountdown();
  wireBot();
  wireReveal();
})();
