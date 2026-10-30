/* ============================================================================
   MEHIRA SCIENCE — مصحّح الإجابات الكتابية (نمط البكالوريا)
   يقارن إجابة التلميذ بسلّم تنقيط: معايير المضمون (الكلمات العلمية)
   ومعايير المنهجية (تقديم الوثيقة، القيم، الربط، الاستنتاج...).

   شكل المعيار في content.js:
     { t: 'نص المعيار', p: 1, k: ['مجموعة 1', 'مجموعة 2'], n: 2, m: true, c: false }
       k : مجموعات كلمات. داخل المجموعة: البدائل مفصولة بـ |
           والكلمات التي يجب أن تجتمع مفصولة بـ &   (مثال: 'نواه&تزداد|نواه&80')
       n : عدد المجموعات المطلوبة (الافتراضي: كلها)
       m : معيار منهجية
       c : مقارنة بدون فراغات (لتتاليات ARNm مثلاً)
   ========================================================================== */
(function (root) {
  'use strict';

  /* توحيد الكتابة العربية: الهمزات، التاء المربوطة، الألف المقصورة، الأرقام، التشكيل */
  function gnorm(s) {
    return String(s || '').toLowerCase()
      .replace(/[ً-ٰٟـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x660))
      .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x6F0))
      .replace(/[′’‘`´]/g, "'")
      .replace(/[−–—]/g, '-')
      .replace(/[،,.:;!()\[\]{}«»"\/\\_=]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  const compact = (s) => gnorm(s).replace(/[^a-z0-9؀-ۿ]/g, '');

  function wordCount(s) {
    return String(s || '').trim().split(/\s+/).filter(Boolean).length;
  }

  /* مطابقة بديل واحد: الكلمات المجمّعة بـ & يجب أن تظهر كلها */
  function altHit(alt, text, tokens, isCompact) {
    return alt.split('&').map(x => x.trim()).filter(Boolean).every(part => {
      const k = isCompact ? compact(part) : gnorm(part);
      if (!k) return true;
      if (isCompact) return text.includes(k);
      /* الكلمات القصيرة جداً (حرف أو حرفان) يجب أن تكون كلمة كاملة — أما الرموز مثل % فتكفي */
      return k.length <= 2 && /[a-z0-9ء-ي]/.test(k) ? tokens.has(k) : text.includes(k);
    });
  }
  function groupHit(group, text, tokens, isCompact) {
    return String(group).split('|').some(alt => altHit(alt, text, tokens, isCompact));
  }

  function prep(answer) {
    const text = gnorm(answer);
    return { text, tokens: new Set(text.split(' ')), compact: compact(answer) };
  }

  function criterionHit(c, P) {
    const groups = c.k || [];
    if (!groups.length) return { ok: false, hits: 0, need: 0 };
    const src = c.c ? P.compact : P.text;
    const hits = groups.filter(g => groupHit(g, src, P.tokens, !!c.c)).length;
    const need = Math.min(c.n || groups.length, groups.length);
    return { ok: hits >= need, partial: hits > 0 && hits < need, hits, need };
  }

  /* أدلة المنهجية حسب نوع السؤال */
  const METHOD = {
    analysis: {
      name: 'تحليل وثيقة',
      steps: [
        'قدّم الوثيقة: «يمثل الجدول / المنحنى تغيرات ... بدلالة ...».',
        'صِف النتائج مرحلة بمرحلة بالقيم والوحدات: «نلاحظ أن ... ترتفع من ... إلى ...».',
        'قارن بين الحالات إن وُجدت: «في حين / بالمقابل ...».',
        'اختم باستنتاج جزئي: «نستنتج أن ...».'
      ]
    },
    interpret: {
      name: 'تفسير',
      steps: [
        'انطلق من الملاحظة ولا تُعِد وصف النتائج بالتفصيل.',
        'اربطها بالسبب العلمي: «يعود ذلك إلى ... لأن ...».',
        'استعمل المصطلحات العلمية الدقيقة وتسلسلاً منطقياً (سبب ← نتيجة).',
        'اختم بخلاصة قصيرة.'
      ]
    },
    text: {
      name: 'نص علمي',
      steps: [
        'مقدمة: جملة تعريفية مرتبطة بالموضوع + إشكالية على شكل سؤال.',
        'عرض: أفكار دقيقة ومنظمة ومتسلسلة بالمصطلحات العلمية (فقرة لكل مرحلة).',
        'خاتمة: إجابة مختصرة على الإشكالية.',
        'لا تكتب بالنقاط فقط: النص العلمي جمل مترابطة.'
      ]
    },
    apply: {
      name: 'تطبيق / حساب',
      steps: [
        'اكتب خطوات الحل بالترتيب ولا تكتفِ بالنتيجة.',
        'اذكر القاعدة المستعملة (التكامل، الشفرة الوراثية، عدد الروابط = عدد AA − 1 ...).',
        'احترم الاتجاه 5′ → 3′ والرموز العلمية.',
        'أعطِ النتيجة النهائية بوضوح.'
      ]
    },
    hypothesis: {
      name: 'اقتراح فرضية',
      steps: [
        'صغ الفرضية بصيغة احتمال: «نفترض أن ... / قد يكون ...».',
        'اربطها مباشرة بالمعطيات.',
        'اقترح إن أمكن طريقة للتحقق منها.'
      ]
    }
  };

  const BANDS = [
    [85, 'ممتاز', 'excellent'],
    [65, 'جيد', 'good'],
    [45, 'مقبول', 'fair'],
    [0, 'يحتاج مراجعة', 'weak']
  ];

  /* التصحيح */
  function grade(q, answer) {
    const P = prep(answer);
    const words = wordCount(answer);
    const criteria = (q.criteria || []).map(c => {
      const r = criterionHit(c, P);
      const pts = Number(c.p) || 1;
      /* نصف العلامة عند تحقق جزء من المجموعات المطلوبة */
      const got = r.ok ? pts : (r.partial && r.need > 1 ? Math.round(pts * (r.hits / r.need) * 2) / 4 : 0);
      return { t: c.t, p: pts, got, ok: r.ok, partial: !r.ok && got > 0, m: !!c.m };
    });

    const total = criteria.reduce((n, c) => n + c.p, 0) || 1;
    let score = criteria.reduce((n, c) => n + c.got, 0);

    /* إجابة قصيرة جداً: تُخفَّض العلامة (ما عدا أسئلة الحساب والتطبيق) */
    const min = Number(q.min) || 0;
    let short = false;
    if (min && words < min) {
      short = true;
      if (q.kind !== 'apply') score = score * Math.max(0.5, words / min);
    }
    score = Math.round(score * 4) / 4;

    const warnings = (q.mistakes || [])
      .filter(mk => (mk.k || []).some(g => groupHit(g, mk.c ? P.compact : P.text, P.tokens, !!mk.c)))
      .map(mk => mk.msg);

    const pct = Math.round(score / total * 100);
    const band = BANDS.find(b => pct >= b[0]);
    return {
      score, total, pct, words, short, min,
      band: band[1], bandKey: band[2],
      content: criteria.filter(c => !c.m),
      method: criteria.filter(c => c.m),
      warnings,
      guide: METHOD[q.kind] || null
    };
  }

  root.MehiraGrader = { grade, gnorm, wordCount, METHOD };
  if (typeof module !== 'undefined') module.exports = root.MehiraGrader;
})(typeof window !== 'undefined' ? window : globalThis);
