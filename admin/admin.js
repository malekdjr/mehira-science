/* ============================================================================
   MEHIRA SCIENCE — لوحة التحكم
   تقرأ ملف المحتوى من مستودع GitHub، تعدّله، ثم تحفظه بـ commit
   فيُعاد نشر الموقع تلقائياً على GitHub Pages. لا يوجد خادم.
   ========================================================================== */
(function () {
  'use strict';

  const CFG = Object.assign({
    owner: '', repo: '', branch: 'main',
    contentPath: 'assets/js/content.js',
    uploadDir: 'assets/img/uploads'
  }, window.ADMIN_CONFIG || {});

  const KEY = { token: 'mehira.admin.token', repo: 'mehira.admin.repo' };
  const DRAFT = 'mehira.draft';

  /* ===================================================== أدوات DOM */
  const $ = (s, r = document) => r.querySelector(s);

  function h(tag, props, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    kids.flat(Infinity).forEach(c => {
      if (c == null || c === false) return;
      n.append(c instanceof Node ? c : document.createTextNode(String(c)));
    });
    return n;
  }

  const ICONS = {
    home:   '<path d="M12 3 2 11h3v9h6v-6h2v6h6v-9h3z"/>',
    video:  '<path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11z"/>',
    book:   '<path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2H4zm16 0h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2H20z"/>',
    clock:  '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7z"/>',
    pin:    '<path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>',
    gear:   '<path d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3.3h-4L10.7 6a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.4L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1a7.6 7.6 0 0 0 1.7 1l.3 2.7h4l.3-2.7a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/>',
    chat:   '<path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2zm3 6v2h2V9zm4 0v2h2V9zm4 0v2h2V9z"/>',
    info:   '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z"/>',
    plus:   '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/>',
    up:     '<path d="m12 8-6 6 1.4 1.4L12 10.8l4.6 4.6L18 14z"/>',
    down:   '<path d="m12 16 6-6-1.4-1.4-4.6 4.6-4.6-4.6L6 10z"/>',
    copy:   '<path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11z"/>',
    trash:  '<path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/>',
    save:   '<path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-10H5V5h10z"/>',
    eye:    '<path d="M12 5C6.5 5 2 12 2 12s4.5 7 10 7 10-7 10-7-4.5-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>',
    undo:   '<path d="M12.5 8c-2.6 0-5 1-6.9 2.6L2 7v9h9l-3.6-3.6A8 8 0 0 1 20.1 16l2.4-.8A10.5 10.5 0 0 0 12.5 8z"/>',
    out:    '<path d="M10 17v-3H3v-4h7V7l5 5zm9-14H12v2h7v14h-7v2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>',
    ext:    '<path d="M14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3zm5 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"/>',
    image:  '<path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5z"/>',
    upload: '<path d="M5 20h14v-2H5zm0-10h4v6h6v-6h4l-7-7z"/>',
    check:  '<path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>',
    menu:   '<path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>',
    download: '<path d="M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z"/>'
  };
  function icon(name) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    s.classList.add('i');
    s.innerHTML = ICONS[name] || ICONS.info;
    return s;
  }

  function toast(msg, type = 'ok', ms = 3800) {
    const t = h('div', { class: 'toast toast--' + type, role: 'status' }, icon(type === 'err' ? 'info' : 'check'), h('span', null, msg));
    $('#toasts').append(t);
    setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), 300); }, ms);
  }

  const clone = (x) => JSON.parse(JSON.stringify(x));

  /* ===================================================== ترميز Base64 (UTF-8) */
  function bytesToB64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  const b64enc = (str) => bytesToB64(new TextEncoder().encode(str));
  function b64dec(b64) {
    const bin = atob(String(b64).replace(/\s/g, ''));
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(u);
  }

  /* ===================================================== GitHub API */
  const encPath = (p) => p.split('/').map(encodeURIComponent).join('/');
  const GH = {
    token: '', owner: '', repo: '', branch: CFG.branch,
    async api(method, path, body, accept) {
      const res = await fetch('https://api.github.com' + path, {
        method, cache: 'no-store',
        headers: Object.assign({
          Authorization: 'Bearer ' + this.token,
          Accept: accept || 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }, body ? { 'Content-Type': 'application/json' } : {}),
        body: body ? JSON.stringify(body) : undefined
      });
      if (accept && accept.includes('raw') && res.ok) return res.text();
      let data = null;
      try { data = await res.json(); } catch (e) { /* لا محتوى */ }
      if (!res.ok) {
        const err = new Error((data && data.message) || ('HTTP ' + res.status));
        err.status = res.status;
        throw err;
      }
      return data;
    },
    base() { return `/repos/${this.owner}/${this.repo}`; },
    async get(path) {
      const url = `${this.base()}/contents/${encPath(path)}?ref=${encodeURIComponent(this.branch)}`;
      const j = await this.api('GET', url);
      const text = j.content && j.encoding === 'base64'
        ? b64dec(j.content)
        : await this.api('GET', url, null, 'application/vnd.github.raw');
      return { sha: j.sha, text };
    },
    put(path, b64, message, sha) {
      return this.api('PUT', `${this.base()}/contents/${encPath(path)}`,
        Object.assign({ message, content: b64, branch: this.branch }, sha ? { sha } : {}));
    },
    async del(path, message) {
      const url = `${this.base()}/contents/${encPath(path)}`;
      const j = await this.api('GET', `${url}?ref=${encodeURIComponent(this.branch)}`);
      return this.api('DELETE', url, { message, sha: j.sha, branch: this.branch });
    },
    commits(path) {
      return this.api('GET', `${this.base()}/commits?sha=${encodeURIComponent(this.branch)}&path=${encodeURIComponent(path)}&per_page=6`);
    }
  };

  /* ===================================================== ملف المحتوى */
  const HEADER =
    '/* ============================================================================\n' +
    '   MEHIRA SCIENCE — ملف المحتوى\n' +
    '   يُعدَّل هذا الملف تلقائياً من لوحة التحكم:  /admin/\n' +
    '   (يمكن تعديله يدوياً أيضاً، لكن يجب أن يبقى بصيغة JSON صحيحة)\n' +
    '   ========================================================================== */\n';

  function parseContent(text) {
    try {
      const i = text.indexOf('window.CONTENT =');
      if (i < 0) throw new Error('no marker');
      return JSON.parse(text.slice(text.indexOf('{', i), text.lastIndexOf('}') + 1));
    } catch (e) {
      /* الصيغة القديمة (كائن JavaScript) */
      const w = {};
      new Function('window', text + '\n;if(!window.CONTENT&&typeof CONTENT!=="undefined")window.CONTENT=CONTENT;')(w);
      if (!w.CONTENT) throw new Error('تعذّرت قراءة ملف المحتوى');
      return w.CONTENT;
    }
  }
  const serialize = (data) => HEADER + 'window.CONTENT = ' + JSON.stringify(data, null, 2) + ';\n';

  /* يضمن وجود كل الأقسام حتى لا تتعطل المحرّرات */
  function normalize(d) {
    const arr = (o, k) => { if (!Array.isArray(o[k])) o[k] = []; return o[k]; };
    const obj = (o, k) => { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; return o[k]; };
    obj(d, 'contact'); obj(d, 'bac'); obj(d, 'schedule'); obj(d, 'bot');
    ['stats', 'features', 'method', 'fields', 'centers', 'registration', 'quotes', 'faq', 'resources'].forEach(k => arr(d, k));
    arr(d.schedule, 'groups'); arr(d.bot, 'kb'); arr(d.bot, 'suggestions');
    const fixQ = (q) => {
      if (!q.type) q.type = 'mcq';
      if (q.type === 'mcq') {
        arr(q, 'options');
        if (typeof q.answer !== 'number') q.answer = Number(q.answer) || 0;
      } else if (q.type === 'tf') {
        q.answer = q.answer === true || q.answer === 'true';
      } else if (q.type === 'write') {
        arr(q, 'criteria').forEach(c => { arr(c, 'k'); if (typeof c.p !== 'number') c.p = Number(c.p) || 1; });
        arr(q, 'mistakes').forEach(m => arr(m, 'k'));
      }
    };
    d.fields.forEach(f => {
      arr(f, 'units').forEach(u => {
        arr(u, 'points');
        if (Array.isArray(u.levels) && u.levels.length) {
          delete u.quiz;
          u.levels.forEach(L => arr(L, 'questions').forEach(fixQ));
        } else {
          delete u.levels;
          arr(u, 'quiz').forEach(fixQ);
        }
      });
    });
    d.registration.forEach(r => arr(r, 'items'));
    d.bot.kb.forEach(k => arr(k, 'keys'));
    return d;
  }

  /* ===================================================== الحالة */
  const S = {
    mode: null,           // 'github' | 'demo'
    data: null,
    original: '',
    sha: null,
    view: 'home',
    field: 0,
    uploads: {},          // صور رُفعت للتو (لم تُنشر بعد) → dataURL للمعاينة
    saving: false
  };
  const OPEN = new WeakSet();   // العناصر المفتوحة في القوائم

  const C = () => S.data;
  const isDirty = () => !!S.data && JSON.stringify(S.data) !== S.original;

  function markDirty() { paintSaveState(); }

  function imgSrc(path) {
    if (!path) return '';
    if (S.uploads[path]) return S.uploads[path];
    return /^(https?:|data:)/.test(path) ? path : '../' + path;
  }

  const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const STATUS = [['open', 'متاح'], ['full', 'مغلق'], ['new', 'جديد'], ['soon', 'يُعلن لاحقاً']];
  const SECTION_NAMES = {
    fields: 'الدروس', schedule: 'الأفواج', centers: 'المراكز', contact: 'التواصل', bac: 'الباك',
    stats: 'الأرقام', features: 'المزايا', method: 'المنهجية', registration: 'التسجيلات',
    quotes: 'الشهادات', faq: 'الأسئلة الشائعة', bot: 'المساعد', resources: 'الملخصات'
  };

  /* ===================================================== يوتيوب */
  function ytId(s) {
    s = String(s || '').trim();
    if (/^[\w-]{11}$/.test(s)) return s;
    try {
      const u = new URL(s);
      const host = u.hostname.replace(/^(www|m|music)\./, '');
      if (host === 'youtu.be') {
        const id = u.pathname.split('/')[1];
        return /^[\w-]{11}$/.test(id) ? id : null;
      }
      if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
        const v = u.searchParams.get('v');
        if (v && /^[\w-]{11}$/.test(v)) return v;
        const m = u.pathname.match(/\/(embed|shorts|live|v)\/([\w-]{11})/);
        if (m) return m[2];
      }
    } catch (e) { /* ليس رابطاً */ }
    return null;
  }

  /* ===================================================== رفع الصور */
  async function fileToJpeg(file, max = 1400) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => rej(new Error('الملف ليس صورة صالحة'));
        i.src = url;
      });
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.85);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function uploadImage(file) {
    if (S.mode !== 'github') { toast('رفع الصور يتطلب تسجيل الدخول بحساب GitHub', 'err'); return null; }
    if (!file || !/^image\//.test(file.type)) { toast('اختر ملف صورة (JPG أو PNG)', 'err'); return null; }
    const base = (file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'img').slice(0, 40);
    const path = `${CFG.uploadDir}/${Date.now()}-${base}.jpg`;
    busy(true, 'جارٍ رفع الصورة…');
    try {
      const dataUrl = await fileToJpeg(file);
      await GH.put(path, dataUrl.split(',')[1], 'رفع صورة من لوحة التحكم: ' + base);
      S.uploads[path] = dataUrl;
      toast('تم رفع الصورة');
      return path;
    } catch (e) {
      toast('فشل رفع الصورة: ' + e.message, 'err', 6000);
      return null;
    } finally {
      busy(false);
    }
  }

  /* ===================================================== عناصر النماذج */
  function changed(o) {
    markDirty();
    if (o && o.after) o.after();
    if (o && o.rerender) rerender();
  }

  function bind(obj, key, o = {}) {
    const type = o.type || 'text';
    let el;
    if (type === 'checkbox') {
      el = h('input', { type: 'checkbox' });
      el.checked = !!obj[key];
      el.addEventListener('change', () => { obj[key] = el.checked; changed(o); });
      return el;
    }
    if (type === 'textarea') el = h('textarea', { rows: o.rows || 3 });
    else if (type === 'select') {
      el = h('select');
      (o.options || []).forEach(([v, l]) => el.append(h('option', { value: v }, l)));
    } else el = h('input', { type });
    if (o.placeholder) el.placeholder = o.placeholder;
    if (o.dir) el.dir = o.dir;
    const val = obj[key];
    el.value = val == null ? '' : (o.toInput ? o.toInput(val) : val);
    el.addEventListener(type === 'select' ? 'change' : 'input', () => {
      let v = el.value;
      if (o.fromInput) v = o.fromInput(v);
      if (o.number) v = Number(v);
      obj[key] = v;
      changed(o);
    });
    return el;
  }

  const fld = (label, control, hint, cls) =>
    h('label', { class: 'fld' + (cls ? ' ' + cls : '') },
      h('span', { class: 'fld__l' }, label), control, hint ? h('small', { class: 'fld__h' }, hint) : null);

  const grid = (cols, ...kids) => h('div', { class: 'grid grid--' + cols }, ...kids);

  function iconBtn(name, title, onClick, opts = {}) {
    return h('button', {
      type: 'button', class: 'ibtn' + (opts.danger ? ' ibtn--danger' : ''), title, 'aria-label': title,
      disabled: opts.disabled || null, onclick: onClick
    }, icon(name));
  }

  function move(arr, i, j) {
    if (j < 0 || j >= arr.length) return;
    const [x] = arr.splice(i, 1);
    arr.splice(j, 0, x);
    markDirty();
    rerender();
  }

  /* قائمة عناصر قابلة للطي (أسئلة، وحدات، شهادات...) */
  function listEditor(arr, o) {
    const wrap = h('div', { class: 'list' });
    if (!arr.length && o.empty) wrap.append(h('p', { class: 'muted' }, o.empty));
    arr.forEach((item, i) => {
      const title = h('span', { class: 'item__title' }, o.itemTitle(item, i) || 'بدون عنوان');
      const card = h('div', { class: 'item' + (OPEN.has(item) ? ' is-open' : '') });
      const head = h('div', { class: 'item__head' },
        h('button', {
          type: 'button', class: 'item__toggle', 'aria-expanded': String(OPEN.has(item)),
          onclick: () => {
            const open = card.classList.toggle('is-open');
            if (open) OPEN.add(item); else OPEN.delete(item);
            head.firstChild.setAttribute('aria-expanded', String(open));
            if (open && !body.firstChild) body.append(o.body(item, i));
          }
        }, h('span', { class: 'item__num' }, i + 1), title, o.badge ? o.badge(item) : null),
        h('div', { class: 'item__tools' },
          iconBtn('up', 'تحريك للأعلى', () => move(arr, i, i - 1), { disabled: i === 0 }),
          iconBtn('down', 'تحريك للأسفل', () => move(arr, i, i + 1), { disabled: i === arr.length - 1 }),
          o.noCopy ? null : iconBtn('copy', 'نسخ', () => {
            const c = clone(item);
            arr.splice(i + 1, 0, c);
            OPEN.add(c);
            markDirty(); rerender();
          }),
          iconBtn('trash', 'حذف', () => {
            if (o.canRemove && !o.canRemove(item)) return;
            if (!confirm('حذف «' + (o.itemTitle(item, i) || 'هذا العنصر') + '»؟')) return;
            arr.splice(i, 1);
            markDirty(); rerender();
          }, { danger: true })));
      const body = h('div', { class: 'item__body' });
      if (OPEN.has(item)) body.append(o.body(item, i));
      card.append(head, body);
      card.addEventListener('input', () => { title.textContent = o.itemTitle(item, i) || 'بدون عنوان'; });
      card.addEventListener('change', () => { title.textContent = o.itemTitle(item, i) || 'بدون عنوان'; });
      wrap.append(card);
    });
    /* زر إضافة واحد، أو عدة أزرار حسب النوع (o.creates) */
    const adders = o.creates || [{ label: o.addLabel || 'إضافة', create: o.create }];
    wrap.append(h('div', { class: 'adders' }, adders.map(a => h('button', {
      type: 'button', class: 'btn btn--add',
      onclick: () => { const n = a.create(); arr.push(n); OPEN.add(n); markDirty(); rerender(); }
    }, icon('plus'), a.label))));
    return wrap;
  }

  /* قائمة نصوص بسيطة (نقاط الدرس، اقتراحات...) */
  function strList(arr, o = {}) {
    const wrap = h('div', { class: 'strs' });
    arr.forEach((s, i) => {
      const input = o.multiline ? h('textarea', { rows: 2 }) : h('input', { type: 'text' });
      input.value = s;
      if (o.placeholder) input.placeholder = o.placeholder;
      input.addEventListener('input', () => { arr[i] = input.value; markDirty(); });
      wrap.append(h('div', { class: 'strs__row' },
        h('span', { class: 'strs__n' }, i + 1), input,
        iconBtn('up', 'للأعلى', () => move(arr, i, i - 1), { disabled: i === 0 }),
        iconBtn('trash', 'حذف', () => { arr.splice(i, 1); markDirty(); rerender(); }, { danger: true })));
    });
    wrap.append(h('button', {
      type: 'button', class: 'btn btn--add btn--sm',
      onclick: () => { arr.push(''); markDirty(); rerender(); }
    }, icon('plus'), o.addLabel || 'إضافة سطر'));
    return wrap;
  }

  /* جدول صفوف مسطّحة (الأفواج، المراكز، الأرقام) */
  function rowsEditor(arr, cols, o) {
    const table = h('div', { class: 'rows', style: `--cols:${cols.map(c => c.w || '1fr').join(' ')} auto` });
    table.append(h('div', { class: 'rows__head' }, cols.map(c => h('span', null, c.label)), h('span')));
    arr.forEach((row, i) => {
      table.append(h('div', { class: 'rows__row' + (o.rowClass ? ' ' + o.rowClass(row) : '') },
        cols.map(c => h('div', { class: 'rows__cell', 'data-label': c.label }, bind(row, c.key, Object.assign({}, c, {
          after: o.after, rerender: c.rerender
        })))),
        h('div', { class: 'rows__tools' },
          iconBtn('up', 'للأعلى', () => move(arr, i, i - 1), { disabled: i === 0 }),
          iconBtn('down', 'للأسفل', () => move(arr, i, i + 1), { disabled: i === arr.length - 1 }),
          iconBtn('copy', 'نسخ', () => { arr.splice(i + 1, 0, clone(row)); markDirty(); rerender(); }),
          iconBtn('trash', 'حذف', () => {
            if (o.canRemove && !o.canRemove(row)) return;
            if (!confirm('حذف هذا الصف؟')) return;
            arr.splice(i, 1); markDirty(); rerender();
          }, { danger: true }))));
    });
    return h('div', null, table, h('button', {
      type: 'button', class: 'btn btn--add',
      onclick: () => { arr.push(o.create()); markDirty(); rerender(); }
    }, icon('plus'), o.addLabel || 'إضافة صف'));
  }

  /* اختيار صورة: رفع / إزالة / مسار يدوي */
  function imagePicker(get, set, o = {}) {
    const file = h('input', { type: 'file', accept: 'image/*', hidden: true });
    file.addEventListener('change', async () => {
      const p = await uploadImage(file.files[0]);
      file.value = '';
      if (p) { set(p); markDirty(); rerender(); }
    });
    const cur = get();
    const path = h('input', { type: 'text', dir: 'ltr', placeholder: 'assets/img/... أو رابط صورة' });
    path.value = cur || '';
    path.addEventListener('change', () => { set(path.value.trim()); markDirty(); rerender(); });
    return h('div', { class: 'pick' },
      h('div', { class: 'pick__thumb' + (cur ? '' : ' is-empty') },
        cur ? h('a', { href: imgSrc(cur), target: '_blank', rel: 'noopener' }, h('img', { src: imgSrc(cur), alt: '' })) : icon('image')),
      h('div', { class: 'pick__side' },
        h('div', { class: 'pick__btns' },
          h('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: () => file.click() }, icon('upload'), cur ? 'تغيير الصورة' : (o.label || 'رفع صورة')),
          cur ? h('button', { type: 'button', class: 'btn btn--ghost btn--sm btn--danger', onclick: () => { set(''); markDirty(); rerender(); } }, icon('trash'), 'إزالة') : null),
        h('details', { class: 'pick__adv' }, h('summary', null, 'مسار الصورة'), path),
        file));
  }

  /* حقل رابط يوتيوب مع معاينة */
  function youtubeInput(unit, o = {}) {
    const thumb = h('div', { class: 'yt__thumb' });
    const state = h('span', { class: 'chip' });
    const open = h('a', { class: 'btn btn--ghost btn--sm', target: '_blank', rel: 'noopener' }, icon('ext'), 'مشاهدة');
    const input = h('input', { type: 'url', dir: 'ltr', placeholder: 'الصق رابط يوتيوب هنا: https://youtu.be/...' });
    input.value = unit.video ? 'https://youtu.be/' + unit.video : '';
    const paint = () => {
      thumb.replaceChildren(unit.video
        ? h('img', { src: `https://i.ytimg.com/vi/${unit.video}/mqdefault.jpg`, alt: '' })
        : icon('video'));
      state.className = 'chip ' + (unit.video ? 'chip--ok' : 'chip--muted');
      state.textContent = unit.video ? 'فيديو مضاف' : 'لا يوجد فيديو';
      open.hidden = !unit.video;
      if (unit.video) open.href = 'https://www.youtube.com/watch?v=' + unit.video;
    };
    input.addEventListener('input', () => {
      const v = input.value.trim();
      if (!v) { unit.video = ''; input.classList.remove('is-bad'); }
      else {
        const id = ytId(v);
        input.classList.toggle('is-bad', !id);
        if (!id) return;
        unit.video = id;
      }
      markDirty(); paint();
      if (o.after) o.after();
    });
    const clear = iconBtn('trash', 'حذف الفيديو', () => { input.value = ''; input.dispatchEvent(new Event('input')); }, { danger: true });
    paint();
    return h('div', { class: 'yt' }, thumb,
      h('div', { class: 'yt__main' },
        h('div', { class: 'yt__row' }, input, clear),
        h('div', { class: 'yt__row yt__meta' }, state, open,
          h('small', { class: 'yt__err' }, 'رابط غير صالح — انسخ الرابط من زر «مشاركة» في يوتيوب'))));
  }

  /* ===================================================== الصفحات */
  const page = (title, lead, ...kids) =>
    h('div', { class: 'page' }, h('header', { class: 'page__head' }, h('h1', null, title), lead ? h('p', null, lead) : null), ...kids);
  const card = (title, ...kids) =>
    h('section', { class: 'card' }, title ? h('h2', { class: 'card__t' }, title) : null, ...kids);
  const tip = (...kids) => h('div', { class: 'tip' }, icon('info'), h('div', null, ...kids));

  const allUnits = () => C().fields.flatMap((f, fi) => f.units.map((u, ui) => ({ f, fi, u, ui })));
  const unitQuestions = (u) => (u.levels ? u.levels.flatMap(L => L.questions) : u.quiz || []);
  const qCount = (u) => unitQuestions(u).length;

  function daysToBac() {
    const t = Date.parse(C().bac.date || '');
    return isNaN(t) ? null : Math.max(0, Math.ceil((t - Date.now()) / 864e5));
  }

  /* ---------------------------------------------- الرئيسية */
  function viewHome() {
    const units = allUnits();
    const withVideo = units.filter(x => x.u.video).length;
    const questions = units.reduce((n, x) => n + qCount(x.u), 0);
    const groups = C().schedule.groups;
    const openGroups = groups.filter(g => g.status !== 'full').length;
    const days = daysToBac();

    const stat = (value, label, ic, go) => h('button', { type: 'button', class: 'stat', onclick: () => go && nav(go) },
      h('span', { class: 'stat__i' }, icon(ic)), h('b', null, value), h('span', null, label));

    const recent = h('div', { class: 'recent' }, h('p', { class: 'muted' }, S.mode === 'github' ? 'جارٍ التحميل…' : 'غير متاح في وضع التجربة.'));
    if (S.mode === 'github') {
      GH.commits(CFG.contentPath).then(list => {
        recent.replaceChildren(...(list.length ? list.map(c => h('div', { class: 'recent__row' },
          h('span', { class: 'recent__dot' }),
          h('div', null, h('b', null, c.commit.message.split('\n')[0]),
            h('small', null, new Date(c.commit.author.date).toLocaleString('ar-DZ', { dateStyle: 'medium', timeStyle: 'short' }))))) :
          [h('p', { class: 'muted' }, 'لا توجد تعديلات بعد.')]));
      }).catch(() => recent.replaceChildren(h('p', { class: 'muted' }, 'تعذّر تحميل السجل.')));
    }

    const missing = units.filter(x => !x.u.video).slice(0, 6);

    return page('مرحباً أستاذ 👋', 'من هنا تتحكم في كل محتوى الموقع: الفيديوهات، الدروس والاختبارات، الأفواج والمراكز.',
      h('div', { class: 'stats' },
        stat(`${withVideo}/${units.length}`, 'وحدات فيها فيديو', 'video', 'videos'),
        stat(questions, 'سؤالاً في الاختبارات', 'book', 'lessons'),
        stat(`${openGroups}/${groups.length}`, 'أفواج متاحة', 'clock', 'schedule'),
        stat(C().centers.length, 'مراكز', 'pin', 'centers'),
        stat(days == null ? '—' : days, 'يوماً على الباك', 'info', 'general')),
      grid(2,
        card('إجراءات سريعة',
          h('div', { class: 'quick' },
            h('button', { type: 'button', class: 'quick__b', onclick: () => nav('videos') }, icon('video'), h('b', null, 'إضافة فيديو لوحدة'), h('small', null, 'الصق رابط يوتيوب فقط')),
            h('button', { type: 'button', class: 'quick__b', onclick: () => nav('lessons') }, icon('book'), h('b', null, 'تعديل درس أو اختبار'), h('small', null, 'النقاط، الأسئلة والصور')),
            h('button', { type: 'button', class: 'quick__b', onclick: () => nav('schedule') }, icon('clock'), h('b', null, 'تحديث الأفواج'), h('small', null, 'التوقيت، الحالة: متاح أو مغلق')),
            h('button', { type: 'button', class: 'quick__b', onclick: () => window.open('../', '_blank') }, icon('ext'), h('b', null, 'فتح الموقع'), h('small', null, 'النسخة المنشورة')))),
        card('آخر التعديلات المنشورة', recent)),
      missing.length ? card('وحدات بدون فيديو',
        h('div', { class: 'miss' }, missing.map(x => h('button', { type: 'button', class: 'miss__b', onclick: () => nav('videos') },
          icon('video'), h('span', null, `${x.f.title} · ${x.u.code} — ${x.u.title}`))))) : null,
      tip(h('b', null, 'كيف يعمل الحفظ؟ '),
        'كل تعديل يبقى مسودة حتى تضغط «حفظ ونشر». بعد الحفظ يُحدَّث الموقع تلقائياً خلال دقيقة إلى دقيقتين (وقد يحتاج الزائر لتحديث الصفحة). استعمل «معاينة» لرؤية التغييرات قبل نشرها.'));
  }

  /* ---------------------------------------------- الفيديوهات */
  function viewVideos() {
    const units = allUnits();
    const n = units.filter(x => x.u.video).length;
    const counter = h('b', null, `${n}/${units.length}`);
    const recount = () => { counter.textContent = `${units.filter(x => x.u.video).length}/${units.length}`; };
    return page('الفيديوهات', null,
      tip(h('b', null, 'طريقة إضافة فيديو: '),
        'ارفع الفيديو على يوتيوب (يُنصح باختيار «غير مُدرج / Unlisted» حتى لا يظهر للعموم)، ثم اضغط «مشاركة» وانسخ الرابط والصقه أمام الوحدة. ',
        'وحدات فيها فيديو: ', counter),
      C().fields.map(f => card(`${f.title} — ${f.subtitle}`,
        f.units.length ? h('div', { class: 'vids' }, f.units.map(u => h('div', { class: 'vid' },
          h('div', { class: 'vid__t' }, h('span', { class: 'tag' }, u.code), h('b', null, u.title)),
          youtubeInput(u, { after: recount })))) : h('p', { class: 'muted' }, 'لا توجد وحدات في هذا المجال.'))));
  }

  /* ---------------------------------------------- الدروس والاختبارات */
  function questionEditor(q) {
    while (q.options.length < 2) q.options.push('');
    const name = 'ans-' + Math.random().toString(36).slice(2);
    const opts = h('div', { class: 'opts' });
    q.options.forEach((t, i) => {
      const radio = h('input', { type: 'radio', name, title: 'الإجابة الصحيحة' });
      radio.checked = q.answer === i;
      radio.addEventListener('change', () => { q.answer = i; markDirty(); rerender(); });
      const input = h('input', { type: 'text', placeholder: 'الخيار ' + (i + 1) });
      input.value = t;
      input.addEventListener('input', () => { q.options[i] = input.value; markDirty(); });
      opts.append(h('div', { class: 'opt' + (q.answer === i ? ' is-right' : '') },
        h('label', { class: 'opt__r' }, radio, h('span', null, q.answer === i ? 'صحيح' : 'خطأ')),
        input,
        iconBtn('trash', 'حذف الخيار', () => {
          if (q.options.length <= 2) { toast('يجب أن يبقى خياران على الأقل', 'err'); return; }
          q.options.splice(i, 1);
          if (q.answer >= q.options.length) q.answer = 0;
          else if (q.answer > i) q.answer--;
          markDirty(); rerender();
        }, { danger: true })));
    });
    if (q.options.length < 5) {
      opts.append(h('button', { type: 'button', class: 'btn btn--add btn--sm', onclick: () => { q.options.push(''); markDirty(); rerender(); } }, icon('plus'), 'إضافة خيار'));
    }
    return h('div', { class: 'qed' },
      fld('نص السؤال', bind(q, 'q', { type: 'textarea', rows: 2 })),
      fld('الخيارات — اختر الإجابة الصحيحة بالدائرة', opts),
      grid(2,
        fld('التعليل (يظهر بعد الإجابة)', bind(q, 'explain', { type: 'textarea', rows: 3 })),
        fld('صورة / وثيقة مع السؤال (اختياري)', imagePicker(() => q.img, v => { if (v) q.img = v; else delete q.img; }))),
      grid(2,
        fld('المرجع (مثلاً: ص 12)', bind(q, 'ref', { placeholder: 'ص ...' }), 'يظهر كـ «من كتاب الأستاذ · ص ...». اتركه فارغاً لإخفائه.'),
        fld('وصف الصورة (اختياري)', bind(q, 'cap', { placeholder: 'الوثيقة — من كتاب الأستاذ' }))));
  }

  function unitEditor(u) {
    return h('div', { class: 'ued' },
      grid(3,
        fld('رمز الوحدة', bind(u, 'code', { placeholder: 'و 1' }), 'يجب أن يكون مختلفاً داخل نفس المجال'),
        fld('عنوان الوحدة', bind(u, 'title')),
        fld('المدة', bind(u, 'duration', { placeholder: '45 د' }))),
      fld('وصف قصير (يظهر في البطاقة)', bind(u, 'desc', { type: 'textarea', rows: 2 })),
      fld('فيديو الشرح', youtubeInput(u)),
      grid(2,
        fld('المصدر (اختياري)', bind(u, 'source', { placeholder: 'كتاب الوحدات — ملخص الوحدة 1' })),
        fld('مخطط / صورة الدرس (اختياري)', imagePicker(() => u.figure && u.figure.img, v => {
          if (v) u.figure = Object.assign(u.figure || {}, { img: v }); else delete u.figure;
        }))),
      u.figure ? fld('وصف المخطط', bind(u.figure, 'cap')) : null,
      h('h3', { class: 'sub' }, 'أهم النقاط'),
      strList(u.points, { multiline: true, placeholder: 'نقطة من الدرس…', addLabel: 'إضافة نقطة' }),
      quizEditor(u));
  }

  /* ---------------------------------------------- الاختبار: بسيط أو بمستويات */
  const QTYPE = { mcq: 'اختيار', tf: 'صح/خطأ', write: 'كتابي' };
  const KINDS = [['analysis', 'تحليل وثيقة'], ['interpret', 'تفسير'], ['text', 'نص علمي'], ['apply', 'تطبيق / حساب'], ['hypothesis', 'فرضية']];
  const NEWQ = {
    mcq: () => ({ type: 'mcq', q: '', options: ['', '', '', ''], answer: 0, explain: '' }),
    tf: () => ({ type: 'tf', q: '', answer: true, explain: '' }),
    write: () => ({
      type: 'write', kind: 'analysis', q: '', min: 40, model: '',
      criteria: [
        { t: 'تقديم الوثيقة', p: 0.5, m: true, k: ['يمثل|تمثل|يوضح|توضح|يبين'] },
        { t: '', p: 1, k: [] },
        { t: 'استنتاج', p: 0.5, m: true, k: ['نستنتج|الاستنتاج|ومنه'] }
      ],
      mistakes: []
    })
  };

  function questionsEditor(arr) {
    return listEditor(arr, {
      itemTitle: (q) => q.q,
      badge: (q) => [
        h('span', { class: 'chip ' + (q.type === 'write' ? 'chip--gold' : 'chip--muted') }, QTYPE[q.type || 'mcq']),
        q.img ? h('span', { class: 'chip chip--muted' }, icon('image')) : null
      ],
      body: (q) => (q.type === 'write' ? writeEditor(q) : q.type === 'tf' ? tfEditor(q) : questionEditor(q)),
      creates: [
        { label: 'سؤال اختيار من متعدد', create: NEWQ.mcq },
        { label: 'صح أم خطأ', create: NEWQ.tf },
        { label: 'سؤال كتابي (نمط باك)', create: NEWQ.write }
      ],
      empty: 'لا توجد أسئلة بعد.'
    });
  }

  function quizEditor(u) {
    if (!u.levels) {
      return h('div', null,
        h('div', { class: 'sub-row' },
          h('h3', { class: 'sub' }, `الاختبار (${u.quiz.length} سؤال)`),
          h('button', {
            type: 'button', class: 'btn btn--ghost btn--sm',
            onclick: () => {
              if (!confirm('تحويل الاختبار إلى 5 مستويات؟ الأسئلة الحالية تصبح المستوى 1.')) return;
              u.levels = [1, 2, 3, 4, 5].map(n => ({
                title: 'المستوى ' + n, desc: '', pass: n >= 4 ? 50 : 60,
                questions: n === 1 ? u.quiz.map(q => Object.assign({ type: 'mcq' }, q)) : []
              }));
              delete u.quiz;
              markDirty(); rerender();
            }
          }, icon('plus'), 'تحويل إلى اختبار بمستويات')),
        questionsEditor(u.quiz));
    }
    const total = u.levels.reduce((n, L) => n + L.questions.length, 0);
    return h('div', null,
      h('h3', { class: 'sub' }, `الاختبار المتدرّج — ${u.levels.length} مستويات (${total} سؤال)`),
      tip('كل مستوى يُفتح بعد النجاح في الذي قبله. يمكن خلط الأنواع: اختيار من متعدد، صح/خطأ، وسؤال كتابي يُصحَّح آلياً بسلّم تنقيط.'),
      listEditor(u.levels, {
        itemTitle: (L) => L.title,
        badge: (L) => h('span', { class: 'chip chip--muted' }, `${L.questions.length} سؤال`),
        body: (L) => h('div', null,
          grid(3,
            fld('عنوان المستوى', bind(L, 'title')),
            fld('وصف قصير', bind(L, 'desc')),
            fld('نسبة النجاح %', bind(L, 'pass', { type: 'number', number: true, placeholder: '60' }), 'لفتح المستوى التالي')),
          h('h3', { class: 'sub' }, 'الأسئلة'),
          questionsEditor(L.questions)),
        create: () => ({ title: 'المستوى ' + (u.levels.length + 1), desc: '', pass: 60, questions: [] }),
        addLabel: 'إضافة مستوى'
      }));
  }

  function tfEditor(q) {
    return h('div', { class: 'qed' },
      fld('العبارة', bind(q, 'q', { type: 'textarea', rows: 2 })),
      grid(2,
        fld('الجواب الصحيح', bind(q, 'answer', {
          type: 'select', options: [['true', 'صحيح'], ['false', 'خطأ']],
          toInput: (v) => String(!!v), fromInput: (v) => v === 'true'
        })),
        fld('المرجع (اختياري)', bind(q, 'ref', { placeholder: 'ص ...' }))),
      fld('التعليل / التصحيح', bind(q, 'explain', { type: 'textarea', rows: 2 })),
      fld('صورة (اختياري)', imagePicker(() => q.img, v => { if (v) q.img = v; else delete q.img; })));
  }

  /* السؤال الكتابي: السؤال، الوثيقة، سلّم التنقيط، الإجابة النموذجية، وتجربة التصحيح */
  function writeEditor(q) {
    const lines = { toInput: (v) => (v || []).join('\n'), fromInput: (v) => v.split('\n').map(s => s.trim()).filter(Boolean) };
    const totalEl = h('b');
    const paintTotal = () => { totalEl.textContent = q.criteria.reduce((n, c) => n + (Number(c.p) || 0), 0) + ' نقطة'; };
    paintTotal();

    const tryIn = h('textarea', { rows: 4, placeholder: 'اكتب هنا إجابة تلميذ لتجربة التصحيح…' });
    const tryOut = h('div', { class: 'try__out' });
    const tryBtn = h('button', {
      type: 'button', class: 'btn btn--ghost btn--sm',
      onclick: () => {
        const G = window.MehiraGrader;
        if (!G) { tryOut.textContent = 'المصحّح غير متوفر.'; return; }
        const r = G.grade(q, tryIn.value || q.model || '');
        tryOut.replaceChildren(
          h('p', null, h('b', { dir: 'ltr' }, `${r.score} / ${r.total}`), ` — ${r.band} (${r.pct}%)`, r.short ? ' · قصيرة' : ''),
          h('ul', null, [...r.content, ...r.method].map(c => h('li', { class: c.ok ? 'ok' : c.partial ? 'part' : 'miss' },
            (c.ok ? '✓ ' : c.partial ? '◐ ' : '✗ ') + (c.t || '(معيار بدون عنوان)')))),
          r.warnings.length ? h('p', { class: 'muted' }, '⚠ ' + r.warnings.join(' · ')) : null);
      }
    }, icon('check'), 'جرّب التصحيح');

    return h('div', { class: 'qed' },
      fld('نص السؤال', bind(q, 'q', { type: 'textarea', rows: 3 })),
      grid(3,
        fld('نوع السؤال', bind(q, 'kind', { type: 'select', options: KINDS })),
        fld('الحد الأدنى للكلمات', bind(q, 'min', { type: 'number', number: true }), 'إجابة أقصر تُخفَّض علامتها'),
        fld('المرجع (اختياري)', bind(q, 'ref', { placeholder: 'ص ...' }))),
      grid(2,
        fld('جدول الوثيقة (اختياري)', bind(q, 'table', { type: 'textarea', rows: 3, dir: 'auto', placeholder: 'الزمن (د) | 0 | 5 | 10\nالإشعاع (%) | 0 | 80 | 60' }),
          'سطر لكل صف، والخانات مفصولة بـ |  — السطر الأول عناوين'),
        fld('صورة الوثيقة (اختياري)', imagePicker(() => q.img, v => { if (v) q.img = v; else delete q.img; }))),

      h('div', { class: 'sub-row' }, h('h3', { class: 'sub' }, 'سلّم التنقيط'), totalEl),
      tip(h('b', null, 'كيف تكتب الكلمات المفتاحية: '),
        'كل سطر = عنصر يجب أن يظهر في الإجابة. داخل السطر افصل بين المرادفات بـ | (مثال: ارتفاع|يرتفع|تزايد). ',
        'لكلمتين يجب أن تجتمعا استعمل & (مثال: نواه&80). اكتب بدون همزات ولا تاء مربوطة (نواه، هيولي، ترجمه).'),
      listEditor(q.criteria, {
        itemTitle: (c) => `${c.m ? '[منهجية] ' : ''}${c.t || 'معيار جديد'} — ${c.p} ن`,
        body: (c) => h('div', null,
          grid(2,
            fld('المعيار (يظهر للتلميذ)', bind(c, 't', { type: 'textarea', rows: 2 })),
            fld('الكلمات المفتاحية (سطر لكل عنصر)', bind(c, 'k', Object.assign({ type: 'textarea', rows: 3, dir: 'auto' }, lines)))),
          grid(3,
            fld('النقاط', bind(c, 'p', { type: 'number', number: true, after: paintTotal })),
            fld('عدد العناصر المطلوبة', bind(c, 'n', { type: 'number', number: true, placeholder: 'الكل' }), 'فارغ = كل الأسطر'),
            h('div', { class: 'checks' },
              h('label', { class: 'check' }, bind(c, 'm', { type: 'checkbox' }), 'معيار منهجية'),
              h('label', { class: 'check' }, bind(c, 'c', { type: 'checkbox' }), 'مقارنة بدون فراغات (تتاليات)')))),
        create: () => ({ t: '', p: 1, k: [] }),
        addLabel: 'إضافة معيار'
      }),

      h('h3', { class: 'sub' }, 'أخطاء شائعة (تنبيهات للتلميذ — اختياري)'),
      listEditor(q.mistakes, {
        itemTitle: (m) => m.msg,
        body: (m) => grid(2,
          fld('كلمات تدل على الخطأ (سطر لكل بديل)', bind(m, 'k', Object.assign({ type: 'textarea', rows: 2, dir: 'auto' }, lines))),
          fld('رسالة التنبيه', bind(m, 'msg', { type: 'textarea', rows: 2 }))),
        create: () => ({ k: [], msg: '' }),
        addLabel: 'إضافة تنبيه'
      }),

      fld('الإجابة النموذجية (تظهر بعد التصحيح)', bind(q, 'model', { type: 'textarea', rows: 6 })),
      h('div', { class: 'try' },
        h('h3', { class: 'sub' }, 'تجربة التصحيح'),
        h('p', { class: 'muted' }, 'اكتب إجابة كما يكتبها تلميذ (أو اتركها فارغة لتجربة الإجابة النموذجية) وتأكّد أن العلامة منطقية.'),
        tryIn, h('div', { class: 'row-end' }, tryBtn), tryOut));
  }

  function viewLessons() {
    const fields = C().fields;
    if (S.field >= fields.length) S.field = 0;
    const f = fields[S.field];

    const tabs = h('div', { class: 'tabs' },
      fields.map((x, i) => h('button', {
        type: 'button', class: 'tab' + (i === S.field ? ' is-active' : ''),
        onclick: () => { S.field = i; rerender(); }
      }, h('b', null, x.title), h('small', null, x.subtitle))),
      h('button', {
        type: 'button', class: 'tab tab--add',
        onclick: () => {
          fields.push({ id: 'f' + Date.now().toString(36), title: 'مجال جديد', subtitle: '', units: [] });
          S.field = fields.length - 1; markDirty(); rerender();
        }
      }, icon('plus'), 'مجال جديد'));

    if (!f) return page('الدروس والاختبارات', null, tabs, h('p', { class: 'muted' }, 'لا توجد مجالات. أضف مجالاً.'));

    return page('الدروس والاختبارات', 'اختر المجال، ثم افتح الوحدة لتعديل النقاط والأسئلة.',
      tabs,
      card('معلومات المجال',
        grid(2, fld('العنوان', bind(f, 'title', { after: () => { $('.tab.is-active b').textContent = f.title; } })),
          fld('الموضوع', bind(f, 'subtitle', { after: () => { $('.tab.is-active small').textContent = f.subtitle; } }))),
        h('div', { class: 'row-end' },
          h('button', {
            type: 'button', class: 'btn btn--ghost btn--sm btn--danger',
            onclick: () => {
              if (!confirm(`حذف «${f.title}» بكل وحداته (${f.units.length})؟`)) return;
              fields.splice(S.field, 1); S.field = 0; markDirty(); rerender();
            }
          }, icon('trash'), 'حذف المجال'))),
      card(`الوحدات (${f.units.length})`,
        listEditor(f.units, {
          itemTitle: (u) => `${u.code || '—'} · ${u.title || ''}`,
          badge: (u) => [
            u.video ? h('span', { class: 'chip chip--ok' }, icon('video'), 'فيديو') : null,
            u.levels ? h('span', { class: 'chip chip--gold' }, `${u.levels.length} مستويات`) : null,
            h('span', { class: 'chip chip--muted' }, `${qCount(u)} سؤال`)
          ],
          body: (u) => unitEditor(u),
          create: () => ({
            code: 'و ' + (f.units.length + 1), title: 'وحدة جديدة', desc: '', duration: '45 د', video: '',
            points: [], quiz: []
          }),
          addLabel: 'إضافة وحدة'
        })));
  }

  /* ---------------------------------------------- الأفواج */
  function viewSchedule() {
    const sc = C().schedule;
    const centerOpts = C().centers.map(c => [c.id, c.name]);
    return page('الأفواج والتوقيت', 'كل صف = فوج. غيّر الحالة إلى «مغلق» عندما يمتلئ الفوج.',
      card('عام',
        grid(2,
          fld('عنوان البرنامج', bind(sc, 'note', { placeholder: 'جدول توقيت الأفواج — تبقى أماكن قليلة' })),
          fld('صورة جدول التوقيت (اختياري)', imagePicker(() => sc.poster, v => { sc.poster = v; }, { label: 'رفع صورة الجدول' })))),
      card(`الأفواج (${sc.groups.length})`,
        centerOpts.length ? null : tip('أضف مركزاً أولاً من صفحة «المراكز».'),
        rowsEditor(sc.groups, [
          { key: 'name', label: 'اسم الفوج', w: '1.2fr' },
          { key: 'center', label: 'المركز', type: 'select', options: centerOpts, w: '1.3fr' },
          { key: 'day', label: 'اليوم', type: 'select', options: DAYS.map(d => [d, d]), w: '1fr' },
          { key: 'from', label: 'من', type: 'time', w: '.9fr' },
          { key: 'to', label: 'إلى', type: 'time', w: '.9fr' },
          { key: 'status', label: 'الحالة', type: 'select', options: STATUS, w: '1fr', rerender: true }
        ], {
          rowClass: (g) => 'st-' + (g.status || 'open'),
          create: () => ({
            name: 'فوج جديد', center: (C().centers[0] || {}).id || '', day: 'السبت',
            from: '14:00', to: '16:00', status: 'open'
          }),
          addLabel: 'إضافة فوج'
        })));
  }

  /* ---------------------------------------------- المراكز */
  function viewCenters() {
    const used = (c) => C().schedule.groups.filter(g => g.center === c.id).length;
    return page('المراكز', 'الأماكن التي تُقدَّم فيها الحصص. «بحث الخريطة» يُستعمل لفتح Google Maps، أو ضع رابطاً دقيقاً.',
      tip('للحصول على رابط دقيق: افتح المكان في Google Maps ← «مشاركة» ← «نسخ الرابط» والصقه في خانة «رابط الخريطة».'),
      card(`المراكز (${C().centers.length})`,
        rowsEditor(C().centers, [
          { key: 'name', label: 'الاسم (لاتيني)', w: '1.2fr', dir: 'ltr' },
          { key: 'ar', label: 'الاسم بالعربية', w: '1.1fr' },
          { key: 'map', label: 'بحث الخريطة', w: '1.2fr', dir: 'ltr', placeholder: 'Castor Oran' },
          { key: 'mapUrl', label: 'رابط الخريطة (اختياري)', w: '1.4fr', dir: 'ltr', placeholder: 'https://maps.app.goo.gl/...' }
        ], {
          create: () => ({ id: 'c' + Date.now().toString(36), name: '', ar: '', map: '', mapUrl: '' }),
          canRemove: (c) => {
            const n = used(c);
            if (n) { toast(`لا يمكن حذف المركز: ${n} أفواج مرتبطة به. غيّر مركزها أولاً.`, 'err', 5000); return false; }
            return true;
          },
          addLabel: 'إضافة مركز'
        })));
  }

  /* ---------------------------------------------- معلومات عامة */
  function viewGeneral() {
    const d = C();
    const bacDate = (v) => (v || '').slice(0, 16);
    return page('معلومات عامة', 'التواصل، تاريخ الباك، الأرقام، التسجيلات، الشهادات والأسئلة الشائعة.',
      card('التواصل',
        grid(3,
          fld('الهاتف (كما يظهر)', bind(d.contact, 'phone', { dir: 'ltr' })),
          fld('رقم الاتصال الدولي', bind(d.contact, 'phoneDial', { dir: 'ltr', placeholder: '+213...' })),
          fld('رقم واتساب', bind(d.contact, 'whatsapp', { dir: 'ltr', placeholder: '213...' }), 'بدون + وبدون 0 في البداية')),
        grid(2,
          fld('رابط انستغرام', bind(d.contact, 'instagram', { dir: 'ltr' })),
          fld('المدينة', bind(d.contact, 'city')))),
      card('العدّ التنازلي للبكالوريا',
        grid(3,
          fld('العنوان', bind(d.bac, 'label', { placeholder: 'بكالوريا 2027' })),
          fld('التاريخ كما يُكتب', bind(d.bac, 'dateText', { placeholder: 'الإثنين 14 جوان 2027' })),
          fld('تاريخ ووقت الامتحان', bind(d.bac, 'date', {
            type: 'datetime-local', toInput: bacDate,
            fromInput: (v) => v ? v + ':00+01:00' : ''
          }), 'بتوقيت الجزائر'))),
      card('الأرقام (الشريط تحت الواجهة)',
        rowsEditor(d.stats, [
          { key: 'value', label: 'الرقم', w: '.6fr' },
          { key: 'label', label: 'الوصف', w: '2fr' }
        ], { create: () => ({ value: '', label: '' }), addLabel: 'إضافة رقم' })),
      card('بطاقات التسجيل',
        listEditor(d.registration, {
          itemTitle: (r) => r.title,
          body: (r) => h('div', null,
            grid(3, fld('العنوان', bind(r, 'title')), fld('الوصف', bind(r, 'sub')), fld('شارة (اختياري)', bind(r, 'tag', { placeholder: 'الأماكن محدودة' }))),
            h('label', { class: 'check' }, bind(r, 'hot', { type: 'checkbox' }), 'بطاقة مميّزة (لون بارز)'),
            h('h3', { class: 'sub' }, 'المزايا'),
            strList(r.items, { addLabel: 'إضافة ميزة' })),
          create: () => ({ title: 'باك ...', sub: '', hot: false, tag: '', items: [] }),
          addLabel: 'إضافة بطاقة'
        })),
      card('المزايا (قسم «من نحن»)',
        listEditor(d.features, {
          itemTitle: (x) => x.title,
          body: (x) => grid(2,
            h('div', null,
              fld('العنوان', bind(x, 'title')),
              fld('الأيقونة', bind(x, 'icon', { type: 'select', options: [['book', 'كتاب'], ['play', 'فيديو'], ['check', 'صح'], ['target', 'هدف']] }))),
            fld('النص', bind(x, 'text', { type: 'textarea', rows: 4 }))),
          create: () => ({ icon: 'check', title: '', text: '' }),
          addLabel: 'إضافة ميزة'
        })),
      card('خطوات المنهجية',
        rowsEditor(d.method, [
          { key: 'title', label: 'الخطوة', w: '1fr' },
          { key: 'text', label: 'الشرح', w: '3fr' }
        ], { create: () => ({ title: '', text: '' }), addLabel: 'إضافة خطوة' })),
      card('شهادات التلاميذ',
        listEditor(d.quotes, {
          itemTitle: (q) => q.name,
          body: (q) => h('div', null,
            grid(2, fld('الاسم', bind(q, 'name')), fld('معلومة (الدفعة، النقطة…)', bind(q, 'meta'))),
            fld('الشهادة', bind(q, 'text', { type: 'textarea', rows: 3 }))),
          create: () => ({ name: '', meta: '', text: '' }),
          addLabel: 'إضافة شهادة'
        })),
      card('الأسئلة الشائعة',
        listEditor(d.faq, {
          itemTitle: (x) => x.q,
          body: (x) => h('div', null, fld('السؤال', bind(x, 'q')), fld('الجواب', bind(x, 'a', { type: 'textarea', rows: 3 }))),
          create: () => ({ q: '', a: '' }),
          addLabel: 'إضافة سؤال'
        })));
  }

  /* ---------------------------------------------- المساعد الآلي */
  function viewBot() {
    const b = C().bot;
    return page('المساعد الآلي', 'المساعد يجيب تلقائياً عن الأفواج والمراكز والتسجيل والباك. هنا تضيف أجوبة الدروس.',
      card('عام',
        fld('اسم المساعد', bind(b, 'name')),
        fld('رسالة الترحيب', bind(b, 'greeting', { type: 'textarea', rows: 3 })),
        h('h3', { class: 'sub' }, 'أزرار الاقتراحات'),
        strList(b.suggestions, { addLabel: 'إضافة اقتراح' })),
      card(`أجوبة الدروس (${b.kb.length})`,
        tip('«الكلمات المفتاحية»: إذا كتب التلميذ إحداها يظهر الجواب. اكتبها بدون همزات (مثلاً: انزيم، ترجمه) وافصل بينها بفاصلة.'),
        listEditor(b.kb, {
          itemTitle: (k) => k.keys.join('، '),
          body: (k) => h('div', null,
            fld('الكلمات المفتاحية', bind(k, 'keys', {
              toInput: (v) => (v || []).join('، '),
              fromInput: (v) => v.split(/[،,]/).map(s => s.trim()).filter(Boolean)
            })),
            fld('الجواب', bind(k, 'a', { type: 'textarea', rows: 4 })),
            fld('المرجع (اختياري)', bind(k, 'ref', { placeholder: 'الوحدة 1 — ص 3' }))),
          create: () => ({ keys: [], a: '', ref: '' }),
          addLabel: 'إضافة جواب'
        })));
  }

  /* ---------------------------------------------- الملخصات (PDF) */
  const MAX_PDF = 40 * 1024 * 1024;
  const fmtSize = (b) => !b ? '' : b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  const fieldOpts = () => [['', 'عام (كل المجالات)']].concat(C().fields.map(f => [f.id, `${f.title} — ${f.subtitle}`]));
  const unitOpts = (fieldId) => {
    const f = C().fields.find(x => x.id === fieldId);
    return [['', 'كل وحدات المجال']].concat(f ? f.units.map(u => [u.code, `${u.code} — ${u.title}`]) : []);
  };
  const newRes = { title: '', field: '', unit: '' };

  function readAsBase64(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(',')[1]);
      r.onerror = () => rej(new Error('تعذّرت قراءة الملف'));
      r.readAsDataURL(file);
    });
  }

  async function uploadPdf(file) {
    if (S.mode !== 'github') { toast('رفع الملفات يتطلب تسجيل الدخول', 'err'); return; }
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') { toast('اختر ملف PDF', 'err'); return; }
    if (file.size > MAX_PDF) { toast('الملف أكبر من 40 MB. صغّره ثم أعد المحاولة.', 'err', 6000); return; }
    const title = newRes.title.trim() || file.name.replace(/\.pdf$/i, '');
    const slug = (file.name.replace(/\.pdf$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'resume').slice(0, 40);
    const path = `assets/files/${Date.now()}-${slug}.pdf`;
    busy(true, `جارٍ رفع «${title}» (${fmtSize(file.size)})…`);
    try {
      await GH.put(path, await readAsBase64(file), 'رفع ملخص PDF: ' + title);
    } catch (e) {
      busy(false);
      toast('فشل رفع الملف: ' + e.message, 'err', 7000);
      return;
    }
    busy(false);
    C().resources.unshift({
      title, file: path, field: newRes.field, unit: newRes.field ? newRes.unit : '',
      size: file.size, added: new Date().toISOString().slice(0, 10)
    });
    newRes.title = '';
    rerender();
    await save();   /* نشر القائمة مباشرة حتى يظهر الملف للتلاميذ */
  }

  async function removePdf(r) {
    if (!confirm(`حذف الملخص «${r.title}» من الموقع؟`)) return;
    const list = C().resources;
    list.splice(list.indexOf(r), 1);
    rerender();
    if (S.mode !== 'github') { markDirty(); return; }
    await save();
    if (isDirty()) return;   /* لم يُنشر الحذف */
    try { await GH.del(r.file, 'حذف ملخص PDF: ' + r.title); } catch (e) { /* الملف غير موجود: لا مشكلة */ }
  }

  function viewResources() {
    const list = C().resources;
    const file = h('input', { type: 'file', accept: 'application/pdf,.pdf', hidden: true });
    file.addEventListener('change', () => { const f = file.files[0]; file.value = ''; uploadPdf(f); });
    const unitSel = () => bind(newRes, 'unit', { type: 'select', options: unitOpts(newRes.field) });

    return page('الملخصات (PDF)', 'ارفع ملخصات الدروس بصيغة PDF، وسيجدها التلاميذ في قسم «الملخصات» وداخل كل وحدة.',
      card('إضافة ملخص جديد',
        grid(3,
          fld('اسم الملخص', bind(newRes, 'title', { placeholder: 'مثلاً: ملخص الوحدة 1 — تركيب البروتين' }), 'إن تركته فارغاً يُستعمل اسم الملف'),
          fld('المجال', bind(newRes, 'field', { type: 'select', options: fieldOpts(), after: () => { newRes.unit = ''; }, rerender: true })),
          fld('الوحدة', newRes.field ? unitSel() : h('select', { disabled: true }, h('option', null, 'اختر المجال أولاً')))),
        h('div', { class: 'drop', onclick: () => file.click() },
          icon('upload'), h('b', null, 'اضغط لاختيار ملف PDF'), h('small', null, 'حتى 40 MB · يُنشر مباشرة بعد الرفع'), file),
        S.mode !== 'github' ? tip('رفع الملفات متاح بعد تسجيل الدخول فقط.') : null),
      card(`الملخصات المنشورة (${list.length})`,
        list.length ? h('div', { class: 'files' }, list.map(r => h('div', { class: 'file' },
          h('span', { class: 'file__i' }, icon('download'), h('b', null, 'PDF')),
          h('div', { class: 'file__main' },
            fld('الاسم', bind(r, 'title')),
            grid(2,
              fld('المجال', bind(r, 'field', { type: 'select', options: fieldOpts(), after: () => { r.unit = ''; }, rerender: true })),
              fld('الوحدة', r.field ? bind(r, 'unit', { type: 'select', options: unitOpts(r.field) }) : h('select', { disabled: true }, h('option', null, '—')))),
            h('small', { class: 'muted' }, [r.added, fmtSize(r.size)].filter(Boolean).join(' · '))),
          h('div', { class: 'file__tools' },
            h('a', { class: 'btn btn--ghost btn--sm', href: '../' + r.file, target: '_blank', rel: 'noopener' }, icon('eye'), 'فتح'),
            h('button', { type: 'button', class: 'btn btn--ghost btn--sm btn--danger', onclick: () => removePdf(r) }, icon('trash'), 'حذف')))))
          : h('p', { class: 'muted' }, 'لا توجد ملخصات بعد.'),
        list.length ? h('p', { class: 'muted', style: 'margin-top:12px' }, 'بعد تعديل الاسم أو المجال اضغط «حفظ ونشر».') : null));
  }

  /* ---------------------------------------------- الإعدادات */
  function viewSettings() {
    const importFile = h('input', { type: 'file', accept: '.js,.json', hidden: true });
    importFile.addEventListener('change', async () => {
      const f = importFile.files[0];
      importFile.value = '';
      if (!f) return;
      try {
        const text = await f.text();
        const data = text.trim().startsWith('{') ? JSON.parse(text) : parseContent(text);
        if (!confirm('سيُستبدل كل المحتوى الحالي بمحتوى الملف (كمسودة غير منشورة). متابعة؟')) return;
        S.data = normalize(data);
        markDirty(); rerender();
        toast('تم الاستيراد — راجع ثم اضغط «حفظ ونشر»');
      } catch (e) { toast('ملف غير صالح: ' + e.message, 'err', 6000); }
    });

    return page('الإعدادات', null,
      card('الاتصال بـ GitHub',
        S.mode === 'github'
          ? h('div', { class: 'kv' },
            h('div', null, h('span', null, 'المستودع'), h('a', { href: `https://github.com/${GH.owner}/${GH.repo}`, target: '_blank', rel: 'noopener', dir: 'ltr' }, `${GH.owner}/${GH.repo}`)),
            h('div', null, h('span', null, 'الفرع'), h('b', { dir: 'ltr' }, GH.branch)),
            h('div', null, h('span', null, 'ملف المحتوى'), h('b', { dir: 'ltr' }, CFG.contentPath)))
          : tip('أنت في وضع التجربة: التعديلات لا تُحفظ على الموقع. استعمل «تنزيل نسخة» أو سجّل الدخول.'),
        h('div', { class: 'row-end' },
          h('button', { type: 'button', class: 'btn btn--ghost btn--danger', onclick: logout }, icon('out'), 'تسجيل الخروج'))),
      card('نسخ احتياطي',
        h('p', { class: 'muted' }, 'نزّل نسخة من المحتوى الحالي (مع التعديلات غير المنشورة) لحفظها عندك، أو استورد نسخة سابقة.'),
        h('div', { class: 'btns' },
          h('button', { type: 'button', class: 'btn btn--ghost', onclick: download }, icon('download'), 'تنزيل نسخة (content.js)'),
          h('button', { type: 'button', class: 'btn btn--ghost', onclick: () => importFile.click() }, icon('upload'), 'استيراد نسخة'),
          importFile)));
  }

  function download() {
    const blob = new Blob([serialize(S.data)], { type: 'text/javascript;charset=utf-8' });
    const a = h('a', { href: URL.createObjectURL(blob), download: 'content.js' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  const VIEWS = {
    home:     { t: 'الرئيسية',          i: 'home',  r: viewHome },
    videos:   { t: 'الفيديوهات',         i: 'video', r: viewVideos },
    lessons:  { t: 'الدروس والاختبارات', i: 'book',  r: viewLessons },
    resources:{ t: 'الملخصات (PDF)',     i: 'download', r: viewResources },
    schedule: { t: 'الأفواج',            i: 'clock', r: viewSchedule },
    centers:  { t: 'المراكز',            i: 'pin',   r: viewCenters },
    general:  { t: 'معلومات عامة',       i: 'info',  r: viewGeneral },
    bot:      { t: 'المساعد الآلي',      i: 'chat',  r: viewBot },
    settings: { t: 'الإعدادات',          i: 'gear',  r: viewSettings }
  };

  /* ===================================================== الهيكل */
  function shell() {
    const navEl = h('nav', { class: 'side__nav', 'aria-label': 'أقسام اللوحة' },
      Object.entries(VIEWS).map(([k, v]) => h('button', {
        type: 'button', class: 'side__link', 'data-view': k, onclick: () => nav(k)
      }, icon(v.i), h('span', null, v.t))));

    const app = h('div', { class: 'app' },
      h('aside', { class: 'side', id: 'side' },
        h('div', { class: 'side__brand' }, h('img', { src: '../assets/img/logo.png', alt: 'Mehira Science' }), h('small', null, 'لوحة التحكم')),
        navEl,
        h('div', { class: 'side__foot' },
          h('a', { class: 'side__link', href: '../', target: '_blank', rel: 'noopener' }, icon('ext'), h('span', null, 'فتح الموقع')),
          h('button', { type: 'button', class: 'side__link', onclick: logout }, icon('out'), h('span', null, 'خروج')))),
      h('div', { class: 'main' },
        h('header', { class: 'top' },
          h('button', { type: 'button', class: 'ibtn top__menu', 'aria-label': 'القائمة', onclick: () => $('#side').classList.toggle('is-open') }, icon('menu')),
          h('span', { class: 'state', id: 'saveState' }),
          h('div', { class: 'top__btns' },
            h('button', { type: 'button', class: 'btn btn--ghost btn--sm', id: 'btnUndo', onclick: undo }, icon('undo'), h('span', null, 'تراجع')),
            h('button', { type: 'button', class: 'btn btn--ghost btn--sm', onclick: preview }, icon('eye'), h('span', null, 'معاينة')),
            h('button', { type: 'button', class: 'btn btn--primary', id: 'btnSave', onclick: save }, icon('save'),
              h('span', null, S.mode === 'github' ? 'حفظ ونشر' : 'تنزيل الملف')))),
        S.mode === 'demo' ? h('div', { class: 'demo' }, 'وضع التجربة — التعديلات لا تُنشر. ', h('button', { type: 'button', onclick: logout }, 'تسجيل الدخول')) : null,
        h('main', { id: 'view', class: 'view' })),
      h('div', { class: 'busy', id: 'busy', hidden: true }, h('div', { class: 'busy__box' }, h('span', { class: 'spin' }), h('b', { id: 'busyMsg' }, ''))));

    $('#app').replaceChildren(app);
    render();
  }

  function nav(view) {
    S.view = view;
    $('#side').classList.remove('is-open');
    render(true);
    history.replaceState(null, '', '#' + view);
  }

  function render(toTop) {
    const v = $('#view');
    if (!v) return;
    const y = toTop ? 0 : window.scrollY;
    v.replaceChildren(VIEWS[S.view].r());
    document.querySelectorAll('.side__link[data-view]').forEach(b => b.classList.toggle('is-active', b.dataset.view === S.view));
    document.title = VIEWS[S.view].t + ' — لوحة التحكم';
    paintSaveState();
    window.scrollTo(0, y);
  }
  const rerender = () => render(false);

  function paintSaveState() {
    const el = $('#saveState');
    if (!el) return;
    const dirty = isDirty();
    el.className = 'state ' + (dirty ? 'state--dirty' : 'state--ok');
    el.textContent = dirty ? 'تغييرات غير منشورة' : (S.mode === 'github' ? 'كل شيء منشور' : 'بدون تغييرات');
    $('#btnSave').disabled = S.saving || (S.mode === 'github' && !dirty);
    $('#btnUndo').disabled = !dirty;
  }

  function busy(on, msg) {
    const b = $('#busy');
    if (!b) return;
    b.hidden = !on;
    if (msg) $('#busyMsg').textContent = msg;
  }

  /* ===================================================== إجراءات */
  function validate() {
    const issues = [];
    C().fields.forEach(f => {
      const codes = new Set();
      f.units.forEach(u => {
        if (codes.has(u.code)) issues.push(`رمز مكرر «${u.code}» في ${f.title}`);
        codes.add(u.code);
        unitQuestions(u).forEach((q, i) => {
          const where = `${f.title} · ${u.code}: السؤال ${i + 1}`;
          if (!String(q.q || '').trim()) issues.push(`${where} بدون نص`);
          if ((q.type || 'mcq') === 'mcq' && (q.options || []).some(o => !String(o).trim())) issues.push(`${where} فيه خيار فارغ`);
          if (q.type === 'write' && !(q.criteria || []).some(c => (c.k || []).length)) issues.push(`${where} (كتابي) بدون كلمات مفتاحية في سلّم التنقيط`);
        });
      });
    });
    const ids = new Set(C().centers.map(c => c.id));
    C().schedule.groups.forEach(g => { if (!ids.has(g.center)) issues.push(`الفوج «${g.name}» بدون مركز صحيح`); });
    return issues;
  }

  function summary() {
    let before = {};
    try { before = JSON.parse(S.original); } catch (e) { /* */ }
    const keys = Object.keys(Object.assign({}, before, S.data))
      .filter(k => JSON.stringify(before[k]) !== JSON.stringify(S.data[k]));
    return 'تحديث من لوحة التحكم: ' + (keys.map(k => SECTION_NAMES[k] || k).join('، ') || 'المحتوى');
  }

  async function save() {
    if (S.mode !== 'github') { download(); return; }
    if (!isDirty() || S.saving) return;
    const issues = validate();
    if (issues.length && !confirm('تنبيه:\n• ' + issues.slice(0, 8).join('\n• ') + (issues.length > 8 ? '\n…' : '') + '\n\nهل تريد النشر رغم ذلك؟')) return;

    S.saving = true; paintSaveState();
    busy(true, 'جارٍ الحفظ والنشر…');
    try {
      const remote = await GH.get(CFG.contentPath);
      if (remote.sha !== S.sha &&
          !confirm('تم تعديل المحتوى من مكان آخر بعد فتحك للوحة.\nإذا تابعت ستُستبدل تلك التعديلات بتعديلاتك. متابعة؟')) return;
      const res = await GH.put(CFG.contentPath, b64enc(serialize(S.data)), summary(), remote.sha);
      S.sha = res.content.sha;
      S.original = JSON.stringify(S.data);
      localStorage.removeItem(DRAFT);
      toast('تم الحفظ ✓ سيظهر التحديث على الموقع خلال دقيقة إلى دقيقتين', 'ok', 6000);
      if (S.view === 'home') rerender();
    } catch (e) {
      const why = e.status === 401 ? 'الرمز (Token) غير صالح أو منتهي الصلاحية'
        : e.status === 403 || e.status === 404 ? 'الرمز لا يملك صلاحية الكتابة على المستودع'
        : e.status === 409 ? 'تعارض مع تعديل آخر — أعد تحميل الصفحة'
        : e.message;
      toast('فشل الحفظ: ' + why, 'err', 8000);
    } finally {
      S.saving = false;
      busy(false);
      paintSaveState();
    }
  }

  function preview() {
    try {
      localStorage.setItem(DRAFT, JSON.stringify(S.data));
      window.open('../?preview=1', '_blank');
    } catch (e) { toast('تعذّرت المعاينة: ' + e.message, 'err'); }
  }

  function undo() {
    if (!isDirty() || !confirm('إلغاء كل التعديلات غير المنشورة؟')) return;
    S.data = normalize(JSON.parse(S.original));
    rerender();
    toast('تم التراجع');
  }

  function logout() {
    if (isDirty() && !confirm('لديك تغييرات غير منشورة ستضيع. خروج؟')) return;
    localStorage.removeItem(KEY.token);
    sessionStorage.removeItem(KEY.token);
    S.data = null; S.original = ''; S.mode = null;
    login();
  }

  /* ===================================================== الدخول */
  function tokenLink(owner, repo) {
    const p = new URLSearchParams({
      name: 'Mehira admin',
      description: `لوحة تحكم موقع ${repo}`,
      target_name: owner || '',
      contents: 'write'
    });
    return 'https://github.com/settings/personal-access-tokens/new?' + p.toString();
  }

  async function connect(owner, repo, token) {
    GH.owner = owner; GH.repo = repo; GH.token = token; GH.branch = CFG.branch;
    const info = await GH.api('GET', GH.base());
    if (info.permissions && !info.permissions.push) {
      const e = new Error('هذا الرمز لا يملك صلاحية الكتابة (Contents: Read and write)');
      e.status = 403; throw e;
    }
    if (info.default_branch && !window.ADMIN_CONFIG?.branch) GH.branch = info.default_branch;
    const file = await GH.get(CFG.contentPath);
    S.data = normalize(parseContent(file.text));
    S.original = JSON.stringify(S.data);
    S.sha = file.sha;
    S.mode = 'github';
  }

  async function demo() {
    const res = await fetch('../' + CFG.contentPath + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('تعذّر تحميل ملف المحتوى');
    S.data = normalize(parseContent(await res.text()));
    S.original = JSON.stringify(S.data);
    S.mode = 'demo';
  }

  function guessRepo() {
    const saved = localStorage.getItem(KEY.repo);
    if (saved) return saved;
    if (CFG.owner && CFG.repo) return CFG.owner + '/' + CFG.repo;
    const m = location.hostname.match(/^([\w-]+)\.github\.io$/);
    if (m) return m[1] + '/' + (location.pathname.split('/')[1] || CFG.repo);
    return '';
  }

  /* كلمة المرور تفكّ تشفير رمز GitHub المحفوظ في config.js (AES-GCM + PBKDF2) */
  async function unlock(password) {
    const L = CFG.lock;
    const bytes = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: bytes(L.salt), iterations: L.iter, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    try {
      const out = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(L.iv) }, key, bytes(L.data));
      return new TextDecoder().decode(out);
    } catch (e) {
      const err = new Error('كلمة المرور غير صحيحة.');
      err.status = 'pw';
      throw err;
    }
  }

  function login(errMsg) {
    const locked = !!(CFG.lock && CFG.lock.data && window.crypto && crypto.subtle);
    const pwIn = locked ? h('input', { type: 'password', dir: 'ltr', autocomplete: 'current-password' }) : null;
    const repoIn = h('input', { type: 'text', dir: 'ltr', placeholder: 'owner/repo', required: true, autocomplete: 'off' });
    repoIn.value = guessRepo();
    const tokIn = h('input', { type: 'password', dir: 'ltr', placeholder: 'github_pat_…', required: !locked, autocomplete: 'off' });
    const remember = h('input', { type: 'checkbox', checked: true });
    const err = h('p', { class: 'login__err', hidden: !errMsg }, errMsg || '');
    const btn = h('button', { type: 'submit', class: 'btn btn--primary btn--block' }, 'دخول');
    const [o0, r0] = repoIn.value.split('/');
    const link = h('a', { href: tokenLink(o0, r0), target: '_blank', rel: 'noopener' }, 'إنشاء رمز جديد على GitHub');
    repoIn.addEventListener('input', () => { const [o, r] = repoIn.value.split('/'); link.href = tokenLink(o, r); });

    const form = h('form', { class: 'login__form' },
      locked ? fld('كلمة المرور', pwIn) : fld('رمز الدخول (GitHub Token)', tokIn),
      h('label', { class: 'check' }, remember, 'تذكّرني على هذا الجهاز'),
      err, btn,
      h('details', { class: 'login__adv', open: repoIn.value ? null : true },
        h('summary', null, locked ? 'الدخول برمز GitHub' : 'المستودع'),
        locked ? fld('رمز الدخول (GitHub Token)', tokIn) : null,
        fld('حساب/مستودع GitHub', repoIn)));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const [owner, repo] = repoIn.value.trim().split('/');
      const usePw = locked && pwIn.value && !tokIn.value.trim();
      if (!owner || !repo || (!usePw && !tokIn.value.trim())) {
        err.hidden = false; err.textContent = locked ? 'أدخل كلمة المرور.' : 'أدخل الرمز والمستودع.'; return;
      }
      btn.disabled = true; btn.textContent = 'جارٍ التحقق…'; err.hidden = true;
      try {
        const token = usePw ? await unlock(pwIn.value) : tokIn.value.trim();
        await connect(owner, repo, token);
        (remember.checked ? localStorage : sessionStorage).setItem(KEY.token, token);
        localStorage.setItem(KEY.repo, owner + '/' + repo);
        start();
      } catch (ex) {
        err.hidden = false;
        err.textContent = ex.status === 'pw' ? ex.message
          : ex.status === 401 ? 'الرمز غير صحيح أو منتهي الصلاحية.'
          : ex.status === 404 ? 'المستودع غير موجود، أو الرمز لا يملك صلاحية عليه.'
          : ex.message;
        btn.disabled = false; btn.textContent = 'دخول';
      }
    });

    $('#app').replaceChildren(h('div', { class: 'login' },
      h('div', { class: 'login__card' },
        h('img', { class: 'login__logo', src: '../assets/img/logo.png', alt: 'Mehira Science' }),
        h('h1', null, 'لوحة التحكم'),
        h('p', { class: 'muted' }, 'سجّل الدخول لإدارة الفيديوهات، الدروس، الأفواج والمراكز.'),
        form,
        locked ? null : h('details', { class: 'login__help' },
          h('summary', null, 'كيف أحصل على رمز الدخول؟'),
          h('ol', null,
            h('li', null, link, ' (سجّل الدخول بحساب GitHub صاحب الموقع).'),
            h('li', null, 'في «Repository access» اختر ', h('b', null, 'Only select repositories'), ' ثم اختر مستودع الموقع.'),
            h('li', null, 'في «Permissions» ← «Repository permissions» اجعل ', h('b', null, 'Contents'), ' = ', h('b', null, 'Read and write'), '.'),
            h('li', null, 'اختر مدة الصلاحية (مثلاً سنة)، ثم اضغط ', h('b', null, 'Generate token'), ' وانسخ الرمز والصقه هنا.')),
          h('p', { class: 'muted' }, 'الرمز يُحفظ في هذا المتصفح فقط. لا تشاركه مع أحد.')),
        h('button', {
          type: 'button', class: 'login__demo',
          onclick: async () => { try { await demo(); start(); } catch (e) { toast(e.message, 'err'); } }
        }, 'تجربة اللوحة بدون حفظ'))));
    (locked ? pwIn : repoIn.value ? tokIn : repoIn).focus();
  }

  function start() {
    const v = location.hash.slice(1);
    if (VIEWS[v]) S.view = v;
    shell();
  }

  /* ===================================================== التشغيل */
  window.addEventListener('beforeunload', (e) => { if (isDirty()) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && S.data) { e.preventDefault(); save(); }
  });

  (async function boot() {
    const token = localStorage.getItem(KEY.token) || sessionStorage.getItem(KEY.token);
    const repo = guessRepo();
    if (token && repo) {
      try {
        const [o, r] = repo.split('/');
        await connect(o, r, token);
        start();
        return;
      } catch (e) {
        localStorage.removeItem(KEY.token);
        sessionStorage.removeItem(KEY.token);
        login(e.status === 401 ? 'انتهت صلاحية الرمز. أدخل رمزاً جديداً.' : 'تعذّر الاتصال: ' + e.message);
        return;
      }
    }
    login();
  })();
})();
