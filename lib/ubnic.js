/* ============================================================
   UBNIC UI — comportamentos (Fase 1: genéricos)
   Drop-in: <script src="ubnic.js" defer></script>
   Progressive enhancement por delegação de eventos.
   Componentes interativos disparam o evento 'u:change' (detail: {name, value}).
   API pública: window.UBNIC.setTheme(), .initTheme(), .copy(), .refresh()
   ============================================================ */
(function () {
  'use strict';
  const UBNIC = {};
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const fire = (el, name, value) =>
    el.dispatchEvent(new CustomEvent('u:change', { bubbles: true, detail: { name, value } }));

  /* ---------- IMC (campo composto peso/altura/IMC) ---------- */
  // Função pura: dado o valor-bruto dos 3 inputs + ranges, devolve {bmi, weight, height, mode}.
  // Única fonte de verdade do cálculo — usada pelo DOM (evalImc) e pelo estado (recomputeState).
  function imcFrom(dRaw, wRaw, hRaw, R) {
    const num = (s) => { if (s == null) return null; const n = parseFloat(String(s).trim()); return isFinite(n) ? n : null; };
    const inb = (n, rng) => (n != null && rng && n >= rng[0] && n <= rng[1]) ? n : null;
    const has = (s) => s != null && String(s).trim() !== '';
    const hasWH = has(wRaw) || has(hRaw);
    if (hasWH) {
      const w = inb(num(wRaw), R.w), h = inb(num(hRaw), R.h);
      if (w != null && h != null) { const hm = h / 100; return { bmi: Math.round((w / (hm * hm)) * 10) / 10, weight: w, height: h, mode: 'wh' }; }
      return { bmi: undefined, weight: (w != null ? w : undefined), height: (h != null ? h : undefined), mode: 'wh' };
    }
    const d = inb(num(dRaw), R.b);
    return { bmi: (d != null ? d : undefined), weight: undefined, height: undefined, mode: 'direct' };
  }
  UBNIC._imcFrom = imcFrom; // exposto p/ testes
  // Classificação clínica — faixas verbatim do KDS (getBMIClassification).
  UBNIC.imcClass = function (bmi) {
    bmi = parseFloat(bmi);
    if (!bmi || bmi < 12) return { text: '', level: '' };
    let cls, level;
    if (bmi < 18.5)      { cls = 'Baixo peso'; level = 'warn'; }
    else if (bmi < 25)   { cls = 'Peso normal'; level = 'ok'; }
    else if (bmi < 30)   { cls = 'Excesso de peso'; level = 'warn'; }
    else if (bmi < 35)   { cls = 'Obesidade grau I'; level = 'bad'; }
    else if (bmi < 40)   { cls = 'Obesidade grau II'; level = 'bad'; }
    else                 { cls = 'Obesidade grau III (mórbida)'; level = 'bad'; }
    return { text: 'IMC ' + bmi.toFixed(1) + ' — ' + cls, level: level };
  };

  /* ---------- Onset (tempo de evolução) ---------- */
  const ONSET_UNIT_PT = { weeks: 'semanas', months: 'meses', years: 'anos' };
  const ONSET_UNIT_DAYS = { weeks: 7, months: 30, years: 365 };
  function fmtDecorrido(d) {
    d = Math.round(d);
    if (d < 7) return d + ' dias';
    if (d < 60) return Math.round(d / 7) + ' semanas';
    if (d < 730) return Math.round(d / 30) + ' meses';
    return (d / 365).toFixed(1) + ' anos';
  }
  // Única fonte de verdade: intervalo de decorrido + leitura. now injetado (testes determinísticos).
  function onsetFrom(mode, data, now) {
    const DAY = 86400000, durMax = data.durMax || 80;
    let minDays, maxDays, pointLabel;
    if (mode === 'duration') {
      const raw = data.dur;
      if (raw == null || String(raw).trim() === '') return { weeks: undefined, min: undefined, max: undefined, reading: '', error: '' };
      const n = parseInt(raw, 10);
      if (!(n >= 1 && n <= durMax)) return { weeks: undefined, min: undefined, max: undefined, reading: '', error: 'Valor entre 1 e ' + durMax };
      const unit = data.unit || 'weeks', ud = ONSET_UNIT_DAYS[unit], nominal = n * ud, half = ud / 2;
      minDays = nominal - half; maxDays = nominal + half;
      pointLabel = n + ' ' + ONSET_UNIT_PT[unit];   // duração mostra a UNIDADE inserida
    } else {
      const yr = data.yr;
      if (!yr) return { weeks: undefined, min: undefined, max: undefined, reading: '', error: '' };
      let dEarly, dLate;
      if (data.dy && data.mo) { dEarly = new Date(yr, data.mo - 1, data.dy); dLate = new Date(dEarly); }
      else if (data.mo) { dEarly = new Date(yr, data.mo - 1, 1); dLate = new Date(yr, data.mo, 0); }
      else { dEarly = new Date(yr, 0, 1); dLate = new Date(yr, 11, 31); }
      if (dEarly > now) return { weeks: undefined, min: undefined, max: undefined, reading: '', error: 'Ano no futuro' };
      minDays = Math.max(0, (now - dLate) / DAY);
      maxDays = (now - dEarly) / DAY;
      pointLabel = fmtDecorrido((minDays + maxDays) / 2);   // data usa magnitude
    }
    const point = (minDays + maxDays) / 2, half = (maxDays - minDays) / 2;
    let reading = 'há ' + pointLabel;
    if (half >= 7) reading += ' (±' + fmtDecorrido(half) + ')';
    return { weeks: point / 7, min: minDays / 7, max: maxDays / 7, reading: reading, error: '' };
  }
  UBNIC._onsetFrom = onsetFrom; // exposto p/ testes

  /* ---------- Tema (light/dark) ---------- */
  UBNIC.setTheme = function (theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('ubnic-theme', theme); } catch (e) {}
    $$('[data-theme-toggle], .u-theme-toggle').forEach(b => { if (!b.querySelector('svg')) b.textContent = theme === 'dark' ? '☀' : '☾'; });
  };
  UBNIC.initTheme = function () {
    let t = 'light';
    try { t = localStorage.getItem('ubnic-theme') || 'light'; } catch (e) {}
    UBNIC.setTheme(t);
  };

  /* ---------- Copiar (texto ou rich-text) ---------- */
  UBNIC.copy = function (btn) {
    const sel = btn.getAttribute('data-copy');
    const target = sel ? $(sel) : null;
    if (!target) return;
    const text = target.innerText;
    const done = () => {
      btn.classList.add('is-copied');
      const orig = btn.getAttribute('data-label') || btn.textContent;
      if (!btn.getAttribute('data-label')) btn.setAttribute('data-label', orig);
      btn.textContent = '✓ Copiado';
      setTimeout(() => { btn.classList.remove('is-copied'); btn.textContent = btn.getAttribute('data-label'); }, 2000);
    };
    // Rich-text (text/html + text/plain) se data-copy-html, com fallback
    if (btn.hasAttribute('data-copy-html') && window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      const html = target.innerHTML;
      navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      })]).then(done).catch(() => fallbackCopy(text, done));
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  };
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- Tooltip "i": âncora consoante a posição ---------- */
  function openInfo(info) {
    $$('.u-info.open').forEach(o => { if (o !== info) o.classList.remove('open'); });
    const pop = $('.u-info-pop', info);
    if (pop) {
      pop.classList.remove('anchor-left', 'anchor-right', 'anchor-center');
      const r = info.getBoundingClientRect();
      const vw = window.innerWidth;
      if (r.left < 130) pop.classList.add('anchor-left');
      else if (vw - r.right < 130) pop.classList.add('anchor-right');
      else pop.classList.add('anchor-center');
    }
    info.classList.toggle('open');
  }

  /* ---------- Validação numérica hard/soft ---------- */
  function evalNumField(input) {
    const field = input.closest('.u-field');
    if (!field) return;
    const msg = $('.u-msg', field);
    const v = input.value.trim();
    const num = parseFloat(v);
    const hMin = attrNum(input, 'data-hard-min'), hMax = attrNum(input, 'data-hard-max');
    const sMin = attrNum(input, 'data-soft-min'), sMax = attrNum(input, 'data-soft-max');
    field.classList.remove('has-error', 'has-soft');
    let state = 'ok', text = '';
    if (v === '' || isNaN(num)) { state = 'empty'; }
    else if (hMin != null && num < hMin) { state = 'hard'; text = 'Não pode ser inferior a ' + hMin; }
    else if (hMax != null && num > hMax) { state = 'hard'; text = 'Não pode exceder ' + hMax; }
    else if ((sMin != null && num < sMin) || (sMax != null && num > sMax)) { state = 'soft'; text = 'Valor altamente improvável — confirme'; }
    if (state === 'hard') field.classList.add('has-error');
    if (state === 'soft') field.classList.add('has-soft');
    if (msg) {
      if (text) { msg.textContent = text; msg.className = 'u-msg ' + (state === 'soft' ? 'warn' : 'err'); }
      else if (state === 'ok' && input.hasAttribute('data-analyte')) { msg.innerHTML = UBNIC.evalAnalyte(input.getAttribute('data-analyte'), num, input.getAttribute('data-sex')); msg.className = 'u-msg'; }
      else { msg.textContent = ''; msg.className = 'u-msg'; }
    }
    // Botão de confirmação associado
    const confirmSel = input.getAttribute('data-confirm');
    if (confirmSel) refreshConfirm(confirmSel, field.closest('[data-num-group]') || document);
    fire(input, input.getAttribute('data-name') || input.id || 'num', v === '' ? null : num);
  }
  /* ---------- IMC: avaliação ao vivo ---------- */
  function evalImc(imcEl, changed) {
    if (!imcEl) return;
    const direct = imcEl.querySelector('[data-imc="direct"]');
    const weight = imcEl.querySelector('[data-imc="weight"]');
    const height = imcEl.querySelector('[data-imc="height"]');
    const cls = imcEl.parentElement && imcEl.parentElement.querySelector('.u-imc-class');
    if (!direct || !weight || !height) return;
    // Último campo alterado vence: editar o IMC directo apaga peso/altura (entrada manual);
    // alterar peso/altura calcula e preenche o IMC, que continua SEMPRE editável (sem read-only).
    if (changed === direct) { weight.value = ''; height.value = ''; }
    const R = { w: JSON.parse(imcEl.getAttribute('data-wrange') || '[20,300]'),
                h: JSON.parse(imcEl.getAttribute('data-hrange') || '[80,230]'),
                b: JSON.parse(imcEl.getAttribute('data-brange') || '[12,60]') };
    const r = imcFrom(direct.value, weight.value, height.value, R);
    if (r.mode === 'wh') {                              // peso/altura → reflectir o IMC calculado
      const dv = r.bmi != null ? String(r.bmi) : '';
      if (direct.value !== dv) direct.value = dv;       // só escreve quando muda (evita loop)
    }
    const c = UBNIC.imcClass(r.bmi);
    if (cls) { cls.textContent = c.text; cls.className = 'u-imc-class' + (c.level ? ' ' + c.level : ''); }
    fire(imcEl, imcEl.getAttribute('data-name') || 'imc', r.bmi == null ? null : r.bmi);
  }

  /* ---------- Berger: avaliação ao vivo (plausibilidade + banda clínica + RI combinada) ---------- */
  function evalBergerInput(input, b, kind) {
    const field = input.closest('.u-field'), msg = field && field.querySelector('.u-msg');
    const v = input.value.trim();
    input.classList.remove('lvl-green', 'lvl-amber', 'lvl-red');
    if (field) field.classList.remove('has-error', 'has-soft');
    if (v === '' || isNaN(parseFloat(v))) { if (msg) { msg.textContent = ''; msg.className = 'u-msg'; } return { num: null, ok: false }; }
    const num = parseFloat(v);
    if (num < b.hardMin || num > b.hardMax) {
      if (field) field.classList.add('has-error');
      if (msg) { msg.textContent = num < b.hardMin ? 'Não pode ser inferior a ' + b.hardMin + '°' : 'Não pode exceder ' + b.hardMax + '°'; msg.className = 'u-msg err'; }
      return { num: null, ok: false };
    }
    if (num < b.softMin || num > b.softMax) {
      if (field) field.classList.add('has-soft');
      if (msg) { msg.textContent = 'Valor altamente improvável — confirme'; msg.className = 'u-msg warn'; }
      return { num: num, ok: true };
    }
    input.classList.add('lvl-' + bergerInputLevel(kind, num));
    if (msg) { msg.textContent = ''; msg.className = 'u-msg'; }
    return { num: num, ok: true };
  }
  function evalBerger(el) {
    if (!el) return;
    const na = (el.querySelector('.u-berger-toggle input:checked') || {}).value === 'na';
    el.classList.toggle('u-isdef', !na);
    el.querySelectorAll('.u-berger-toggle .u-seg-btn').forEach(l => { const i = l.querySelector('input'); l.classList.toggle('sel', !!(i && i.checked)); });
    const body = el.querySelector('.u-berger-body');
    if (na) {
      if (body) body.setAttribute('hidden', '');
      // limpar estados de validação dos inputs escondidos (senão um erro hard bloqueava o "Continuar" em Sem TC)
      el.querySelectorAll('.u-berger-inputs .u-field').forEach(fld => fld.classList.remove('has-error', 'has-soft'));
      el.querySelectorAll('.u-berger-inputs .u-msg').forEach(m => { m.textContent = ''; m.className = 'u-msg'; });
      el.querySelectorAll('.u-berger-fem, .u-berger-tib').forEach(i => i.classList.remove('lvl-green', 'lvl-amber', 'lvl-red'));
      fire(el, el.getAttribute('data-name') || 'berger', null);
      return;
    }
    if (body) body.removeAttribute('hidden');
    const fem = evalBergerInput(el.querySelector('.u-berger-fem'), BERGER_BOUNDS.fem, 'fem');
    const tib = evalBergerInput(el.querySelector('.u-berger-tib'), BERGER_BOUNDS.tib, 'tib');
    const read = el.querySelector('.u-berger-read');
    const r = (fem.ok && tib.ok) ? bergerCombined(fem.num, tib.num) : { combined: null };
    if (read) {
      if (r.combined != null) { read.textContent = 'RI combinada ' + r.combined.toFixed(1) + '° · ' + r.label; read.className = 'u-berger-read ' + r.level; }
      else { read.textContent = ''; read.className = 'u-berger-read'; }
    }
    fire(el, el.getAttribute('data-name') || 'berger', r.combined == null ? null : r.combined);
  }

  /* ---------- Onset: avaliação ao vivo (modo exclusivo + leitura) ---------- */
  function evalOnset(onsetEl) {
    if (!onsetEl) return;
    const mode = (onsetEl.querySelector('.u-onset-radio input:checked') || {}).value || 'duration';
    onsetEl.querySelectorAll('.u-onset-row').forEach(r => r.classList.toggle('u-onset-off', r.getAttribute('data-mode-row') !== mode));
    // sincroniza o .sel da unidade (o segmented só ganha .sel por onChange do utilizador; o default/hidratação precisa disto)
    onsetEl.querySelectorAll('.u-onset-unit .u-seg-btn').forEach(l => { const i = l.querySelector('input'); l.classList.toggle('sel', !!(i && i.checked)); });
    const durMax = parseInt(onsetEl.getAttribute('data-durmax') || '80', 10);
    const dur = (onsetEl.querySelector('.u-onset-dur') || {}).value;
    const unit = (onsetEl.querySelector('.u-onset-unit input:checked') || {}).value || 'weeks';
    const dateEl = onsetEl.querySelector('.u-date'), df = dateEl ? readDateFields(dateEl) : {};
    const data = mode === 'duration' ? { dur: dur, unit: unit, durMax: durMax } : { yr: df.yr, mo: df.mo, dy: df.dy, durMax: durMax };
    const r = onsetFrom(mode, data, new Date());
    const read = onsetEl.querySelector('.u-onset-read');
    if (read) { read.textContent = r.error || r.reading; read.className = 'u-onset-read' + (r.error ? ' u-onset-err' : ''); }
    fire(onsetEl, onsetEl.getAttribute('data-name') || 'onset', r.weeks == null ? null : r.weeks);
  }

  /* ---------- Episódios prévios: avaliação ao vivo (toggle 1.º/recorrente + lista) ---------- */
  function evalEpisodes(epEl) {
    if (!epEl) return;
    const recurrent = (epEl.querySelector('.u-episodes-toggle input:checked') || {}).value === 'recurrent';
    epEl.classList.toggle('u-isdef', !recurrent);   // "1.º episódio" default → contorno
    epEl.querySelectorAll('.u-episodes-toggle .u-seg-btn').forEach(l => { const i = l.querySelector('input'); l.classList.toggle('sel', !!(i && i.checked)); });
    const list = epEl.querySelector('.u-episodes-list'), rows = epEl.querySelector('.u-ep-rows');
    if (recurrent) {
      list.removeAttribute('hidden');
      if (!rows.querySelector('.u-ep-row')) rows.insertAdjacentHTML('beforeend', epRowHtml(0));
    } else {
      list.setAttribute('hidden', '');
    }
    let allValid = true;
    $$('.u-ep-row', rows).forEach((row, i) => {
      row.querySelector('.u-ep-num').textContent = (i + 1) + '.';
      const yr = row.querySelector('[data-yr]'), mo = row.querySelector('[data-mo]');
      const df = readDateFields(row);
      setValid(yr, yr.value !== '' ? (df.yr != null) : null);
      setValid(mo, mo.value !== '' ? (df.mo != null) : null);
      const moBad = mo.value !== '' && df.mo == null;   // mês preenchido mas inválido
      if (df.yr == null || moBad) allValid = false;      // ano válido basta (precisão ao ano); mês opcional
    });
    const add = epEl.querySelector('.u-ep-add');
    if (add) { add.disabled = recurrent && !allValid; add.classList.toggle('is-disabled', add.disabled); }
    fire(epEl, epEl.getAttribute('data-name') || 'episodes', recurrent);
  }

  function refreshConfirm(sel, scope) {
    const btn = $(sel); if (!btn) return;
    const group = scope.querySelectorAll ? scope : document;
    const fields = $$('.u-field', group.querySelector ? group : document);
    let blocked = false;
    fields.forEach(f => {
      const inp = $('.u-input', f);
      if (!inp) return;
      if (inp.hasAttribute('required') && inp.value.trim() === '') blocked = true;
      if (f.classList.contains('has-error')) blocked = true;
    });
    btn.disabled = blocked; btn.classList.toggle('is-disabled', blocked);
  }
  function attrNum(el, a) { return el.hasAttribute(a) ? parseFloat(el.getAttribute(a)) : null; }

  /* ---------- Datas tricolor ---------- */
  function readDateFields(dateEl) {
    const yr = $('[data-yr]', dateEl), mo = $('[data-mo]', dateEl), dy = $('[data-dy]', dateEl);
    const now = new Date().getFullYear();
    const yv = yr ? parseInt(yr.value, 10) : NaN;
    const yrOk = !!(yr && yr.value !== '' && yv >= 1900 && yv <= now + 1);
    let mv = NaN, moOk = false;
    if (mo) { mv = parseInt(mo.value, 10); moOk = yrOk && mo.value !== '' && mv >= 1 && mv <= 12; }
    let dv = NaN, dyOk = false;
    if (dy) { dv = parseInt(dy.value, 10); const dim = moOk ? new Date(yv, mv, 0).getDate() : 31; dyOk = moOk && dy.value !== '' && dv >= 1 && dv <= dim; }
    return { yr: yrOk ? yv : null, mo: moOk ? mv : null, dy: dyOk ? dv : null };
  }
  UBNIC._readDateFields = readDateFields; // exposto p/ testes
  function evalDate(dateEl) {
    const yr = $('[data-yr]', dateEl), mo = $('[data-mo]', dateEl), dy = $('[data-dy]', dateEl);
    const f = readDateFields(dateEl);
    setValid(yr, yr && yr.value !== '' ? (f.yr != null) : null);
    setValid(mo, mo && mo.value !== '' ? (f.mo != null) : null);
    setValid(dy, dy && dy.value !== '' ? (f.dy != null) : null);
    fire(dateEl, dateEl.getAttribute('data-name') || 'date', { yr: f.yr, mo: f.mo, dy: f.dy });
  }
  function setValid(input, ok) {
    if (!input) return;
    input.classList.remove('valid', 'invalid');
    if (ok === true) input.classList.add('valid');
    else if (ok === false) input.classList.add('invalid');
  }

  /* ---------- Multi-select: exclusões e valores "none" ---------- */
  function handleMulti(multi, changed) {
    const isNone = changed.hasAttribute('data-none');
    const boxes = $$('input[type="checkbox"]', multi);
    if (changed.checked) {
      if (isNone) { boxes.forEach(b => { if (b !== changed) b.checked = false; }); }
      else { boxes.forEach(b => { if (b.hasAttribute('data-none')) b.checked = false; }); }
      // exclusões par-a-par via data-exclude="val1 val2"
      const exTokens = (changed.getAttribute('data-exclude') || '').split(/\s+/).filter(Boolean);
      if (exTokens.length) boxes.forEach(b => { if (exTokens.includes(b.value)) b.checked = false; });
    }
    // vazio → "Nenhuma" (data-none) volta a marcar-se (à la DEFAULTS_MULTI ['none'])
    const noneBox = boxes.find(b => b.hasAttribute('data-none'));
    if (noneBox && !boxes.some(b => b.checked)) {
      noneBox.checked = true;
      const chip = noneBox.closest('.u-mchip');
      if (chip) { chip.classList.remove('pulse'); void chip.offsetWidth; chip.classList.add('pulse'); }
    }
    const vals = boxes.filter(b => b.checked).map(b => b.value);
    multi.dataset.value = JSON.stringify(vals);
    fire(multi, multi.getAttribute('data-name') || 'multi', vals);
  }

  function evalGate(gateEl) {
    if (!gateEl) return;
    const seg = gateEl.querySelector('.u-mgate-seg');
    const status = (seg.querySelector('input:checked') || {}).value;
    const isActive = status === gateEl.getAttribute('data-active');
    seg.querySelectorAll('.u-seg-btn').forEach(l => { const i = l.querySelector('input'); l.classList.toggle('sel', !!(i && i.checked)); });
    gateEl.classList.toggle('u-mgate-on', isActive);
    const chk = seg.querySelector('input:checked'), btn = chk && chk.closest('.u-seg-btn');
    gateEl.classList.toggle('u-isdef', !isActive && !(btn && btn.hasAttribute('data-finding')));   // baseline (NR/sem dor) → segmented em contorno; achado/ativo → teal cheio
    if (!isActive) { gateEl.querySelectorAll('.u-mgate-grid input[type=checkbox]').forEach(c => { c.checked = false; }); }
    fire(gateEl, gateEl.getAttribute('data-name') || 'gate', status);
  }

  /* ---------- Delegação central ---------- */
  function onClick(e) {
    const gGrid = e.target.closest('.u-mgate-grid');
    if (gGrid) {
      const ge = gGrid.closest('.u-mgate');
      if (ge && !ge.classList.contains('u-mgate-on')) {
        const act = ge.querySelector('.u-mgate-seg input[value="' + ge.getAttribute('data-active') + '"]');
        if (act) { act.checked = true; }
        evalGate(ge);
        const grid = ge.querySelector('.u-mgate-grid'); grid.classList.remove('pulse'); void grid.offsetWidth; grid.classList.add('pulse');
        return;
      }
    }
    const epAdd = e.target.closest('.u-ep-add');
    if (epAdd) {
      if (!epAdd.disabled) {
        const epEl = epAdd.closest('.u-episodes'), rows = epEl.querySelector('.u-ep-rows');
        rows.insertAdjacentHTML('beforeend', epRowHtml(rows.querySelectorAll('.u-ep-row').length));
        evalEpisodes(epEl);
        const yr = rows.querySelector('.u-ep-row:last-child .u-ep-yr'); if (yr) yr.focus();
      }
      return;
    }
    const epRem = e.target.closest('.u-ep-remove');
    if (epRem) {
      const epEl = epRem.closest('.u-episodes'), rows = epEl.querySelector('.u-ep-rows'), row = epRem.closest('.u-ep-row');
      if (rows.querySelectorAll('.u-ep-row').length <= 1) { const first = epEl.querySelector('.u-episodes-toggle input[value="first"]'); if (first) first.checked = true; }
      row.remove();
      evalEpisodes(epEl);
      return;
    }
    // Likert (u-seg passou a radio nativo → tratado em onChange)
    const seg = e.target.closest('.u-likert-btn');
    if (seg) {
      const group = seg.closest('.u-likert');
      $$('.u-likert-btn', group).forEach(b => b.classList.remove('sel'));
      seg.classList.add('sel');
      group.dataset.value = seg.getAttribute('data-val') || seg.textContent.trim();
      fire(group, group.getAttribute('data-name') || 'seg', group.dataset.value);
      return;
    }
    // Chip
    const chip = e.target.closest('.u-chip');
    if (chip) {
      chip.classList.toggle('on');
      fire(chip, chip.getAttribute('data-val') || 'chip', chip.classList.contains('on'));
      return;
    }
    // Copiar
    const cp = e.target.closest('.u-btn-copy');
    if (cp && cp.hasAttribute('data-copy')) { UBNIC.copy(cp); return; }
    // Tema
    const tt = e.target.closest('[data-theme-toggle], .u-theme-toggle');
    if (tt) { UBNIC.setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); return; }
    // Tooltip
    // Onset: clicar em qualquer ponto da linha inativa escolhe esse modo (a linha toda é alvo)
    const onsetOff = e.target.closest('.u-onset-row.u-onset-off');
    if (onsetOff) {
      const mr = onsetOff.querySelector('.u-onset-radio input');
      if (mr && !mr.checked) { mr.checked = true; const oe = onsetOff.closest('.u-onset'); if (oe) evalOnset(oe); }
      const first = onsetOff.querySelector('.u-onset-dur, [data-yr]'); if (first) first.focus(); // pronto a preencher
      return;
    }
    const ico = e.target.closest('.u-info > i');
    if (ico) { e.preventDefault(); e.stopPropagation(); openInfo(ico.closest('.u-info')); return; } // preventDefault: "i" dentro do label do segmento não seleciona o grau
    // Clique fora fecha tooltips
    if (!e.target.closest('.u-info-pop')) $$('.u-info.open').forEach(o => o.classList.remove('open'));
  }

  function onInput(e) {
    if (e.target.matches('.u-input[data-hard-min], .u-input[data-hard-max], .u-input[data-soft-min], .u-input[data-soft-max], .u-input[data-analyte]')) {
      evalNumField(e.target);
    }
    if (e.target.matches('.u-imc-in')) { evalImc(e.target.closest('.u-imc'), e.target); return; }
    const bIn = e.target.closest('.u-berger');
    if (bIn && e.target.matches('.u-berger-fem, .u-berger-tib')) { evalBerger(bIn); return; }
    const dateCell = e.target.closest('.u-date');
    if (dateCell && e.target.matches('[data-yr],[data-mo],[data-dy]')) evalDate(dateCell);
    // Nota: nos inputs de data o evalDate (tricolor) e o evalOnset correm ambos — dois u:change por tecla, mas
    // idempotente (o estado é reconstruído do DOM). NÃO remover o evalDate daqui: perde-se o pintar tricolor.
    const onsetIn = e.target.closest('.u-onset');
    if (onsetIn && (e.target.matches('.u-onset-dur') || e.target.matches('[data-yr],[data-mo],[data-dy]'))) evalOnset(onsetIn);
    const epIn = e.target.closest('.u-episodes');
    if (epIn && e.target.matches('.u-ep-yr, .u-ep-mo')) evalEpisodes(epIn);
  }

  function onChange(e) {
    const gSeg = e.target.closest('.u-mgate');
    if (gSeg && e.target.matches('.u-mgate-seg input')) { evalGate(gSeg); return; }
    if (e.target.matches('.u-multi input[type="checkbox"]')) handleMulti(e.target.closest('.u-multi'), e.target);
    // Radios de u-radio: emitir u:change uniforme (consumido pelo u-stack)
    if (e.target.matches('.u-radio input[type="radio"]')) {
      const group = e.target.closest('.u-radio');
      group.dataset.value = e.target.value;
      fire(group, group.getAttribute('data-name') || 'radio', e.target.value);
    }
    if (e.target.matches('.u-seg input[type="radio"]')) {
      const group = e.target.closest('.u-seg');
      group.querySelectorAll('.u-seg-btn').forEach(l => l.classList.toggle('sel', l.querySelector('input') === e.target));
      fire(group, group.getAttribute('data-name') || 'seg', e.target.value);
    }
    // Onset: alternar modo (radio) ou unidade (segmented)
    const onsetCh = e.target.closest('.u-onset');
    if (onsetCh && e.target.matches('.u-onset-radio input, .u-onset-unit input')) evalOnset(onsetCh);
    const epCh = e.target.closest('.u-episodes');
    if (epCh && e.target.matches('.u-episodes-toggle input')) evalEpisodes(epCh);
    const bCh = e.target.closest('.u-berger');
    if (bCh && e.target.matches('.u-berger-toggle input')) evalBerger(bCh);
  }

  function onKeydown(e) {
    // Enter avança entre campos de data
    if (e.key === 'Enter') {
      const cell = e.target.closest('.u-date');
      if (cell && e.target.matches('[data-yr],[data-mo],[data-dy]')) {
        e.preventDefault();
        const inputs = $$('[data-yr],[data-mo],[data-dy]', cell);
        const i = inputs.indexOf(e.target);
        if (i > -1 && i < inputs.length - 1) inputs[i + 1].focus();
      }
    }
  }

  /* ============================================================
     CLÍNICOS (Fase 2)
     ============================================================ */

  /* ---------- Avaliação clínica de analitos ---------- */
  UBNIC.ANALYTES = {
    pcr:        { name: 'PCR', unit: 'mg/L', ref: { high: 5 }, decision: { high: 'Elevada' } },
    wbc:        { name: 'Leucócitos', unit: '×10⁹/L', ref: { low: 4.0, high: 11.0 }, decision: { high: 'Leucocitose', very_high: { threshold: 15.0, note: 'Leucocitose marcada' }, low: 'Leucopenia' } },
    hb:         { name: 'Hemoglobina', unit: 'g/dL', ref: { low_m: 13.0, high_m: 17.5, low_f: 12.0, high_f: 15.5 }, decision: { low: 'Anemia' } },
    calcio:     { name: 'Cálcio', unit: 'mg/dL', ref: { low: 8.5, high: 10.5 }, decision: { low: 'Hipocalcemia', high: 'Hipercalcemia' } },
    vitamina_d: { name: 'Vitamina D', unit: 'ng/mL', ref: { low: 30, vlow: 20 }, decision: { low: 'Insuficiência (20-30)', vlow: 'Deficiência (<20)' } },
    acido_urico:{ name: 'Ácido úrico', unit: 'mg/dL', ref: { high_m: 7.0, high_f: 6.0 }, decision: { high: 'Hiperuricemia' } },
    hba1c:      { name: 'HbA1c', unit: '%', ref: { high: 5.7 }, decision: { ranges: [
      { max: 5.7, note: 'Normal', color: 'green' },
      { max: 7.0, note: 'Bom controlo', color: 'green' },
      { max: 8.0, note: 'Aceitável p/ cirurgia', color: 'amber' },
      { above: 8.0, note: 'CI relativa p/ electivo', color: 'red' }
    ] } }
  };
  UBNIC.evalAnalyte = function (key, val, sex) {
    const a = UBNIC.ANALYTES[key]; if (!a || !a.decision) return '';
    const ref = a.ref || {};
    const span = (c, t) => '<span style="color:var(--' + c + ');font-weight:600">' + t + '</span>';
    const hi = ref.high != null ? ref.high : (sex === 'F' ? ref.high_f : ref.high_m);
    const lo = ref.low != null ? ref.low : (sex === 'F' ? ref.low_f : ref.low_m);
    if (a.decision.ranges) {
      for (const r of a.decision.ranges) {
        if (r.max != null && val <= r.max) return span(r.color, r.note);
        if (r.above != null && val > r.above) return span(r.color, r.note);
      }
      return span('green', 'Normal');
    }
    if (a.decision.very_high && val >= a.decision.very_high.threshold) return span('red', a.decision.very_high.note);
    if (ref.vlow != null && val < ref.vlow && a.decision.vlow) return span('red', '↓ ' + a.decision.vlow);
    if (hi != null && val > hi && a.decision.high) return span('amber', '↑ ' + a.decision.high);
    if (lo != null && val < lo && a.decision.low) return span('amber', '↓ ' + a.decision.low);
    let rs = (lo != null && hi != null) ? lo + '–' + hi : (hi != null ? '<' + hi : (lo != null ? '>' + lo : ''));
    return '<span style="color:var(--green);opacity:.75">Normal' + (rs ? ' (' + rs + ')' : '') + '</span>';
  };

  /* ---------- Questionário pontuado (PROM) ---------- */
  UBNIC.quiz = function (target, opts) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    const scale = opts.scale, items = opts.items, max = opts.max != null ? opts.max : '';
    let h = '<div class="u-quiz">';
    items.forEach((it, i) => {
      h += '<div><div class="u-quiz-q-label">' + (i + 1) + '. ' + it.label + '</div><div class="u-likert" data-quiz-q="' + i + '">';
      scale.forEach(s => { h += '<button class="u-likert-btn" data-val="' + s.v + '">' + s.l + '</button>'; });
      h += '</div></div>';
    });
    h += '<div class="u-quiz-score"><span class="u-quiz-score-v">—</span><span class="u-quiz-score-max">/ ' + max + '</span><span class="u-quiz-score-class"></span></div></div>';
    el.innerHTML = h;
    el._quizOpts = opts;
    el.addEventListener('u:change', () => updateQuiz(el));
  };
  function updateQuiz(el) {
    const opts = el._quizOpts; if (!opts) return;
    const groups = $$('.u-likert', el);
    let sum = 0, answered = 0;
    groups.forEach(g => { const sel = $('.u-likert-btn.sel', g); if (sel) { sum += parseFloat(sel.getAttribute('data-val')) || 0; answered++; } });
    const v = $('.u-quiz-score-v', el), cl = $('.u-quiz-score-class', el);
    v.textContent = sum;
    if (answered === groups.length && opts.classify) {
      let hit = null;
      for (const r of opts.classify) { if (sum <= (r.max != null ? r.max : Infinity)) { hit = r; break; } }
      cl.innerHTML = hit ? '<span class="u-tag ' + (hit.tone || 'teal') + '">' + hit.label + '</span>' : '';
    } else { cl.innerHTML = answered < groups.length ? '<span style="color:var(--t4);font-size:11px">' + answered + '/' + groups.length + '</span>' : ''; }
    el.dispatchEvent(new CustomEvent('u:quiz', { bubbles: true, detail: { score: sum, complete: answered === groups.length } }));
  }

  /* ---------- Plano em escada (protocolo escalonado) ---------- */
  UBNIC.plan = function (target, data) {
    const el = typeof target === 'string' ? $(target) : target; if (!el || !data) return;
    const pills = (arr) => (arr || []).map(p => '<span class="u-pill ' + (p.tone || 'teal') + '">' + p.text + '</span>').join(' ');
    let h = '<div class="u-plan">';
    (data.lines || []).forEach(line => {
      h += '<div class="u-line-header"><div class="u-line-num ' + (line.tone || 'teal') + '">' + (line.num != null ? line.num : '') + '</div>'
        + '<div class="u-line-title">' + line.title + (line.sub ? ' <small>' + line.sub + '</small>' : '') + '</div></div>';
      (line.subs || []).forEach(sub => {
        h += '<details class="u-sub"' + (sub.open ? ' open' : '') + '><summary>'
          + (sub.icon ? '<span class="u-sub-ico">' + sub.icon + '</span>' : '') + '<span>' + sub.title + '</span>' + pills(sub.pills)
          + '</summary><div class="u-sub-body">' + (sub.detail || '') + '</div></details>';
      });
      if (line.failBar) {
        const fb = line.failBar;
        h += '<div class="u-fail-bar ' + (fb.tone === 'red' ? 'red' : '') + '"><div class="u-fail-bar-title">' + (fb.title || 'Se falha — escalar se') + '</div>'
          + (fb.items || []).map(i => '• ' + i).join('<br>') + '</div>';
      }
    });
    h += '</div>';
    el.innerHTML = h;
  };

  /* ---------- Multi-select agrupado ---------- */
  UBNIC.groupedMulti = function (target, opts) {
    const el = typeof target === 'string' ? $(target) : target; if (!el || !opts) return;
    const groups = opts.groups || [], options = opts.options || [];
    let h = '<div class="u-multi" data-name="' + (opts.name || 'grouped') + '">';
    groups.forEach(grp => {
      const opts2 = options.filter(o => o.g === grp.id);
      if (!opts2.length) return;
      h += '<div class="u-multi-group"><div class="u-multi-group-label">' + grp.label + '</div>';
      opts2.forEach(o => {
        h += '<label class="u-mopt"><input type="checkbox" value="' + o.v + '"' + (o.none ? ' data-none' : '')
          + ((opts.defaultValue || []).includes(o.v) ? ' checked' : '') + '><span class="u-check"></span>'
          + '<span class="u-opt-txt"><span class="u-opt-l">' + o.l + '</span>' + (o.d ? '<span class="u-opt-d">' + o.d + '</span>' : '') + '</span></label>';
      });
      h += '</div>';
    });
    h += '</div>';
    el.innerHTML = h;
  };

  /* ---------- Goniómetro ROM (SVG interativo) ---------- */
  let romSeq = 0;
  function romNum(v, d) { const n = parseFloat(v); return isNaN(n) ? d : n; }
  function initRom(container) {
    if (container.dataset.uInit) return;
    container.dataset.uInit = '1';
    const uid = 'urom' + (romSeq++);
    const ext0 = romNum(container.dataset.ext, 0), flex0 = romNum(container.dataset.flex, 140);
    const G = (s) => 'url(#' + uid + s + ')';
    container.innerHTML =
      '<div class="u-rom-wrap" id="' + uid + 'wrap"><svg id="' + uid + 'svg" viewBox="0 0 580 420" xmlns="http://www.w3.org/2000/svg">'
      + '<defs><linearGradient id="' + uid + 'sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f5d0b0"/><stop offset="100%" stop-color="#e8b896"/></linearGradient>'
      + '<linearGradient id="' + uid + 'sd" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d4a882"/><stop offset="100%" stop-color="#c89b76"/></linearGradient>'
      + '<linearGradient id="' + uid + 'ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--teal)" stop-opacity="0.12"/><stop offset="100%" stop-color="var(--teal)" stop-opacity="0.03"/></linearGradient></defs>'
      + '<line x1="80" y1="195" x2="520" y2="195" stroke="var(--t4)" stroke-width="1" stroke-dasharray="6,4" opacity="0.5"/>'
      + '<text x="528" y="199" fill="var(--t4)" font-size="11" font-family="var(--font-mono)">0°</text>'
      + '<path id="' + uid + 'arc" fill="' + G('ag') + '"/>'
      + '<g id="' + uid + 'ticks" opacity="0.3"></g>'
      + '<line id="' + uid + 'eline" stroke="#e67e22" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>'
      + '<line id="' + uid + 'fline" stroke="var(--teal)" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>'
      + '<path d="M80,175 Q120,168 200,172 L280,182 Q290,186 290,195 Q290,204 280,208 L200,218 Q120,222 80,215 Z" fill="' + G('sg') + '" stroke="' + G('sd') + '" stroke-width="1.5"/>'
      + '<circle cx="290" cy="195" r="14" fill="var(--s3)" stroke="var(--teal)" stroke-width="2" opacity="0.8"/><circle cx="290" cy="195" r="4" fill="var(--teal)" opacity="0.5"/>'
      + '<g id="' + uid + 'eleg" style="cursor:grab"><path id="' + uid + 'eshin" fill="' + G('sg') + '" stroke="' + G('sd') + '" stroke-width="1.5"/><path id="' + uid + 'efoot" fill="' + G('sg') + '" stroke="' + G('sd') + '" stroke-width="1.2"/><circle id="' + uid + 'eh" r="16" fill="#e67e22" opacity="0.15" stroke="#e67e22" stroke-width="2"/><circle id="' + uid + 'ed" r="5" fill="#e67e22"/></g>'
      + '<g id="' + uid + 'fleg" class="u-rom-pulse" style="cursor:grab"><path id="' + uid + 'fshin" fill="' + G('sg') + '" stroke="' + G('sd') + '" stroke-width="1.5"/><path id="' + uid + 'ffoot" fill="' + G('sg') + '" stroke="' + G('sd') + '" stroke-width="1.2"/><circle id="' + uid + 'fh" r="16" fill="var(--teal)" opacity="0.15" stroke="var(--teal)" stroke-width="2"/><circle id="' + uid + 'fd" r="5" fill="var(--teal)"/></g>'
      + '<text id="' + uid + 'elbl" font-family="var(--font-mono)" font-size="13" font-weight="600" fill="#e67e22"></text>'
      + '<text id="' + uid + 'flbl" font-family="var(--font-mono)" font-size="13" font-weight="600" fill="var(--teal)"></text>'
      + '</svg></div>'
      + '<div class="u-rom-readouts"><div class="u-rom-ro ext"><div class="u-rom-ro-l">Extensão</div><div class="u-rom-ro-v" id="' + uid + 'ev">0°</div></div>'
      + '<div class="u-rom-ro flex"><div class="u-rom-ro-l">Flexão</div><div class="u-rom-ro-v" id="' + uid + 'fv">140°</div></div>'
      + '<div class="u-rom-ro arc"><div class="u-rom-ro-l">Arco</div><div class="u-rom-ro-v" id="' + uid + 'av">140°</div></div></div>'
      + '<div class="u-rom-inputs"><div class="u-rom-ig"><label>Extensão</label><input type="number" id="' + uid + 'ei" min="-30" max="90" step="5"><span class="u">°</span></div>'
      + '<div class="u-rom-ig"><label>Flexão</label><input type="number" id="' + uid + 'fi" min="0" max="155" step="5"><span class="u">°</span></div></div>'
      + '<div class="u-rom-note" id="' + uid + 'cls"></div>';
    romEngine(container, uid, ext0, flex0);
  }
  function romEngine(container, uid, ext, flex) {
    const KN = { x: 290, y: 195 }, SL = 190, SNAP = 5, EMIN = -30, EMAX = 90, FMIN = 0, FMAX = 155;
    let drag = null, pulsed = false;
    const svg = document.getElementById(uid + 'svg'), wrap = document.getElementById(uid + 'wrap');
    if (!svg || !wrap) return;
    const el = (s) => document.getElementById(uid + s);
    const d2r = d => d * Math.PI / 180, r2d = r => r * 180 / Math.PI;
    const sn = v => Math.round(v / SNAP) * SNAP, cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const se = deg => ({ x: KN.x + Math.cos(d2r(deg)) * SL, y: KN.y + Math.sin(d2r(deg)) * SL });
    function shin(deg) {
      const r = d2r(deg), dx = Math.cos(r), dy = Math.sin(r), px = -dy, py = dx, wK = 22, wA = 14, mid = .35, b = 4;
      return 'M' + (KN.x + px * wK) + ',' + (KN.y + py * wK) + ' Q' + (KN.x + dx * SL * mid + px * (wK + b)) + ',' + (KN.y + dy * SL * mid + py * (wK + b))
        + ' ' + (KN.x + dx * SL + px * wA) + ',' + (KN.y + dy * SL + py * wA) + ' L' + (KN.x + dx * SL - px * wA) + ',' + (KN.y + dy * SL - py * wA)
        + ' Q' + (KN.x + dx * SL * mid - px * (wK + b)) + ',' + (KN.y + dy * SL * mid - py * (wK + b)) + ' ' + (KN.x - px * wK) + ',' + (KN.y - py * wK) + ' Z';
    }
    function foot(deg) {
      const ax = KN.x + Math.cos(d2r(deg)) * SL, ay = KN.y + Math.sin(d2r(deg)) * SL;
      const fr = d2r(deg - 90), fdx = Math.cos(fr), fdy = Math.sin(fr), fpx = -fdy, fpy = fdx;
      const hx = ax - fdx * 8, hy = ay - fdy * 8, tx = ax + fdx * 45, ty = ay + fdy * 45, w = 9;
      return 'M' + (hx + fpx * w) + ',' + (hy + fpy * w) + ' Q' + (ax + fpx * (w + 2)) + ',' + (ay + fpy * (w + 2)) + ' ' + (tx + fpx * (w - 2)) + ',' + (ty + fpy * (w - 2))
        + ' L' + (tx - fpx * (w - 4)) + ',' + (ty - fpy * (w - 4)) + ' Q' + (ax - fpx * w) + ',' + (ay - fpy * w) + ' ' + (hx - fpx * w) + ',' + (hy - fpy * w) + ' Z';
    }
    function arc(s, e, rad) {
      if (Math.abs(e - s) < 1) return '';
      const sx = KN.x + Math.cos(d2r(s)) * rad, sy = KN.y + Math.sin(d2r(s)) * rad, ex = KN.x + Math.cos(d2r(e)) * rad, ey = KN.y + Math.sin(d2r(e)) * rad;
      return 'M' + KN.x + ',' + KN.y + ' L' + sx + ',' + sy + ' A' + rad + ',' + rad + ' 0 ' + ((e - s) > 180 ? 1 : 0) + ' 1 ' + ex + ',' + ey + ' Z';
    }
    let th = '';
    for (let d = -30; d <= 155; d += 5) {
      const tr = d2r(d), maj = (d % 15 === 0), r1 = maj ? 55 : 62, r2 = 68;
      th += '<line x1="' + (KN.x + Math.cos(tr) * r1) + '" y1="' + (KN.y + Math.sin(tr) * r1) + '" x2="' + (KN.x + Math.cos(tr) * r2) + '" y2="' + (KN.y + Math.sin(tr) * r2) + '" stroke="var(--t4)" stroke-width="' + (maj ? 1 : .5) + '"/>';
      if (maj && d >= 0 && d <= 150) th += '<text x="' + (KN.x + Math.cos(tr) * 47) + '" y="' + (KN.y + Math.sin(tr) * 47 + 3) + '" text-anchor="middle" font-family="var(--font-mono)" font-size="8" fill="var(--t4)">' + d + '</text>';
    }
    el('ticks').innerHTML = th;
    function classify(e, f, node) {
      const a = f - e; let notes = [], c = 'normal';
      if (e < 0) notes.push('<strong>Recurvatum ' + e + '°</strong> — hiperlaxidez ou lesão LCP/canto posterolateral.');
      else if (e > 0) {
        if (e <= 5) notes.push('Défice extensão ligeiro (+' + e + '°).');
        else if (e <= 15) { notes.push('<strong>Défice extensão moderado (+' + e + '°)</strong> — contractura em flexão.'); c = 'mild'; }
        else { notes.push('<strong>Défice extensão severo (+' + e + '°)</strong> — contractura significativa.'); c = 'moderate'; }
      }
      if (f >= 130) { }
      else if (f >= 110) { notes.push('Flexão ligeiramente limitada (' + f + '°).'); if (c === 'normal') c = 'mild'; }
      else if (f >= 90) { notes.push('<strong>Flexão moderadamente limitada (' + f + '°)</strong>.'); c = 'moderate'; }
      else { notes.push('<strong>Flexão severamente limitada (' + f + '°)</strong>.'); c = 'severe'; }
      if (a >= 120) { if (!notes.length) notes.push('Arco funcional ' + e + '°–' + f + '° — <strong>Normal</strong>.'); }
      else if (a >= 90) notes.push('Arco total ' + a + '° — funcional para maioria das AVD.');
      else { notes.push('<strong>Arco total ' + a + '°</strong> — limitação funcional significativa.'); c = 'severe'; }
      if (f < 90) notes.push('⚠ Abaixo do limiar para escadas (90°).');
      if (f < 105) notes.push('⚠ Limitação sentar/levantar cadeira (~105°).');
      if (f < 115) notes.push('⚠ Insuficiente para agachamento profundo (>115°).');
      node.className = 'u-rom-note ' + c; node.innerHTML = notes.join('<br>');
    }
    function draw(fireEv) {
      const ee = se(ext), fe = se(flex);
      el('eline').setAttribute('x1', KN.x); el('eline').setAttribute('y1', KN.y); el('eline').setAttribute('x2', ee.x); el('eline').setAttribute('y2', ee.y);
      el('fline').setAttribute('x1', KN.x); el('fline').setAttribute('y1', KN.y); el('fline').setAttribute('x2', fe.x); el('fline').setAttribute('y2', fe.y);
      el('eshin').setAttribute('d', shin(ext)); el('efoot').setAttribute('d', foot(ext));
      el('eh').setAttribute('cx', ee.x); el('eh').setAttribute('cy', ee.y); el('ed').setAttribute('cx', ee.x); el('ed').setAttribute('cy', ee.y);
      el('fshin').setAttribute('d', shin(flex)); el('ffoot').setAttribute('d', foot(flex));
      el('fh').setAttribute('cx', fe.x); el('fh').setAttribute('cy', fe.y); el('fd').setAttribute('cx', fe.x); el('fd').setAttribute('cy', fe.y);
      el('arc').setAttribute('d', arc(ext, flex, 80));
      const elx = KN.x + Math.cos(d2r(ext)) * 100, ely = KN.y + Math.sin(d2r(ext)) * 100;
      el('elbl').setAttribute('x', elx); el('elbl').setAttribute('y', ely + 4); el('elbl').setAttribute('text-anchor', 'middle');
      el('elbl').textContent = ext === 0 ? '0°' : (ext < 0 ? ext + '°' : '+' + ext + '°');
      const flx = KN.x + Math.cos(d2r(flex)) * 100, fly = KN.y + Math.sin(d2r(flex)) * 100;
      el('flbl').setAttribute('x', flx); el('flbl').setAttribute('y', fly + 4); el('flbl').setAttribute('text-anchor', 'middle'); el('flbl').textContent = flex + '°';
      el('ev').textContent = ext === 0 ? '0°' : (ext < 0 ? ext + '°' : '+' + ext + '°');
      el('fv').textContent = flex + '°'; el('av').textContent = (flex - ext) + '°';
      el('ei').value = ext; el('fi').value = flex;
      classify(ext, flex, el('cls'));
      if (fireEv) fire(container, container.getAttribute('data-name') || 'rom', { ext: ext, flex: flex, arc: flex - ext });
    }
    function svgPt(ev) { const pt = svg.createSVGPoint(), t = ev.touches ? ev.touches[0] : ev; pt.x = t.clientX; pt.y = t.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
    function onDown(ev) {
      ev.preventDefault(); const pt = svgPt(ev), ee = se(ext), fe = se(flex);
      const de = Math.hypot(pt.x - ee.x, pt.y - ee.y), df = Math.hypot(pt.x - fe.x, pt.y - fe.y);
      if (de < 45 && de < df) drag = 'ext'; else if (df < 45) drag = 'flex'; else { drag = null; return; }
      if (!pulsed) { pulsed = true; el('fleg').classList.remove('u-rom-pulse'); }
      wrap.style.cursor = 'grabbing';
    }
    function onMove(ev) {
      if (!drag) return; ev.preventDefault();
      const pt = svgPt(ev); let a = sn(r2d(Math.atan2(pt.y - KN.y, pt.x - KN.x)));
      if (drag === 'ext') ext = cl(a, EMIN, Math.min(EMAX, flex - 5)); else flex = cl(a, Math.max(FMIN, ext + 5), FMAX);
      draw(false);
    }
    function onUp() { if (drag) { drag = null; wrap.style.cursor = 'default'; draw(true); } }
    wrap.addEventListener('mousedown', onDown); wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseup', onUp); wrap.addEventListener('mouseleave', onUp);
    wrap.addEventListener('touchstart', onDown, { passive: false }); wrap.addEventListener('touchmove', onMove, { passive: false }); wrap.addEventListener('touchend', onUp);
    el('ei').addEventListener('change', function () { let v = sn(cl(parseInt(this.value) || 0, EMIN, EMAX)); if (v >= flex) v = flex - 5; ext = v; draw(true); });
    el('fi').addEventListener('change', function () { let v = sn(cl(parseInt(this.value) || 140, FMIN, FMAX)); if (v <= ext) v = ext + 5; flex = v; draw(true); });
    draw(false);
  }
  UBNIC.rom = function (target, opts) {
    const el = typeof target === 'string' ? $(target) : target; if (!el) return;
    if (opts) { if (opts.ext != null) el.dataset.ext = opts.ext; if (opts.flex != null) el.dataset.flex = opts.flex; }
    initRom(el);
  };

  function romVal(romEl, which) { const node = romEl.querySelector('.u-rom-ro.' + which + ' .u-rom-ro-v'); return node ? (parseInt(node.textContent.replace('−', '-'), 10) || 0) : 0; }
  function updateRomCompare(el) {
    const aff = el.querySelector('.u-rom[data-rom-aff]'), con = el.querySelector('.u-rom[data-rom-con]');
    const note = $('.u-rom-compare', el); if (!aff || !con || !note) return;
    const dExt = romVal(aff, 'ext') - romVal(con, 'ext');
    const dFlex = romVal(aff, 'flex') - romVal(con, 'flex');
    const parts = [];
    if (Math.abs(dExt) >= 5) parts.push('Δ Extensão ' + (dExt > 0 ? '+' : '') + dExt + '°');
    if (Math.abs(dFlex) >= 10) parts.push('Δ Flexão ' + (dFlex > 0 ? '+' : '') + dFlex + '°');
    if (parts.length) { note.className = 'u-rom-compare u-alert warn'; note.innerHTML = '<span class="u-alert-ico">⚠</span><div>Afectado vs contralateral: ' + parts.join(' · ') + '</div>'; }
    else { note.className = 'u-rom-compare u-alert ok'; note.innerHTML = '<span class="u-alert-ico">✓</span><div>ROM simétrico (sem diferença significativa).</div>'; }
  }
  UBNIC.romDual = function (target, opts) {
    opts = opts || {};
    const el = typeof target === 'string' ? $(target) : target; if (!el) return;
    const rightAff = opts.affectedSide !== 'left';   // afetado é o joelho direito (default)?
    const dv = (v, d) => v != null ? v : d;
    // Posição FIXA por lado anatómico: joelho DIREITO sempre à esquerda (pé à esquerda, não espelhado);
    // joelho ESQUERDO sempre à direita (espelhado). Só os rótulos/valores mudam com o lado afetado.
    const right = { ext: dv(rightAff ? opts.affExt : opts.contraExt, 0), flex: dv(rightAff ? opts.affFlex : opts.contraFlex, 140),
      cap: 'Joelho Direito (' + (rightAff ? 'afectado' : 'contralateral') + ')', aff: rightAff, name: 'rom-right', mirror: true };
    const left = { ext: dv(rightAff ? opts.contraExt : opts.affExt, 0), flex: dv(rightAff ? opts.contraFlex : opts.affFlex, 140),
      cap: 'Joelho Esquerdo (' + (rightAff ? 'contralateral' : 'afectado') + ')', aff: !rightAff, name: 'rom-left', mirror: false };
    const single = (k) =>
      '<div class="u-rom-single' + (k.mirror ? ' u-rom-mirror' : '') + '"><div class="u-rom-cap">' + k.cap + '</div>'
      + '<div class="u-rom" data-ext="' + k.ext + '" data-flex="' + k.flex + '" data-name="' + k.name + '"' + (k.aff ? ' data-rom-aff' : ' data-rom-con') + '></div></div>';
    el.innerHTML = '<div class="u-rom-dual">' + single(right) + single(left) + '</div><div class="u-rom-compare"></div>';
    $$('.u-rom', el).forEach(initRom);
    el.addEventListener('u:change', () => updateRomCompare(el));
    updateRomCompare(el);
  };

  /* ---------- Alinhamento mecânico (eixo ósseo interativo) ---------- */
  function _ar(v) { return Math.round(v * 10) / 10; }
  function _femurPath(len) { var s = len / 150; return 'M 0,' + _ar(5 * s) + ' C ' + _ar(-10 * s) + ',' + _ar(6 * s) + ' ' + _ar(-17 * s) + ',' + _ar(2 * s) + ' ' + _ar(-16 * s) + ',' + _ar(-5 * s) + ' C ' + _ar(-15 * s) + ',' + _ar(-12 * s) + ' ' + _ar(-10 * s) + ',' + _ar(-18 * s) + ' ' + _ar(-8 * s) + ',' + _ar(-25 * s) + ' L ' + _ar(-7 * s) + ',' + _ar(-100 * s) + ' L ' + _ar(-13 * s) + ',' + _ar(-118 * s) + ' L ' + _ar(-13 * s) + ',' + _ar(-126 * s) + ' L ' + _ar(2 * s) + ',' + _ar(-127 * s) + ' C ' + _ar(6 * s) + ',' + _ar(-137 * s) + ' ' + _ar(10 * s) + ',' + _ar(-142 * s) + ' ' + _ar(15 * s) + ',' + _ar(-142 * s) + ' C ' + _ar(20 * s) + ',' + _ar(-142 * s) + ' ' + _ar(24 * s) + ',' + _ar(-138 * s) + ' ' + _ar(24 * s) + ',' + _ar(-132 * s) + ' C ' + _ar(24 * s) + ',' + _ar(-126 * s) + ' ' + _ar(20 * s) + ',' + _ar(-122 * s) + ' ' + _ar(15 * s) + ',' + _ar(-122 * s) + ' C ' + _ar(11 * s) + ',' + _ar(-122 * s) + ' ' + _ar(9 * s) + ',' + _ar(-121 * s) + ' ' + _ar(7 * s) + ',' + _ar(-118 * s) + ' L ' + _ar(7 * s) + ',' + _ar(-25 * s) + ' C ' + _ar(10 * s) + ',' + _ar(-18 * s) + ' ' + _ar(15 * s) + ',' + _ar(-12 * s) + ' ' + _ar(16 * s) + ',' + _ar(-5 * s) + ' C ' + _ar(17 * s) + ',' + _ar(2 * s) + ' ' + _ar(10 * s) + ',' + _ar(6 * s) + ' 0,' + _ar(5 * s) + ' Z'; }
  function _tibiaPath(len) { var s = len / 170; return 'M 0,' + _ar(-3 * s) + ' L ' + _ar(16 * s) + ',' + _ar(-2 * s) + ' C ' + _ar(18 * s) + ',' + _ar(0) + ' ' + _ar(17 * s) + ',' + _ar(5 * s) + ' ' + _ar(14 * s) + ',' + _ar(8 * s) + ' L ' + _ar(8 * s) + ',' + _ar(25 * s) + ' L ' + _ar(7 * s) + ',' + _ar(130 * s) + ' L ' + _ar(9 * s) + ',' + _ar(155 * s) + ' L ' + _ar(8 * s) + ',' + _ar(165 * s) + ' L ' + _ar(-2 * s) + ',' + _ar(162 * s) + ' L ' + _ar(-6 * s) + ',' + _ar(130 * s) + ' L ' + _ar(-7 * s) + ',' + _ar(25 * s) + ' C ' + _ar(-10 * s) + ',' + _ar(8 * s) + ' ' + _ar(-14 * s) + ',' + _ar(1 * s) + ' ' + _ar(-14 * s) + ',' + _ar(-4 * s) + ' L 0,' + _ar(-3 * s) + ' Z'; }
  function _fibulaPath(len) { var s = len / 170; return 'M ' + _ar(-12 * s) + ',' + _ar(8 * s) + ' C ' + _ar(-16 * s) + ',' + _ar(4 * s) + ' ' + _ar(-18 * s) + ',' + _ar(8 * s) + ' ' + _ar(-16 * s) + ',' + _ar(14 * s) + ' L ' + _ar(-13 * s) + ',' + _ar(140 * s) + ' L ' + _ar(-14 * s) + ',' + _ar(158 * s) + ' L ' + _ar(-12 * s) + ',' + _ar(165 * s) + ' L ' + _ar(-9 * s) + ',' + _ar(160 * s) + ' L ' + _ar(-10 * s) + ',' + _ar(140 * s) + ' L ' + _ar(-11 * s) + ',' + _ar(14 * s) + ' Z'; }
  function _boneRotation(g, med) { var deg = 180 / Math.PI; var fdx = g.femEndX - g.cx, fdy = g.femEndY - g.fjlY; var femRot = Math.atan2(fdx, -fdy) * deg - 6 * med; var tdx = g.tibEndX - g.cx, tdy = g.tibEndY - g.tjlY; var tibRot = Math.atan2(-tdx, tdy) * deg; return { femRot: femRot, tibRot: tibRot }; }
  function _alignGeom(mldfa, mmpta, jlca, med, expanded, aldfa) {
    var deg = Math.PI / 180, cx = 150, cy = 190, gap = 14, femLen = 150, tibLen = 170, jlLen = 80;
    var fjlY = cy - gap / 2, tjlY = cy + gap / 2, jlca_r = jlca * deg;
    var fjlMedX = cx + med * jlLen * Math.cos(jlca_r), fjlMedY = fjlY + jlLen * Math.sin(jlca_r);
    var fjlLatX = cx - med * jlLen * Math.cos(jlca_r), fjlLatY = fjlY - jlLen * Math.sin(jlca_r);
    var tjlMedX = cx + med * jlLen, tjlLatX = cx - med * jlLen;
    var tibDev = (mmpta - 90) * deg, tibEndX = cx - med * Math.sin(tibDev) * tibLen, tibEndY = tjlY + Math.cos(tibDev) * tibLen;
    var latDir = (med === 1 ? 180 : 0) + med * jlca, proxDir = latDir + med * mldfa;
    var femEndX = cx + Math.cos(proxDir * deg) * femLen, femEndY = fjlY + Math.sin(proxDir * deg) * femLen;
    var anatEndX = null, anatEndY = null;
    if (expanded && aldfa != null) { var anatProxDir = latDir + med * aldfa; anatEndX = cx + Math.cos(anatProxDir * deg) * (femLen * 0.85); anatEndY = fjlY + Math.sin(anatProxDir * deg) * (femLen * 0.85); }
    var mhka = mmpta - mldfa - jlca + 180;
    return { cx: cx, cy: cy, fjlY: fjlY, tjlY: tjlY, fjlMedX: fjlMedX, fjlMedY: fjlMedY, fjlLatX: fjlLatX, fjlLatY: fjlLatY, tjlMedX: tjlMedX, tjlLatX: tjlLatX, tibEndX: tibEndX, tibEndY: tibEndY, femEndX: femEndX, femEndY: femEndY, anatEndX: anatEndX, anatEndY: anatEndY, mhka: mhka, mldfa: mldfa, mmpta: mmpta, jlca: jlca };
  }

  let alignSeq = 0;
  UBNIC.alignment = function (target, opts) {
    opts = opts || {};
    const el = typeof target === 'string' ? $(target) : target; if (!el) return;
    const uid = 'ualign' + (alignSeq++);
    const expanded = !!opts.expanded;
    const med = opts.side === 'left' ? -1 : 1;
    const st = { mhka: null, mldfa: null, mmpta: null, jlca: null, aldfa: null };
    const userFields = {};
    const byId = (sfx) => document.getElementById(uid + '_' + sfx);
    const isComputed = (fid) => ['mhka', 'mldfa', 'jlca', 'mmpta'].filter(k => k !== fid).filter(k => st[k] != null).length === 3 && !userFields[fid];

    function renderFields() {
      const fields = [{ id: 'mhka', label: 'mHKA', desc: 'Eixo mecânico', req: true }, { id: 'mldfa', label: 'mLDFA', desc: 'Fémur distal (lateral)', req: expanded }];
      if (expanded) fields.push({ id: 'aldfa', label: 'aLDFA', desc: 'Fémur distal (anatómico)', req: true });
      fields.push({ id: 'jlca', label: 'JLCA', desc: 'Linha articular', req: expanded });
      fields.push({ id: 'mmpta', label: 'mMPTA', desc: 'Tíbia proximal (medial)', req: expanded });
      let h = '<div class="u-align-fields"><div>';
      fields.forEach((f, i) => {
        h += '<div class="u-align-fld"><div class="row"><label>' + f.label + (f.req ? '<span style="color:var(--red)">*</span>' : '') + '</label>'
          + '<input type="number" id="' + uid + '_' + f.id + '" step="1" placeholder="—" data-fid="' + f.id + '" data-idx="' + i + '">'
          + '<span class="unit">°</span><span class="badge" id="' + uid + '_' + f.id + '_badge" style="display:none">(calc)</span></div>'
          + '<div class="desc">' + f.desc + '</div><div class="fb" id="' + uid + '_' + f.id + '_fb"></div></div>';
      });
      h += '<div class="u-align-calc"><div><span style="opacity:.4">aHKA:</span> <span id="' + uid + '_ahka_val">—</span></div>'
        + (expanded ? '<div style="margin-top:1px"><span style="opacity:.4">FMAA:</span> <span id="' + uid + '_fmaa_val">—</span></div>' : '')
        + '<div id="' + uid + '_interp" style="margin-top:2px;font-weight:600"></div></div></div></div>';
      return h;
    }
    function renderSVG() {
      const mldfa = st.mldfa != null ? st.mldfa : 87, mmpta = st.mmpta != null ? st.mmpta : 87, jlca = st.jlca != null ? st.jlca : 0;
      const aldfa = expanded && st.aldfa != null ? st.aldfa : null, aldfaVis = expanded ? (aldfa != null ? aldfa : mldfa - 6) : null;
      const g = _alignGeom(mldfa, mmpta, jlca, med, expanded, aldfaVis);
      let s = '<svg id="' + uid + '_svg" viewBox="35 8 230 382" width="100%" style="max-width:280px;touch-action:auto" xmlns="http://www.w3.org/2000/svg">';
      const br = _boneRotation(g, med);
      s += '<g id="' + uid + '_bone_fem" transform="translate(' + g.cx + ',' + g.fjlY + ') rotate(' + _ar(br.femRot) + ') scale(' + med + ',1)" opacity="0.08"><path d="' + _femurPath(150) + '" fill="var(--t2)" stroke="var(--t3)" stroke-width="0.5"/></g>';
      s += '<g id="' + uid + '_bone_tib" transform="translate(' + g.cx + ',' + g.tjlY + ') rotate(' + _ar(br.tibRot) + ') scale(' + med + ',1)" opacity="0.08"><path d="' + _tibiaPath(170) + '" fill="var(--t2)" stroke="var(--t3)" stroke-width="0.5"/><path d="' + _fibulaPath(170) + '" fill="var(--t2)" stroke="var(--t3)" stroke-width="0.5"/></g>';
      s += '<line x1="' + g.cx + '" y1="12" x2="' + g.cx + '" y2="385" stroke="var(--bdr)" stroke-dasharray="3,6" stroke-width="0.5" opacity="0.4"/>';
      s += '<line id="' + uid + '_tjl" x1="' + g.tjlLatX + '" y1="' + g.tjlY + '" x2="' + g.tjlMedX + '" y2="' + g.tjlY + '" stroke="var(--t4)" stroke-width="2"/>';
      s += '<line id="' + uid + '_fjl" x1="' + g.fjlLatX + '" y1="' + g.fjlLatY + '" x2="' + g.fjlMedX + '" y2="' + g.fjlMedY + '" stroke="var(--amber)" stroke-width="2"/>';
      s += '<polygon id="' + uid + '_gap" points="' + g.tjlLatX + ',' + g.tjlY + ' ' + g.tjlMedX + ',' + g.tjlY + ' ' + g.fjlMedX + ',' + g.fjlMedY + ' ' + g.fjlLatX + ',' + g.fjlLatY + '" fill="var(--teal)" opacity="0.04"/>';
      s += '<line id="' + uid + '_tib" x1="' + g.cx + '" y1="' + g.tjlY + '" x2="' + g.tibEndX + '" y2="' + g.tibEndY + '" stroke="var(--teal)" stroke-width="2.5"/>';
      s += '<line id="' + uid + '_fem" x1="' + g.cx + '" y1="' + g.fjlY + '" x2="' + g.femEndX + '" y2="' + g.femEndY + '" stroke="var(--teal)" stroke-width="2.5"/>';
      if (expanded) { s += '<line id="' + uid + '_anat" x1="' + g.cx + '" y1="' + g.fjlY + '" x2="' + g.anatEndX + '" y2="' + g.anatEndY + '" stroke="var(--purple)" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.5"/>'; s += '<text id="' + uid + '_anat_lbl" x="' + (g.anatEndX + (g.anatEndX < g.cx ? -8 : 8)) + '" y="' + (g.anatEndY + 4) + '" font-size="8" fill="var(--purple)" opacity="0.6" text-anchor="' + (g.anatEndX < g.cx ? 'end' : 'start') + '">Anat</text>'; }
      s += '<text id="' + uid + '_fem_lbl" x="' + (g.femEndX + (g.femEndX < g.cx ? -8 : 8)) + '" y="' + (g.femEndY + 4) + '" font-size="9" fill="var(--teal)" font-weight="600" text-anchor="' + (g.femEndX < g.cx ? 'end' : 'start') + '">Fem</text>';
      s += '<text id="' + uid + '_tib_lbl" x="' + (g.tibEndX + (g.tibEndX < g.cx ? -8 : 8)) + '" y="' + (g.tibEndY + 4) + '" font-size="9" fill="var(--teal)" font-weight="600" text-anchor="' + (g.tibEndX < g.cx ? 'end' : 'start') + '">Tib</text>';
      s += '<text x="' + (g.cx + med * 98) + '" y="' + g.cy + '" font-size="9" fill="var(--t3)" text-anchor="middle" dominant-baseline="central">Med</text>';
      s += '<text x="' + (g.cx - med * 98) + '" y="' + g.cy + '" font-size="9" fill="var(--t3)" text-anchor="middle" dominant-baseline="central">Lat</text>';
      s += '<text id="' + uid + '_mmpta_lbl" x="' + (g.cx + med * 30) + '" y="' + (g.tjlY + 15) + '" font-size="9" fill="var(--teal)" text-anchor="middle">' + mmpta + '°</text>';
      s += '<text x="' + (g.cx + med * 30) + '" y="' + (g.tjlY + 24) + '" font-size="7" fill="var(--teal)" text-anchor="middle" opacity="0.6">mMPTA</text>';
      s += '<text id="' + uid + '_mldfa_lbl" x="' + (g.cx - med * 30) + '" y="' + (g.fjlY - 10) + '" font-size="9" fill="var(--amber)" text-anchor="middle">' + mldfa + '°</text>';
      s += '<text x="' + (g.cx - med * 30) + '" y="' + (g.fjlY - 1) + '" font-size="7" fill="var(--amber)" text-anchor="middle" opacity="0.6">mLDFA</text>';
      s += '<text id="' + uid + '_jlca_lbl" x="' + g.cx + '" y="' + g.cy + '" font-size="8" fill="var(--red)" text-anchor="middle" dominant-baseline="central"' + (Math.abs(jlca) < 1 ? ' opacity="0"' : '') + '>' + jlca + '°</text>';
      s += '<text id="' + uid + '_mhka_lbl" x="' + g.cx + '" y="18" font-size="12" fill="var(--t2)" text-anchor="middle" font-weight="700">mHKA ' + g.mhka + '°</text>';
      const interp = g.mhka < 179 ? 'VARO' : g.mhka > 181 ? 'VALGO' : 'Neutro', ic = Math.abs(g.mhka - 180) > 1 ? 'var(--amber)' : 'var(--green)';
      s += '<text id="' + uid + '_interp_lbl" x="' + g.cx + '" y="32" font-size="9" fill="' + ic + '" text-anchor="middle" font-weight="600">' + interp + '</text>';
      if (expanded) { var fmaa = mldfa - (aldfaVis || mldfa - 6), fmaaColor = (aldfa != null) ? 'var(--purple)' : 'var(--t4)'; s += '<text id="' + uid + '_fmaa_lbl" x="' + (g.cx - med * 70) + '" y="20" font-size="9" fill="' + fmaaColor + '" text-anchor="middle">FMAA ' + fmaa + '°</text>'; s += '<text id="' + uid + '_aldfa_lbl" x="' + (g.cx - med * 70) + '" y="34" font-size="9" fill="' + (aldfa != null ? 'var(--purple)' : 'var(--t4)') + '" text-anchor="middle">' + (aldfaVis != null ? 'aLDFA ' + aldfaVis + '°' : '') + '</text>'; }
      s += '<circle id="' + uid + '_h_mldfa" cx="' + g.femEndX + '" cy="' + g.femEndY + '" r="12" fill="var(--teal)" opacity="0.12" stroke="var(--teal)" stroke-width="1.5" class="align-handle" data-param="mldfa"/>';
      s += '<circle id="' + uid + '_h_mmpta" cx="' + g.tibEndX + '" cy="' + g.tibEndY + '" r="12" fill="var(--teal)" opacity="0.12" stroke="var(--teal)" stroke-width="1.5" class="align-handle" data-param="mmpta"/>';
      s += '<circle id="' + uid + '_h_jlca" cx="' + g.fjlMedX + '" cy="' + g.fjlMedY + '" r="10" fill="var(--amber)" opacity="0.12" stroke="var(--amber)" stroke-width="1.5" class="align-handle" data-param="jlca"/>';
      if (expanded) s += '<circle id="' + uid + '_h_aldfa" cx="' + g.anatEndX + '" cy="' + g.anatEndY + '" r="10" fill="var(--purple)" opacity="0.15" stroke="var(--purple)" stroke-width="1.5" stroke-dasharray="3,2" class="align-handle" data-param="aldfa"/>';
      s += '<circle cx="' + g.cx + '" cy="' + g.cy + '" r="3" fill="var(--t4)" opacity="0.3"/></svg>';
      return s;
    }
    function updateSVG() {
      const mldfa = st.mldfa != null ? st.mldfa : 87, mmpta = st.mmpta != null ? st.mmpta : 87, jlca = st.jlca != null ? st.jlca : 0;
      const aldfa = expanded ? st.aldfa : null, aldfaVis = expanded ? (aldfa != null ? aldfa : mldfa - 6) : null;
      const g = _alignGeom(mldfa, mmpta, jlca, med, expanded, aldfaVis);
      const setL = (id, a, b, c, d) => { const e = byId(id); if (e) { e.setAttribute('x1', a); e.setAttribute('y1', b); e.setAttribute('x2', c); e.setAttribute('y2', d); } };
      const setC = (id, x, y) => { const e = byId(id); if (e) { e.setAttribute('cx', x); e.setAttribute('cy', y); } };
      const setT = (id, t, attrs) => { const e = byId(id); if (e) { if (t != null) e.textContent = t; if (attrs) Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k])); } };
      const br = _boneRotation(g, med);
      const bf = byId('bone_fem'); if (bf) bf.setAttribute('transform', 'translate(' + g.cx + ',' + g.fjlY + ') rotate(' + _ar(br.femRot) + ') scale(' + med + ',1)');
      const bt = byId('bone_tib'); if (bt) bt.setAttribute('transform', 'translate(' + g.cx + ',' + g.tjlY + ') rotate(' + _ar(br.tibRot) + ') scale(' + med + ',1)');
      setL('fjl', g.fjlLatX, g.fjlLatY, g.fjlMedX, g.fjlMedY); setL('tib', g.cx, g.tjlY, g.tibEndX, g.tibEndY); setL('fem', g.cx, g.fjlY, g.femEndX, g.femEndY);
      const gp = byId('gap'); if (gp) gp.setAttribute('points', g.tjlLatX + ',' + g.tjlY + ' ' + g.tjlMedX + ',' + g.tjlY + ' ' + g.fjlMedX + ',' + g.fjlMedY + ' ' + g.fjlLatX + ',' + g.fjlLatY);
      setC('h_mldfa', g.femEndX, g.femEndY); setC('h_mmpta', g.tibEndX, g.tibEndY); setC('h_jlca', g.fjlMedX, g.fjlMedY);
      if (expanded && g.anatEndX != null) { setL('anat', g.cx, g.fjlY, g.anatEndX, g.anatEndY); setT('anat_lbl', 'Anat', { x: g.anatEndX + (g.anatEndX < g.cx ? -8 : 8), y: g.anatEndY + 4, 'text-anchor': g.anatEndX < g.cx ? 'end' : 'start' }); setC('h_aldfa', g.anatEndX, g.anatEndY); const ae = byId('anat'); if (ae) ae.setAttribute('opacity', aldfa != null ? '0.5' : '0.25'); const fmaa2 = mldfa - (aldfaVis || mldfa - 6); setT('fmaa_lbl', 'FMAA ' + fmaa2 + '°', { fill: aldfa != null ? 'var(--purple)' : 'var(--t4)' }); setT('aldfa_lbl', 'aLDFA ' + aldfaVis + '°', { fill: aldfa != null ? 'var(--purple)' : 'var(--t4)' }); }
      setT('fem_lbl', 'Fem', { x: g.femEndX + (g.femEndX < g.cx ? -8 : 8), y: g.femEndY + 4, 'text-anchor': g.femEndX < g.cx ? 'end' : 'start' });
      setT('tib_lbl', 'Tib', { x: g.tibEndX + (g.tibEndX < g.cx ? -8 : 8), y: g.tibEndY + 4, 'text-anchor': g.tibEndX < g.cx ? 'end' : 'start' });
      setT('mmpta_lbl', mmpta + '°'); setT('mldfa_lbl', mldfa + '°');
      setT('jlca_lbl', Math.abs(jlca) >= 1 ? jlca + '°' : '', { opacity: Math.abs(jlca) >= 1 ? '1' : '0' });
      setT('mhka_lbl', 'mHKA ' + g.mhka + '°');
      const interp = g.mhka < 179 ? 'VARO' : g.mhka > 181 ? 'VALGO' : 'Neutro';
      setT('interp_lbl', interp, { fill: Math.abs(g.mhka - 180) > 1 ? 'var(--amber)' : 'var(--green)' });
    }
    function autoCalc() {
      const keys = ['mhka', 'mldfa', 'jlca', 'mmpta'], filled = keys.filter(k => userFields[k]);
      keys.forEach(k => { if (!userFields[k]) { st[k] = null; const inp = byId(k); if (inp && !inp.matches(':focus')) { inp.value = ''; inp.style.color = ''; inp.style.fontStyle = ''; } const b = byId(k + '_badge'); if (b) b.style.display = 'none'; } });
      if (filled.length === 3) {
        const m = keys.find(k => !userFields[k]); if (!m) return;
        let calc;
        if (m === 'mhka') calc = st.mmpta - st.mldfa - st.jlca + 180;
        if (m === 'mmpta') calc = st.mhka + st.mldfa + st.jlca - 180;
        if (m === 'mldfa') calc = st.mmpta - st.mhka - st.jlca + 180;
        if (m === 'jlca') calc = st.mmpta - st.mldfa - st.mhka + 180;
        calc = Math.round(calc); st[m] = calc;
        const inp = byId(m); if (inp) { inp.value = calc; inp.style.color = 'var(--teal)'; inp.style.fontStyle = 'italic'; }
        const b = byId(m + '_badge'); if (b) b.style.display = 'inline';
      }
      keys.forEach(k => { if (userFields[k]) { const inp = byId(k); if (inp) { inp.style.color = ''; inp.style.fontStyle = ''; } const b = byId(k + '_badge'); if (b) b.style.display = 'none'; } });
    }
    const LIM = { mhka: [150, 200, 165, 195], mldfa: [60, 120, 75, 100], mmpta: [60, 120, 75, 100], jlca: [-10, 10, -8, 8], aldfa: [55, 115, 72, 95] };
    function validateField(fid) {
      const val = st[fid], inp = byId(fid), fb = byId(fid + '_fb'), lim = LIM[fid]; if (!inp) return;
      inp.style.borderColor = ''; if (fb) fb.innerHTML = ''; if (val == null || !lim) return;
      const err = t => { inp.style.borderColor = 'var(--red)'; if (fb) fb.innerHTML = '<span style="color:var(--red);font-weight:600">' + t + '</span>'; };
      if (val < lim[0]) return err('Não pode ser inferior a ' + lim[0] + '°');
      if (val > lim[1]) return err('Não pode exceder ' + lim[1] + '°');
      if (val < lim[2] || val > lim[3]) return err('Valor altamente improvável');
      if (fid === 'aldfa' && st.mldfa != null && val > st.mldfa - 3) err('FMAA < 3° (aLDFA deve ser ≤ ' + (st.mldfa - 3) + '°)');
    }
    function updateDisplays() {
      const ah = byId('ahka_val'); if (ah) ah.innerHTML = (st.mldfa != null && st.mmpta != null) ? '<strong>' + (st.mmpta - st.mldfa + 180) + '°</strong>' : '—';
      if (expanded) { const fe = byId('fmaa_val'); if (fe) { if (st.mldfa != null && st.aldfa != null) { const fmaa = st.mldfa - st.aldfa, fc = (fmaa >= 4 && fmaa <= 8) ? 'var(--green)' : 'var(--amber)'; fe.innerHTML = '<strong style="color:' + fc + '">' + fmaa + '°</strong>'; } else fe.textContent = '—'; } }
      const ie = byId('interp'); if (ie && st.mhka != null) { const d = st.mhka - 180; if (Math.abs(d) <= 1) ie.innerHTML = '<span style="color:var(--green)">Neutro (' + st.mhka + '°)</span>'; else if (d < -1) ie.innerHTML = '<span style="color:var(--amber)">Varo ' + Math.abs(d) + '° (' + st.mhka + '°)</span>'; else ie.innerHTML = '<span style="color:var(--amber)">Valgo ' + d + '° (' + st.mhka + '°)</span>'; }
    }
    function checkConsistency() {
      const warnEl = byId('warn'); if (warnEl) warnEl.innerHTML = '';
      if (userFields.mhka && userFields.mldfa && userFields.jlca && userFields.mmpta && st.mhka != null && st.mldfa != null && st.jlca != null && st.mmpta != null) {
        const expected = st.mmpta - st.mldfa - st.jlca + 180, diff = Math.abs(st.mhka - expected);
        if (diff > 1 && warnEl) warnEl.innerHTML = '<div style="padding:8px;background:var(--amber-bg);border:1px solid var(--amber-bdr);border-radius:6px;color:var(--amber)"><strong>Inconsistência:</strong> mHKA medido (' + st.mhka + '°) difere ' + diff + '° do calculado (' + expected + '°).</div>';
      }
    }
    function getResult() {
      const r = { mhka: st.mhka, mldfa: st.mldfa, mmpta: st.mmpta, jlca: st.jlca };
      if (st.mldfa != null && st.mmpta != null) r.ahka = st.mmpta - st.mldfa + 180;
      if (expanded && st.aldfa != null) { r.aldfa = st.aldfa; if (st.mldfa != null) r.fmaa = st.mldfa - st.aldfa; r.constitutional_valgus = st.aldfa < 79; }
      return r;
    }
    function onInput(fid) {
      const inp = byId(fid); if (!inp) return;
      const prev = st[fid], v = inp.value !== '' ? Math.round(parseFloat(inp.value)) : null;
      st[fid] = (v != null && !isNaN(v)) ? v : null;
      if (st[fid] != null && inp.value !== '' + st[fid]) inp.value = st[fid];
      if (fid === 'mldfa' && expanded && st.mldfa != null && prev != null && st.aldfa != null) { const fmaa = prev - st.aldfa; st.aldfa = st.mldfa - fmaa; const ai = byId('aldfa'); if (ai) ai.value = st.aldfa; }
      if (st[fid] != null) userFields[fid] = true; else delete userFields[fid];
      autoCalc(); validateField(fid); updateDisplays(); checkConsistency(); updateSVG(); fire(el, 'alignment', getResult());
    }
    function materializeDefaults() {
      const defs = { mldfa: 87, mmpta: 87, jlca: 0 };
      ['mldfa', 'mmpta', 'jlca'].forEach(k => { if (st[k] == null) { st[k] = defs[k]; userFields[k] = true; const inp = byId(k); if (inp) { inp.value = defs[k]; inp.style.color = ''; inp.style.fontStyle = ''; } } });
      if (expanded && st.aldfa == null) { const m = st.mldfa || 87; st.aldfa = m - 6; userFields.aldfa = true; const inp = byId('aldfa'); if (inp) inp.value = m - 6; }
      autoCalc(); updateDisplays(); checkConsistency();
    }
    function initDrag() {
      const svg = byId('svg'), wrap = byId('wrap'); if (!svg || !wrap || wrap._init) return; wrap._init = true;
      const deg = Math.PI / 180, gap = 14, HIT = 40; let drag = null;
      const svgPt = (ev) => { const pt = svg.createSVGPoint(), t = ev.touches ? ev.touches[0] : ev; pt.x = t.clientX; pt.y = t.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
      function hp() { const mldfa = st.mldfa != null ? st.mldfa : 87, mmpta = st.mmpta != null ? st.mmpta : 87, jlca = st.jlca != null ? st.jlca : 0, aldfa = expanded ? st.aldfa : null, aldfaVis = expanded ? (aldfa != null ? aldfa : mldfa - 6) : null; const g = _alignGeom(mldfa, mmpta, jlca, med, expanded, aldfaVis); return { mmpta: { x: g.tibEndX, y: g.tibEndY }, mldfa: { x: g.femEndX, y: g.femEndY }, jlca: { x: g.fjlMedX, y: g.fjlMedY }, aldfa: expanded && g.anatEndX != null ? { x: g.anatEndX, y: g.anatEndY } : null }; }
      function onDown(ev) { ev.preventDefault(); const pt = svgPt(ev), pos = hp(); let best = null, bd = HIT; ['mmpta', 'jlca', 'aldfa', 'mldfa'].forEach(key => { if (!pos[key]) return; const d = Math.hypot(pt.x - pos[key].x, pt.y - pos[key].y); if (d < bd) { bd = d; best = key; } }); if (!best) return; materializeDefaults(); drag = best; wrap.style.cursor = 'grabbing'; }
      function onMove(ev) {
        if (!drag) return; ev.preventDefault(); const pt = svgPt(ev), fjlY = 190 - gap / 2, cx = 150, tjlY = 190 + gap / 2; let angle;
        if (drag === 'mmpta') { let dx = pt.x - cx, dy = pt.y - tjlY; if (dy < 20) dy = 20; angle = Math.round(90 + Math.atan2(-med * dx, dy) / deg); }
        else if (drag === 'mldfa' || drag === 'aldfa') { const dx = pt.x - cx, dy = pt.y - fjlY, jlca2 = st.jlca || 0, latDir = (med === 1 ? 180 : 0) + med * jlca2, pAngle = Math.atan2(dy, dx) / deg; angle = Math.round(((pAngle - latDir + 540) % 360 - 180) * med); }
        else if (drag === 'jlca') { const dx = pt.x - cx, dy = pt.y - fjlY, base = med === 1 ? 0 : 180; angle = Math.round((Math.atan2(dy, dx) / deg - base + 540) % 360 - 180) / med; angle = Math.round(angle); }
        const cl = { mmpta: [60, 120], mldfa: [60, 120], jlca: [-10, 10], aldfa: [55, 115] }[drag]; if (cl) angle = Math.max(cl[0], Math.min(cl[1], angle));
        if (drag === 'aldfa') { const cm = st.mldfa || 87; angle = Math.min(angle, cm - 3); }
        const prev = st[drag]; if (angle === prev) return; st[drag] = angle;
        if (drag === 'mldfa' && expanded && st.aldfa != null && prev != null) { const fmaa = prev - st.aldfa; st.aldfa = angle - fmaa; const ai = byId('aldfa'); if (ai) ai.value = angle - fmaa; }
        userFields[drag] = true; const inp = byId(drag); if (inp) { inp.value = angle; inp.style.color = ''; inp.style.fontStyle = ''; }
        autoCalc(); validateField(drag); updateDisplays(); checkConsistency(); updateSVG(); fire(el, 'alignment', getResult());
      }
      const onUp = () => { if (drag) { drag = null; wrap.style.cursor = 'default'; } };
      wrap.addEventListener('mousedown', onDown); wrap.addEventListener('mousemove', onMove); wrap.addEventListener('mouseup', onUp); wrap.addEventListener('mouseleave', onUp);
      wrap.addEventListener('touchstart', onDown, { passive: false }); wrap.addEventListener('touchmove', onMove, { passive: false }); wrap.addEventListener('touchend', onUp);
    }

    const fieldsCol = renderFields();
    const svgCol = '<div class="u-align-svg" id="' + uid + '_wrap">' + renderSVG() + '</div>';
    el.classList.add('u-align');
    el.innerHTML = '<div class="u-align-row">' + (med === 1 ? svgCol + fieldsCol : fieldsCol + svgCol) + '</div><div class="u-align-warn" id="' + uid + '_warn"></div>';
    // listeners de input
    $$('input[data-fid]', el).forEach(inp => {
      const fid = inp.getAttribute('data-fid');
      inp.addEventListener('input', () => onInput(fid));
    });
    initDrag();
    // valores iniciais opcionais
    if (opts.values) { Object.keys(opts.values).forEach(k => { if (st.hasOwnProperty(k)) { const inp = byId(k); if (inp) { inp.value = opts.values[k]; onInput(k); } } }); }
    updateSVG();
  };

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = $$('.u-reveal:not(.visible)');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visible')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => io.observe(e));
  }

  UBNIC.refresh = function () {
    initReveal();
    // Reavalia campos numéricos e datas já presentes (após render dinâmico)
    $$('.u-input[data-hard-min], .u-input[data-soft-min], .u-input[data-hard-max], .u-input[data-soft-max], .u-input[data-analyte]').forEach(evalNumField);
    $$('.u-date').forEach(evalDate);
    $$('.u-rom').forEach(initRom);
    $$('.u-onset').forEach(evalOnset); // dim inicial + leitura ao vivo após render
    $$('.u-episodes').forEach(evalEpisodes); // toggle inicial + gating do adicionar
    $$('.u-berger').forEach(evalBerger);
    $$('.u-mgate').forEach(evalGate);
  };

  /* ---------- Stack (contentor de recolha) ---------- */
  let stackSeq = 0;
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function inferDensity(field) {
    // Precedência: density explícito → ordinal → alguma opção tem desc → 2 opções sem desc → buttons
    if (field.density) return field.density;
    if (field.ordinal) return 'segmented';
    const opts = field.options || [];
    if (opts.some(o => o.desc)) return 'cards';
    if (opts.length === 2) return 'segmented';
    return 'buttons';
  }
  // Uma linha de episódio (Ano/Mês compactos, validação tricolor via readDateFields). Partilhado por render/add/hidratação.
  function epRowHtml(idx, ep) {
    ep = ep || {};
    return '<div class="u-ep-row" data-ep-idx="' + idx + '">' +
      '<span class="u-ep-num">' + (idx + 1) + '.</span>' +
      '<input class="u-input u-ep-yr" data-yr inputmode="numeric" placeholder="Ano" value="' + (ep.y != null ? esc(String(ep.y)) : '') + '">' +
      '<input class="u-input u-ep-mo" data-mo inputmode="numeric" placeholder="Mês" value="' + (ep.m != null ? esc(String(ep.m)) : '') + '">' +
      '<button type="button" class="u-ep-remove" title="Remover">×</button>' +
    '</div>';
  }
  /* ---------- Berger: ilustrações SVG ---------- */
  const BERGER_SVG_FEM = '<svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:220px;margin:0 auto;display:block">'
    + '<rect x="50" y="50" width="140" height="90" rx="18" fill="rgba(59,135,123,0.08)" stroke="var(--bdr2)" stroke-width="1.5"/>'
    + '<ellipse cx="85" cy="140" rx="28" ry="14" fill="rgba(59,135,123,0.12)" stroke="var(--teal)" stroke-width="1.5"/>'
    + '<ellipse cx="155" cy="140" rx="28" ry="14" fill="rgba(59,135,123,0.12)" stroke="var(--teal)" stroke-width="1.5"/>'
    + '<line x1="50" y1="146" x2="190" y2="146" stroke="var(--teal)" stroke-width="2" stroke-dasharray="6,3"/>'
    + '<text x="195" y="150" fill="var(--teal)" font-size="8" font-family="var(--font-mono)" font-weight="600">PCL</text>'
    + '<line x1="40" y1="108" x2="200" y2="100" stroke="var(--amber)" stroke-width="2"/>'
    + '<circle cx="40" cy="108" r="4" fill="var(--amber)"/><circle cx="200" cy="100" r="4" fill="var(--amber)"/>'
    + '<text x="12" y="106" fill="var(--amber)" font-size="7.5" font-family="var(--font-mono)" font-weight="600">EM</text>'
    + '<text x="204" y="98" fill="var(--amber)" font-size="7.5" font-family="var(--font-mono)" font-weight="600">EL</text>'
    + '<text x="120" y="93" fill="var(--amber)" font-size="8" font-family="var(--font-mono)" font-weight="700" text-anchor="middle">TEA</text>'
    + '<path d="M170,146 A30,30 0 0,0 173,100" fill="none" stroke="var(--red)" stroke-width="1.5"/>'
    + '<text x="182" y="126" fill="var(--red)" font-size="9" font-family="var(--font-mono)" font-weight="700">α</text>'
    + '<text x="120" y="46" fill="var(--t4)" font-size="7" font-family="var(--font-sans)" font-weight="500" font-style="italic" text-anchor="middle">Anterior</text>'
    + '<text x="120" y="72" fill="var(--t3)" font-size="7.5" font-family="var(--font-sans)" font-weight="500" text-anchor="middle">Componente femoral</text>'
    + '<text x="85" y="158" fill="var(--t4)" font-size="7" font-family="var(--font-sans)" text-anchor="middle">Côndilo Med</text>'
    + '<text x="155" y="158" fill="var(--t4)" font-size="7" font-family="var(--font-sans)" text-anchor="middle">Côndilo Lat</text>'
    + '<text x="120" y="170" fill="var(--t4)" font-size="7" font-family="var(--font-sans)" font-weight="500" font-style="italic" text-anchor="middle">Posterior</text>'
    + '<text x="120" y="186" fill="var(--t3)" font-size="7" font-family="var(--font-mono)" text-anchor="middle">α = rotação externa da PCL vs TEA</text>'
    + '<text x="120" y="196" fill="var(--t3)" font-size="7" font-family="var(--font-mono)" text-anchor="middle">Normal: 0° a 3° RE | Negativo (RI) = patológico</text>'
    + '</svg>';
  const BERGER_SVG_TIB = '<svg viewBox="0 0 240 210" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:220px;margin:0 auto;display:block">'
    + '<ellipse cx="110" cy="28" rx="11" ry="7" fill="rgba(230,126,34,0.15)" stroke="var(--amber)" stroke-width="1.5"/>'
    + '<text x="110" y="31" fill="var(--amber)" font-size="6.5" font-family="var(--font-mono)" font-weight="700" text-anchor="middle">TTA</text>'
    + '<path d="M60,70 C60,50 85,42 120,42 C155,42 180,50 180,70 L180,130 C180,145 168,155 155,158 C145,160 135,162 130,160 C125,156 120,153 120,153 C120,153 115,156 110,160 C105,162 95,160 85,158 C72,155 60,145 60,130 Z" fill="rgba(59,135,123,0.06)" stroke="var(--bdr2)" stroke-width="1.8"/>'
    + '<path d="M65,72 C65,55 88,47 120,47 C152,47 175,55 175,72 L175,128 C175,142 164,150 152,153 C143,155 135,157 130,155 C126,152 122,149 120,149 C118,149 114,152 110,155 C105,157 97,155 88,153 C76,150 65,142 65,128 Z" fill="none" stroke="var(--bdr2)" stroke-width="0.8" opacity="0.5"/>'
    + '<circle cx="120" cy="100" r="22" fill="rgba(59,135,123,0.04)" stroke="var(--bdr2)" stroke-width="1.2"/>'
    + '<circle cx="120" cy="100" r="14" fill="rgba(59,135,123,0.08)" stroke="var(--bdr2)" stroke-width="1.5"/>'
    + '<circle cx="120" cy="100" r="2.5" fill="var(--t3)"/>'
    + '<line x1="120" y1="38" x2="120" y2="168" stroke="var(--teal)" stroke-width="2" stroke-dasharray="6,3"/>'
    + '<text x="130" y="171" fill="var(--teal)" font-size="7.5" font-family="var(--font-mono)" font-weight="600">AP prato</text>'
    + '<line x1="120" y1="100" x2="110" y2="32" stroke="var(--amber)" stroke-width="2"/>'
    + '<path d="M120,68 A32,32 0 0,1 114,69" fill="none" stroke="var(--red)" stroke-width="1.8"/>'
    + '<text x="108" y="63" fill="var(--red)" font-size="9" font-family="var(--font-mono)" font-weight="700">β</text>'
    + '<text x="145" y="47" fill="var(--t4)" font-size="7" font-family="var(--font-sans)" font-weight="500" font-style="italic">Anterior</text>'
    + '<text x="140" y="160" fill="var(--t4)" font-size="7" font-family="var(--font-sans)" font-weight="500" font-style="italic">Posterior</text>'
    + '<text x="34" y="102" fill="var(--t4)" font-size="7.5" font-family="var(--font-sans)" font-weight="500">Med</text>'
    + '<text x="190" y="102" fill="var(--t4)" font-size="7.5" font-family="var(--font-sans)" font-weight="500">Lat</text>'
    + '<text x="120" y="191" fill="var(--t3)" font-size="7" font-family="var(--font-mono)" text-anchor="middle">β = rotação externa do AP prato vs eixo TTA</text>'
    + '<text x="120" y="202" fill="var(--t3)" font-size="7" font-family="var(--font-mono)" text-anchor="middle">Normal: 18° ± 3° RE | &lt; 15° (RI relativa) = patológico</text>'
    + '</svg>';
  /* ---------- Berger: rotação dos componentes (helpers) ---------- */
  const BERGER_BOUNDS = {
    fem: { hardMin: -20, hardMax: 20, softMin: -10, softMax: 10 },
    tib: { hardMin: -15, hardMax: 50, softMin: 0,  softMax: 35 },
  };
  function bergerPlausible(raw, b) {
    const v = String(raw == null ? '' : raw).trim(); if (v === '') return null;
    const n = parseFloat(v); if (isNaN(n)) return null;
    if (n < b.hardMin || n > b.hardMax) return null;
    return n;
  }
  function bergerInputLevel(kind, v) {
    if (kind === 'fem') { if (v <= -2) return 'red'; if (v < 0) return 'amber'; if (v <= 3) return 'green'; return 'amber'; }
    if (v < 12) return 'red'; if (v < 15) return 'amber'; return 'green';
  }
  function bergerCombined(fem, tib) {
    if (fem == null || tib == null || isNaN(fem) || isNaN(tib)) return { combined: null };
    const femIR = Math.max(0, -fem), tibIR = Math.max(0, 18 - tib), combined = femIR + tibIR;
    let level, label, short;
    if (combined <= 3) { level = 'green'; label = 'Aceitável'; short = 'aceitável'; }
    else if (combined <= 5) { level = 'amber'; label = 'Indicação relativa de revisão'; short = 'relativa'; }
    else { level = 'red'; label = 'Indicação absoluta de revisão'; short = 'absoluta'; }
    return { femIR, tibIR, combined, level, label, short };
  }
  function bergerFigsHtml() {
    return '<details class="u-berger-figs" open><summary>Como medir (ilustrações)</summary>'
      + '<div class="u-berger-figs-grid">'
      + '<div class="u-berger-fig"><div class="u-berger-fig-title">Rotação Femoral</div>' + BERGER_SVG_FEM
      + '<div class="u-berger-fig-how"><strong>Como medir:</strong> No corte axial da TC ao nível dos epicôndilos, traçar (1) <span style="color:var(--amber);font-weight:600">TEA</span> (epicôndilo medial→lateral) e (2) <span style="color:var(--teal);font-weight:600">PCL</span> (tangente posterior dos côndilos protésicos). O ângulo <span style="color:var(--red);font-weight:600">α</span> = rotação externa da PCL vs TEA. Normal: 0–3° RE; negativo (RI) é patológico.</div></div>'
      + '<div class="u-berger-fig"><div class="u-berger-fig-title">Rotação Tibial</div>' + BERGER_SVG_TIB
      + '<div class="u-berger-fig-how"><strong>Como medir:</strong> No corte axial ao nível do prato, traçar (1) <span style="color:var(--teal);font-weight:600">AP prato</span> (eixo AP geométrico do componente) e (2) <span style="color:var(--amber);font-weight:600">eixo TTA</span> (centro→TTA). O ângulo <span style="color:var(--red);font-weight:600">β</span> = rotação externa do AP do prato vs TTA. Normal: ~18° RE; < 15° = RI relativa.</div></div>'
      + '</div></details>';
  }
  /* ---------- Zones: seletor anatómico em grelha (layout do multi) ---------- */
  function zonesInnerHtml(field, side) {
    const cell = (o) => '<label class="u-seg-btn"><input type="checkbox" value="' + esc(o.value) + '"' + (o.none ? ' data-none' : '') + '><span>' + esc(o.label) + '</span></label>';
    const groupHtml = (g, options) => '<div class="u-zones-group" data-zone="' + esc(g.zone || 'center') + '"><div class="u-zones-glabel">' + esc(g.label || '') + '</div><div class="u-zones-cells">' + options.map(cell).join('') + '</div></div>';
    const groups = field.groups || [];
    const med = groups.find(g => g.zone === 'medial'), lat = groups.find(g => g.zone === 'lateral');
    const centers = groups.filter(g => g !== med && g !== lat);
    let h = centers.map(g => groupHtml(g, g.options || [])).join('');
    if (med && lat) {
      const rev = z => (side === 'right' && z === 'lateral') || (side === 'left' && z === 'medial');
      const cols = side === 'right' ? [lat, med] : [med, lat];
      h += '<div class="u-zones-pair">' + cols.map(g => groupHtml(g, rev(g.zone) ? (g.options || []).slice().reverse() : (g.options || []))).join('') + '</div>';
    } else if (med || lat) { const g = med || lat; h += groupHtml(g, g.options || []); }
    if (field.noneLabel) h += '<label class="u-seg-btn u-zones-none"><input type="checkbox" value="none" data-none checked><span>' + esc(field.noneLabel) + '</span></label>';
    return h;
  }
  function zonesSummary(field, sel) {
    sel = Array.isArray(sel) ? sel : [];
    const zones = sel.filter(v => v !== 'none');
    if (!zones.length) return field.noneLabel || '';
    const groups = field.groups || [];
    const pre = field.label ? field.label + ': ' : '';
    if (groups.length) {
      const parts = groups.map(g => { const labs = (g.options || []).filter(o => zones.includes(o.value)).map(o => o.label); return labs.length ? ((g.label ? g.label + ' ' : '') + labs.join('/')) : null; }).filter(Boolean);
      return pre + parts.join(' · ');
    }
    const labs = zones.map(v => ((field.options || []).find(o => o.value === v) || {}).label || v);
    return pre + labs.join(', ');
  }
  function multiChipsHtml(field, dn, def) {
    const chip = (o) => '<label class="u-mchip' + (o.none ? ' u-mchip-none' : '') + '"><input type="checkbox" value="' + esc(o.value) + '"' + (o.none ? ' data-none' : '') + '><span class="ck">✓</span><span class="u-opt-l">' + esc(o.label) + '</span>' + (o.info ? '<span class="u-info"><i>i</i><span class="u-info-pop">' + esc(o.info) + '</span></span>' : '<span class="u-mchip-end" aria-hidden="true"></span>') + '</label>';
    const groupHtml = (g) => '<div class="u-multi-group"' + (g.col ? ' data-col="' + esc(g.col) + '"' : '') + (g.mirror ? ' data-mirror' : '') + '>' + (g.label ? '<div class="u-multi-group-label">' + esc(g.label) + '</div>' : '') + '<div class="u-chips-row">' + (field.options||[]).filter(o => o.group === g.id).map(chip).join('') + '</div></div>';
    const sideAttr = field.columns ? (' data-side="' + esc(field.side || 'right') + '"' + (field.sideFrom ? ' data-side-from="' + esc(field.sideFrom) + '"' : '')) : '';
    if (field.groups && field.groups.length) {
      const groups = field.groups, ungrouped = (field.options||[]).filter(o => !o.group);
      let body = (ungrouped.length ? '<div class="u-chips-row">' + ungrouped.map(chip).join('') + '</div>' : '');
      if (field.columns) {
        const medG = groups.filter(g => g.col === 'medial'), latG = groups.filter(g => g.col === 'lateral');
        const centers = groups.filter(g => g.col !== 'medial' && g.col !== 'lateral');
        body += centers.map(groupHtml).join('');
        if (medG.length && latG.length) {
          const colHtml = (grps, c) => '<div class="u-multi-col" data-col="' + c + '">' + grps.map(groupHtml).join('') + '</div>';
          body += '<div class="u-multi-pair">' + colHtml(latG, 'lateral') + colHtml(medG, 'medial') + '</div>';
        } else { body += medG.concat(latG).map(groupHtml).join(''); }
      } else {
        body += groups.map(groupHtml).join('');
      }
      return '<div class="u-multi u-chips u-chips-grouped"' + dn + def + sideAttr + '>' + body + '</div>';
    }
    return '<div class="u-multi u-chips"' + dn + def + sideAttr + '>' + (field.options||[]).map(chip).join('') + '</div>';
  }
  function gateSummary(field, state) {
    const st = state[field.id + '_status']; if (st == null) return '';
    const opt = (field.gate.options.find(o => o.value === st) || {});
    if (st !== field.gate.active) return opt.label || '';
    const sel = Array.isArray(state[field.id]) ? state[field.id] : [];
    if (!sel.length) return opt.label || '';
    const groups = field.groups || [];
    const parts = groups.map(g => { const labs = (field.options||[]).filter(o => o.group === g.id && sel.includes(o.value)).map(o => o.label); return labs.length ? (g.label + ' ' + labs.join('/')) : null; }).filter(Boolean);
    return (opt.label || '') + (parts.length ? ': ' + parts.join(' · ') : '');
  }
  // importância da opção (radio/multi não-compactos): bordo-esquerdo verde/âmbar/vermelho (mesmos tons do result)
  function optToneCls(o) { return o && ['ok', 'warn', 'critical'].indexOf(o.tone) >= 0 ? ' tone-' + o.tone : ''; }
  function renderField(field, uid) {
    if (field.type === 'separator')
      return '<div class="u-stack-sep"><span>' + esc(field.label || '') + '</span></div>';
    if (field.id == null) { console.warn('[u-stack] campo sem id (ignorado):', field); return ''; }
    const fid = field.id, dn = ' data-name="' + esc(fid) + '"', def = field.default != null ? ' data-default="' + esc(field.default) + '"' : '';
    let inner = '';
    if (field.type === 'single') {
      const dens = inferDensity(field);
      if (dens === 'segmented') {
        inner = '<div class="u-seg"' + dn + def + '>' +
          (field.options||[]).map(o => '<label class="u-seg-btn teal' + (o.value === field.default ? ' sel' : '') + '"' + (o.finding ? ' data-finding' : '') + '><input type="radio" name="' + esc(fid) + '" value="' + esc(o.value) + '"' + (o.value === field.default ? ' checked' : '') + '><span class="u-seg-txt">' + esc(o.label) + '</span>' + (o.desc ? '<span class="u-info"><i>i</i><span class="u-info-pop">' + esc(o.desc) + '</span></span>' : '') + '</label>').join('') + '</div>';
      } else {
        // 'buttons' = densidade fiel ao .opt do KMSR (botões com borda própria, flow-wrap, fill teal, sem bolinha);
        // 'cards' = rádio vertical com bolinha. Mesmo markup/eventos; só muda a classe do container.
        inner = '<div class="u-radio' + (dens === 'buttons' ? ' u-btns' : '') + '"' + dn + def + '>' +
          (field.options||[]).map(o => '<label class="u-opt' + optToneCls(o) + '"><input type="radio" name="' + esc(fid) + '" value="' + esc(o.value) + '"><span class="u-radio-dot"></span><span class="u-opt-txt"><span class="u-opt-l">' + esc(o.label) + '</span>' + (o.desc ? '<span class="u-opt-d">' + esc(o.desc) + '</span>' : '') + '</span></label>').join('') + '</div>';
      }
    } else if (field.type === 'decision') {
      inner = '<div class="u-decision"' + dn + '>' +
        '<div class="u-decision-verdict tone-info">' +
          '<div class="u-decision-label"></div>' +
          '<ul class="u-decision-reasons"></ul>' +
          '<details class="u-decision-criteria"><summary>Critérios</summary><ul></ul></details>' +
        '</div>' +
        '<div class="u-radio u-btns u-decision-opts">' +
          (field.options||[]).map(o => '<label class="u-opt"><input type="radio" name="' + esc(fid) + '" value="' + esc(o.value) + '"><span class="u-radio-dot"></span><span class="u-opt-txt"><span class="u-opt-l">' + esc(o.label) + '</span></span></label>').join('') +
        '</div>' +
      '</div>';
    } else if (field.type === 'multi') {
      if (field.layout === 'zones') {
        inner = '<div class="u-multi u-zones"' + dn + ' data-side="' + esc(field.side || 'right') + '"' + (field.sideFrom ? ' data-side-from="' + esc(field.sideFrom) + '"' : '') + '>' + zonesInnerHtml(field, field.side || 'right') + '</div>';
      } else if (inferDensity(field) === 'chips') {
        const chipsHtml = multiChipsHtml(field, dn, def);
        if (field.gate) {
          const g = field.gate, dflt = g.default || (g.options[0] || {}).value;
          const seg = '<div class="u-seg u-mgate-seg" data-name="' + esc(fid) + '__status">' +
            g.options.map(o => '<label class="u-seg-btn teal' + (o.value === dflt ? ' sel' : '') + '"' + (o.finding ? ' data-finding' : '') + '><input type="radio" name="' + esc(fid) + '__status" value="' + esc(o.value) + '"' + (o.value === dflt ? ' checked' : '') + '><span class="u-seg-txt">' + esc(o.label) + '</span></label>').join('') + '</div>';
          inner = '<div class="u-mgate" data-name="' + esc(fid) + '__gate" data-active="' + esc(g.active) + '">' + seg + '<div class="u-mgate-grid">' + chipsHtml + '</div></div>';
        } else {
          inner = chipsHtml;
        }
      } else {
        inner = '<div class="u-multi"' + dn + def + '>' +
          (field.options||[]).map(o => '<label class="u-mopt' + optToneCls(o) + '"><input type="checkbox" value="' + esc(o.value) + '"' + (o.none ? ' data-none' : '') + '><span class="u-check"></span><span class="u-opt-txt"><span class="u-opt-l">' + esc(o.label) + (o.info ? ' <span class="u-info"><i>i</i><span class="u-info-pop">' + esc(o.info) + '</span></span>' : '') + '</span>' + (o.desc ? '<span class="u-opt-d">' + esc(o.desc) + '</span>' : '') + '</span></label>').join('') + '</div>';
      }
    } else if (field.type === 'numeric') {
      const da = ['hardMin','hardMax','softMin','softMax'].map(k => field[k] != null ? ' data-' + k.replace(/([A-Z])/g,'-$1').toLowerCase() + '="' + esc(String(field[k])) + '"' : '').join('') +
        (field.analyte ? ' data-analyte="' + esc(field.analyte) + '"' : '') + (field.sex ? ' data-sex="' + esc(field.sex) + '"' : '');
      inner = '<div class="u-field"' + dn + def + '><div class="u-num-row"><input class="u-input u-num" type="number"' + da + '>' + (field.unit ? '<span class="u-num-unit">' + esc(field.unit) + '</span>' : '') + '</div><div class="u-msg"></div></div>';
    } else if (field.type === 'text') {
      // texto livre curto (detalhes clínicos); sem validação — estado = string aparada (undefined se vazio)
      inner = '<div class="u-field"' + dn + def + '><input class="u-input u-text" type="text" style="width:100%"' +
        (field.placeholder ? ' placeholder="' + esc(field.placeholder) + '"' : '') + '></div>';
    } else if (field.type === 'imc') {
      const wr = field.weightRange || [20, 300], hr = field.heightRange || [80, 230], br = field.bmiRange || [12, 60];
      const ranges = ' data-name="' + esc(fid) + '" data-wrange="' + esc(JSON.stringify(wr)) + '" data-hrange="' + esc(JSON.stringify(hr)) + '" data-brange="' + esc(JSON.stringify(br)) + '"';
      inner = '<div class="u-imc"' + ranges + '>' +
        '<div class="u-imc-group"><input class="u-input u-imc-in" data-imc="direct" type="number" inputmode="decimal" placeholder="IMC"><span class="u-imc-unit">kg/m²</span></div>' +
        '<span class="u-imc-or">ou</span>' +
        '<div class="u-imc-group"><input class="u-input u-imc-in" data-imc="weight" type="number" inputmode="decimal" placeholder="Peso"><span class="u-imc-unit">kg</span>' +
        '<input class="u-input u-imc-in" data-imc="height" type="number" inputmode="decimal" placeholder="Altura"><span class="u-imc-unit">cm</span></div>' +
        '</div><div class="u-imc-class" aria-live="polite"></div>';
    } else if (field.type === 'berger') {
      const nm = esc(fid);
      const toggle = '<div class="u-seg u-berger-toggle" data-name="' + nm + '__na">' +
        '<label class="u-seg-btn teal sel"><input type="radio" name="' + nm + '__na" value="measured" checked><span>Medido</span></label>' +
        '<label class="u-seg-btn teal"><input type="radio" name="' + nm + '__na" value="na"><span>Sem TC disponível</span></label>' +
        '</div>';
      const inputs = '<div class="u-berger-inputs">' +
        '<div class="u-field"><label class="u-berger-lab">Rotação femoral externa vs TEA</label><div class="u-num-row"><input class="u-input u-num u-berger-fem" data-berger="fem" type="number" inputmode="decimal" step="0.5" placeholder="ex: 3"><span class="u-num-unit">° RE</span></div><div class="u-msg"></div></div>' +
        '<div class="u-field"><label class="u-berger-lab">Rotação tibial externa vs eixo TTA</label><div class="u-num-row"><input class="u-input u-num u-berger-tib" data-berger="tib" type="number" inputmode="decimal" step="0.5" placeholder="ex: 18"><span class="u-num-unit">° RE</span></div><div class="u-msg"></div></div>' +
        '</div>';
      inner = '<div class="u-berger u-isdef" data-name="' + nm + '">' + toggle +
        '<div class="u-berger-body">' + bergerFigsHtml() + inputs +
        '<div class="u-berger-read" aria-live="polite"></div></div></div>';
    } else if (field.type === 'onset') {
      // Campo "tempo de evolução": modo duração (número + unidade) ou modo data de início
      const dm = field.durMax || 80, nm = esc(fid);
      const unitSeg = ['weeks', 'months', 'years'].map(u => '<label class="u-seg-btn teal' + (u === 'weeks' ? ' sel' : '') + '"><input type="radio" name="' + nm + '__unit" value="' + u + '"' + (u === 'weeks' ? ' checked' : '') + '><span class="u-seg-txt">' + (u === 'weeks' ? 'sem' : u === 'months' ? 'meses' : 'anos') + '</span></label>').join('');
      const dateCells = [['yr', 'Ano', 'AAAA'], ['mo', 'Mês', 'MM'], ['dy', 'Dia', 'DD']].map(c => '<div class="u-date-cell"><label class="u-label">' + c[1] + '</label><input class="u-input u-' + c[0] + '" data-' + c[0] + ' inputmode="numeric" placeholder="' + c[2] + '"></div>').join('');
      inner = '<div class="u-onset" data-name="' + nm + '" data-durmax="' + dm + '">' +
        '<div class="u-onset-row" data-mode-row="duration"><label class="u-onset-radio"><input type="radio" name="' + nm + '__mode" value="duration" checked><span></span></label><div class="u-onset-ctl"><input class="u-input u-onset-dur" type="number" min="1" max="' + dm + '" inputmode="numeric" placeholder="—"><div class="u-seg u-onset-unit" data-name="' + nm + '__unit">' + unitSeg + '</div></div></div>' +
        '<div class="u-onset-row" data-mode-row="date"><label class="u-onset-radio"><input type="radio" name="' + nm + '__mode" value="date"><span></span></label><div class="u-onset-ctl"><div class="u-date" data-name="' + nm + '__date">' + dateCells + '</div></div></div>' +
        '<div class="u-onset-read"></div></div>';
    } else if (field.type === 'episodes') {
      const nm = esc(fid);
      const toggle = '<div class="u-seg u-episodes-toggle" data-name="' + nm + '__rec">' +
        '<label class="u-seg-btn teal sel"><input type="radio" name="' + nm + '__rec" value="first" checked><span class="u-seg-txt">1.º episódio</span></label>' +
        '<label class="u-seg-btn teal"><input type="radio" name="' + nm + '__rec" value="recurrent"><span class="u-seg-txt">Recorrente</span></label>' +
        '</div>';
      inner = '<div class="u-episodes u-isdef" data-name="' + nm + '">' + toggle +
        '<div class="u-episodes-list" hidden><div class="u-ep-rows"></div>' +
        '<button type="button" class="u-ep-add">+ Adicionar episódio</button></div></div>';
    } else if (field.type === 'custom' && typeof field.render === 'function') {
      inner = field.render(field, { uid });
    }
    const info = field.info ? ' <span class="u-info"><i>i</i><span class="u-info-pop">' + esc(field.info) + '</span></span>' : '';
    const label = (field.type === 'numeric' || field.type === 'text' || field.type === 'single' || field.type === 'multi' || field.type === 'imc' || field.type === 'onset' || field.type === 'episodes' || field.type === 'berger' || field.type === 'decision')
      ? '<label class="u-label">' + esc(field.label || '') + info + '</label>' : '';
    const validate = typeof field.validate === 'function' ? '<div class="u-note u-note-validate" hidden></div>' : '';
    return '<div class="u-stack-field" data-fid="' + esc(fid) + '">' + label + inner + validate + '</div>';
  }
  function renderNote(note, i) {
    const kind = note.type === 'engine' ? 'engine' : 'objective';
    const reactive = typeof note.compute === 'function';
    const title = (!reactive && note.title != null) ? esc(note.title) : '';
    const body = (!reactive && note.html != null) ? String(note.html) : '';   // html autoral (config), como o decision
    return '<div class="u-note kind-' + kind + ' tone-' + pickTone(note.tone, 'info') + '" data-kind="' + kind + '" data-note-idx="' + i + '">' +
      '<div class="u-note-title">' + title + '</div>' +
      '<div class="u-note-body">' + body + '</div></div>';
  }
  function renderCardTop(mod) {
    let h = '';
    if (mod.subtitle != null && mod.subtitle !== '') h += '<div class="u-card-sub">' + esc(mod.subtitle) + '</div>';
    if (Array.isArray(mod.notes)) h += mod.notes.map(renderNote).join('');
    if (mod.skip) {   // botão "saltar": cinza, à direita, acima dos campos
      const lbl = typeof mod.skip === 'string' ? mod.skip : (mod.skip.label || 'Saltar');
      h += '<div class="u-card-skip-row"><button type="button" class="u-card-skip" data-skip>' + esc(lbl) + '</button></div>';
    }
    return h;
  }
  function renderResultNote(mod) {
    if (!mod.result) return '';
    return '<div class="u-note u-note-result tone-info">' +
      '<div class="u-note-result-head"><span class="u-note-val" style="display:none"></span><span class="u-note-max" style="display:none"></span></div>' +
      '<div class="u-note-label"></div>' +
      '<ul class="u-decision-reasons"></ul>' +
      '<details class="u-decision-criteria" style="display:none"><summary>Critérios</summary><ul></ul></details>' +
      '</div>';
  }
  function renderModule(mod, uid) {
    return '<div class="u-module" data-mid="' + esc(mod.id) + '" id="' + uid + '_' + esc(String(mod.id).replace(/\s+/g, '_')) + '">' +
      '<div class="u-module-head"><h3>' + (mod.icon ? esc(mod.icon) + ' ' : '') + esc(mod.title) + '</h3><span class="u-mod-ind">● Alterações</span></div>' +
      '<div class="u-module-body">' + renderCardTop(mod) + (mod.fields||[]).map(f => renderField(f, uid)).join('') + renderResultNote(mod) + '</div></div>';
  }
  function renderSection(mod, uid, idx) {
    const normalizable = (mod.fields || []).some(f => f && 'normal' in f);
    const normalCb = normalizable
      ? '<label class="u-sec-normal"><input type="checkbox"><span>' + esc(mod.normalLabel || 'normal') + '</span></label>'
      : '';
    return '<div class="u-sec" data-mid="' + esc(mod.id) + '" id="' + uid + '_' + esc(String(mod.id).replace(/\s+/g, '_')) + '">' +
      '<div class="u-sec-head">' +
        '<span class="u-sec-num todo">' + (idx + 1) + '</span>' +
        '<span class="u-sec-t">' + (mod.icon ? esc(mod.icon) + ' ' : '') + esc(mod.title) + '</span>' +
        normalCb +
        '<span class="u-sec-chev">▾</span>' +
      '</div>' +
      '<div class="u-sec-sum"></div>' +
      '<div class="u-sec-body">' + renderCardTop(mod) + (mod.fields || []).map(f => renderField(f, uid)).join('') + renderResultNote(mod) + '</div>' +
    '</div>';
  }
  function isProgConfirm(field) {
    return field.type === 'multi' || field.type === 'numeric' || field.type === 'text' || field.type === 'imc'
        || field.type === 'onset' || field.type === 'berger' || field.type === 'episodes';
  }
  // Confirmar so ativa com valor nestes tipos (multi/text vazios = "nenhum", sao confirmaveis)
  function progNeedsValue(field) {
    return ['single', 'numeric', 'imc', 'onset', 'berger'].indexOf(field.type) !== -1;
  }
  function renderStep(field, uid, idx) {
    if (field.type === 'separator') return renderField(field, uid);
    return '<div class="u-pstep" data-fid="' + esc(field.id) + '">' +
      '<div class="u-pstep-head"><span class="u-pstep-num">' + (idx + 1) + '</span>' +
        '<span class="u-pstep-t">' + esc(field.label || '') + '</span>' +
        '<span class="u-pstep-sum"></span>' +
        '<button type="button" class="u-pstep-edit">Alterar</button></div>' +
      '<div class="u-pstep-body">' + renderField(field, uid) +
        '<div class="u-pstep-actions">' +
          '<div class="u-pstep-actions-l"></div>' +
          '<div class="u-pstep-actions-r"><button type="button" class="u-pstep-confirm">Confirmar →</button></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }
  function labelForValue(field, value) {
    if (value == null || value === '') return '';
    if (field.type === 'imc') return UBNIC.imcClass(value).text;
    if (field.type === 'berger') return '';
    if (field.type === 'onset') return '';
    if (field.type === 'episodes') return '';
    if (field.type === 'numeric') return field.unit ? value + field.unit : '' + value;
    if (field.type === 'text') return '' + value;
    const opts = field.options || [];
    if (field.type === 'multi' && field.gate) return '';
    if (field.type === 'multi' && field.layout === 'zones') return zonesSummary(field, value);
    if (field.type === 'multi') return (Array.isArray(value) ? value : []).map(v => (opts.find(o => o.value === v) || {}).label || v).join(', ');
    const o = opts.find(o => o.value === value); return o ? o.label : '' + value;
  }
  function stripTags(s) { return String(s).replace(/<[^>]*>/g, ''); }

  UBNIC.stack = function (target, opts) {
    const el = typeof target === 'string' ? $(target) : target; if (!el || !opts) return null;
    const uid = 'ustk' + (stackSeq++);
    const inst = { el: el, uid: uid, modules: opts.modules || [], name: opts.name || 'stack', opts: opts, state: {} };
    el.classList.add('u-stack');
    if (opts.boxedFields) el.classList.add('u-stack-boxed'); // opt-in: cada campo num sub-painel sólido
    inst._sections = !!opts.sections;
    if (inst._sections) el.classList.add('u-sections');
    inst._progressive = !!opts.progressive;
    if (inst._progressive && inst._sections) { console.warn('[u-stack] sections e progressive são mutuamente exclusivos; a usar progressive'); inst._sections = false; el.classList.remove('u-sections'); }
    if (inst._progressive) el.classList.add('u-progressive');
    // singleDensity: força densidade uniforme nos campos single sem density/ordinal explícitos
    if (opts.singleDensity) inst.modules.forEach(m => (m.fields||[]).forEach(f => { if (f.type === 'single' && !f.density && !f.ordinal) f.density = opts.singleDensity; }));
    el.innerHTML = inst._progressive
      ? inst.modules.flatMap(m => m.fields || []).map((f, i) => renderStep(f, uid, i)).join('')
      : inst.modules.map((m, i) => inst._sections ? renderSection(m, uid, i) : renderModule(m, uid)).join('');
    UBNIC.refresh();
    inst._onChange = (e) => {
      const root = e.target.closest && e.target.closest('.u-stack-field');
      const fid = root ? root.getAttribute('data-fid') : null;
      if (inst._progressive && fid) {
        const field = _findField(inst, fid);
        if (field && !isProgConfirm(field)) { progMarkDone(inst, fid); return; }   // single auto-avança
        // onset: escolher a unidade (sem/meses/anos) com numero valido e o gesto de fecho -> conclui
        if (field && field.type === 'onset' && e.target.closest && e.target.closest('.u-onset-unit')) {
          afterChange(inst, fid);   // recalcula com a unidade nova ANTES de decidir
          if (inst.state[fid] != null && !(root && root.querySelector('.has-error'))) progMarkDone(inst, fid);
          return;
        }
      }
      afterChange(inst, fid);
      if (inst._progressive) { const a = inst.el.querySelector('.u-pstep.active'); if (a && a.scrollIntoView) a.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      else if (opts.autoAdvance && root && e.target.closest && e.target.closest('.u-radio, .u-seg')) {
        // dentro de um composto (onset), só avança com valor válido
        if (!e.target.closest('.u-onset') || inst.state[fid] != null) advanceToNext(inst, root);
      }
    };
    el.addEventListener('u:change', inst._onChange);
    // Numéricos SEM validação não disparam u:change sozinhos → capturar via 'input'
    inst._onInput = (e) => {
      const t = e.target;
      if (t.matches && ((t.matches('.u-num') && !t.matches('[data-hard-min],[data-hard-max],[data-soft-min],[data-soft-max],[data-analyte],[data-sex]')) || t.matches('.u-text'))) {
        const root = t.closest('.u-stack-field'); afterChange(inst, root ? root.getAttribute('data-fid') : null);
      }
    };
    el.addEventListener('input', inst._onInput);
    inst._onHead = (e) => { const head = e.target.closest('.u-module-head'); if (head && inst.el.contains(head) && opts.collapsible !== false) head.parentNode.classList.toggle('collapsed'); };
    el.addEventListener('click', inst._onHead);
    inst._onSec = (e) => {
      if (!inst._sections) return;
      if (e.target.closest('.u-sec-normal')) return; // o checkbox é tratado à parte
      const head = e.target.closest('.u-sec-head'); if (!head || !inst.el.contains(head)) return;
      const sec = head.closest('.u-sec'); const mid = sec.getAttribute('data-mid');
      inst.state['_collapsed_' + mid] = !inst.state['_collapsed_' + mid];
      syncSections(inst);
    };
    el.addEventListener('click', inst._onSec);
    inst._onSecChange = (e) => {
      if (!inst._sections) return;
      const cb = e.target;
      if (!cb.matches || !cb.matches('.u-sec-normal input')) return;
      const sec = cb.closest('.u-sec'); if (!sec) return;
      markSectionNormal(inst, sec.getAttribute('data-mid'), cb.checked);
    };
    el.addEventListener('change', inst._onSecChange);
    inst._onStep = (e) => {
      if (!inst._progressive) return;
      const conf = e.target.closest('.u-pstep-confirm');
      if (conf) {
        const step = conf.closest('.u-pstep'); const fid = step.getAttribute('data-fid');
        if (step.querySelector('.has-error')) return;   // não avança com erro de validação
        progMarkDone(inst, fid);
        return;
      }
      const edit = e.target.closest('.u-pstep-edit');
      if (edit) {
        const step = edit.closest('.u-pstep'); const fid = step.getAttribute('data-fid');
        delete inst.state['_done_' + fid]; afterChange(inst, fid);
        const a = inst.el.querySelector('.u-pstep.active'); if (a && a.scrollIntoView) a.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    };
    el.addEventListener('click', inst._onStep);
    inst._onSkip = (e) => {
      const btn = e.target.closest('[data-skip]'); if (!btn || !inst.el.contains(btn)) return;
      const card = btn.closest('[data-mid]'); if (!card) return;
      const mid = card.getAttribute('data-mid');
      const mod = inst.modules.find(m => String(m.id) === mid);
      inst.state['_skipped_' + mid] = true;
      if (inst._sections) { inst.state['_collapsed_' + mid] = true; syncSections(inst); }
      else card.classList.add('collapsed');
      inst.el.dispatchEvent(new CustomEvent('u:skip', { bubbles: true, detail: { name: inst.name, module: mid, state: Object.assign({}, inst.state) } }));
      if (mod && mod.skip && typeof mod.skip.onSkip === 'function') { try { mod.skip.onSkip(inst.state); } catch (err) { console.warn('[u-skip] onSkip lançou:', mid, err); } }
    };
    el.addEventListener('click', inst._onSkip);
    inst._onStepBlur = (e) => {
      if (!inst._progressive) return;
      const t = e.target; if (!t.matches || !t.matches('.u-num, .u-input')) return;
      const step = t.closest('.u-pstep'); if (!step || !step.classList.contains('active')) return;
      const fid = step.getAttribute('data-fid'); const field = _findField(inst, fid);
      // numerico/imc/berger: concluem no blur/change com valor completo e valido.
      // onset NAO: o blur do numero dispara antes do clique na unidade (mousedown) e gravaria a unidade errada -
      // conclui no clique da unidade (ver _onChange) ou com Enter (ver _onStepKey).
      if (!field || ['numeric', 'imc', 'berger'].indexOf(field.type) === -1) return;
      if (inst.state[fid] == null || step.querySelector('.has-error')) return; // so com valor valido
      progMarkDone(inst, fid);
    };
    el.addEventListener('change', inst._onStepBlur);
    // Enter conclui o passo ativo (paridade com o numerico standalone): texto sempre; compostos com valor valido.
    // Listener no document: ao clicar num cartao (label) o foco pode ficar no body (Safari nao foca o checkbox)
    // e o keydown nunca chegaria ao elemento do stack.
    inst._onStepKey = (e) => {
      if (!inst._progressive || e.key !== 'Enter') return;
      const t = e.target;
      let step = null;
      if (t && t.closest && inst.el.contains(t)) {
        if (t.matches && t.matches('textarea')) return;   // nao roubar o Enter a textareas
        step = t.closest('.u-pstep');
      } else if (!t || t === document.body || t === document.documentElement) {
        step = inst.el.querySelector('.u-pstep.active'); // sem foco util -> o passo ativo deste stack
      } else {
        return;   // foco num elemento de outra zona da pagina - nao interferir
      }
      if (!step || !step.classList.contains('active')) return;
      const fid = step.getAttribute('data-fid'); const field = _findField(inst, fid);
      if (!field || !isProgConfirm(field)) return;
      if (step.querySelector('.has-error')) return;
      if (progNeedsValue(field) && inst.state[fid] == null) return;
      e.preventDefault();
      progMarkDone(inst, fid);
    };
    document.addEventListener('keydown', inst._onStepKey);
    syncVisibility(inst);   // sync inicial: esconde condicionais (showIf falso) já no init, sem disparar u:stack
    syncIndicators(inst);
    if (inst._sections) syncSections(inst);
    if (inst._progressive) syncProgressive(inst);
    if (opts.nav) { buildStackNav(inst); initStackSpy(inst); syncIndicators(inst); }
    if (opts.applyDefaults) {
      inst.modules.forEach(function (m) { (m.fields || []).forEach(function (f) { if (f.type !== 'separator' && f.default != null) inst.state[f.id] = (f.type === 'multi') ? [f.default] : f.default; }); });
      applyStateToDOM(inst);
    }
    if (opts.initial) { Object.assign(inst.state, opts.initial); applyStateToDOM(inst); }
    markProgHydrated(inst); if (inst._progressive) syncProgressive(inst);
    syncZonesSide(inst);
    el._ustack = inst;
    return makeStackController(inst);
  };
  function fieldRoot(inst, fid) { return inst.el.querySelector('.u-stack-field[data-fid="' + fid + '"]'); }
  function readFieldValue(field, root) {
    if (!root) return undefined;
    if (field.type === 'single' || field.type === 'decision') {
      const seg = root.querySelector('.u-seg'); if (seg) { const c = seg.querySelector('input:checked'); return c ? c.value : undefined; }
      const r = root.querySelector('input[type=radio]:checked'); return r ? r.value : undefined;
    }
    if (field.type === 'multi') {
      const v = [...root.querySelectorAll('input[type=checkbox]:checked')].map(c => c.value);
      return v.length ? v : undefined;
    }
    if (field.type === 'numeric') { const i = root.querySelector('input'); return i && i.value !== '' ? parseFloat(i.value) : undefined; }
    if (field.type === 'text') { const i = root.querySelector('input.u-text'); return i && i.value.trim() !== '' ? i.value.trim() : undefined; }
    if (field.type === 'custom' && typeof field.value === 'function') return field.value(root);
    return undefined;
  }
  function recomputeState(inst) {
    const keep = {};   // preserva o estado meta das secções (não vem do DOM) — senão perde-se a cada recompute
    for (const k in inst.state) { if (k.indexOf('_collapsed_') === 0 || k.indexOf('_normal_') === 0 || k.indexOf('_done_') === 0 || k.indexOf('_skipped_') === 0) keep[k] = inst.state[k]; }
    inst.state = keep;
    for (const m of inst.modules) for (const f of (m.fields||[])) {
      if (f.type === 'separator') continue;
      if (f.type === 'imc') {
        const root = fieldRoot(inst, f.id);
        if (root) {
          const imcEl = root.querySelector('.u-imc');
          const R = { w: f.weightRange || [20, 300], h: f.heightRange || [80, 230], b: f.bmiRange || [12, 60] };
          const r = imcFrom(
            (imcEl.querySelector('[data-imc="direct"]') || {}).value,
            (imcEl.querySelector('[data-imc="weight"]') || {}).value,
            (imcEl.querySelector('[data-imc="height"]') || {}).value, R);
          if (r.bmi !== undefined) inst.state[f.id] = r.bmi;
          if (r.weight !== undefined) inst.state[f.id + '_weight'] = r.weight;
          if (r.height !== undefined) inst.state[f.id + '_height'] = r.height;
        }
        continue;
      }
      if (f.type === 'berger') {
        const root = fieldRoot(inst, f.id);
        if (root) {
          const el = root.querySelector('.u-berger');
          const na = (el.querySelector('.u-berger-toggle input:checked') || {}).value === 'na';
          inst.state[f.id + '_na'] = na;
          if (na) { inst.state[f.id] = null; }
          else {
            const fem = bergerPlausible((el.querySelector('.u-berger-fem') || {}).value, BERGER_BOUNDS.fem);
            const tib = bergerPlausible((el.querySelector('.u-berger-tib') || {}).value, BERGER_BOUNDS.tib);
            if (fem != null) inst.state[f.id + '_fem'] = fem;
            if (tib != null) inst.state[f.id + '_tib'] = tib;
            const r = bergerCombined(fem, tib);
            if (r.combined != null) inst.state[f.id] = r.combined;
          }
        }
        continue;
      }
      if (f.type === 'multi' && f.gate) {
        const root = fieldRoot(inst, f.id);
        if (root) {
          const status = (root.querySelector('.u-mgate-seg input:checked') || {}).value || f.gate.default;
          inst.state[f.id + '_status'] = status;
          if (status === f.gate.active) {
            const v = [...root.querySelectorAll('.u-mgate-grid input[type=checkbox]:checked')].map(c => c.value);
            inst.state[f.id] = v;   // gate ativo: array (mesmo vazio) → respondido; fora do gate ativo, o próprio estado já é resposta completa (como episodes)
          } else {
            inst.state[f.id] = [];
          }
        }
        continue;
      }
      if (f.type === 'onset') {
        const root = fieldRoot(inst, f.id);
        if (root) {
          const oe = root.querySelector('.u-onset');
          const mode = (oe.querySelector('.u-onset-radio input:checked') || {}).value || 'duration';
          const dur = (oe.querySelector('.u-onset-dur') || {}).value;
          const unit = (oe.querySelector('.u-onset-unit input:checked') || {}).value || 'weeks';
          const de = oe.querySelector('.u-date'), df = de ? readDateFields(de) : {};
          const data = mode === 'duration' ? { dur: dur, unit: unit, durMax: f.durMax } : { yr: df.yr, mo: df.mo, dy: df.dy, durMax: f.durMax };
          const r = onsetFrom(mode, data, new Date());
          inst.state[f.id + '_mode'] = mode;
          if (mode === 'duration') { if (dur !== '' && dur != null && !r.error) { inst.state[f.id + '_dur'] = parseInt(dur, 10); inst.state[f.id + '_unit'] = unit; } }
          else { if (df.yr) inst.state[f.id + '_year'] = df.yr; if (df.mo) inst.state[f.id + '_month'] = df.mo; if (df.dy) inst.state[f.id + '_day'] = df.dy; }
          if (r.weeks != null) { inst.state[f.id] = r.weeks; inst.state[f.id + '_min'] = r.min; inst.state[f.id + '_max'] = r.max; }
        }
        continue;
      }
      if (f.type === 'episodes') {
        const root = fieldRoot(inst, f.id);
        if (root) {
          const epEl = root.querySelector('.u-episodes');
          const recurrent = (epEl.querySelector('.u-episodes-toggle input:checked') || {}).value === 'recurrent';
          inst.state[f.id + '_recurrent'] = recurrent;
          if (recurrent) {
            const eps = [];
            epEl.querySelectorAll('.u-ep-row').forEach(row => { const mo = row.querySelector('[data-mo]'); const df = readDateFields(row); const moBad = mo && mo.value !== '' && df.mo == null; if (df.yr != null && !moBad) eps.push({ y: df.yr, m: df.mo }); });   // ano válido basta; m=null = precisão ao ano
            if (eps.length) inst.state[f.id] = eps;   // recorrente: só respondido com ≥1 episódio válido
          } else {
            inst.state[f.id] = [];   // "1.º episódio" é uma resposta completa → conta como respondido (spec)
          }
        }
        continue;
      }
      const v = readFieldValue(f, fieldRoot(inst, f.id));
      if (v !== undefined) inst.state[f.id] = v;
    }
  }
  function isDefField(field, state) {
    if (field.type === 'multi' && field.layout === 'zones' && field.noneLabel) {
      const v = state[field.id];                                    // zones: "sem dor" (só a célula none) = baseline NÃO-patológico
      if (v === undefined) return true;
      return Array.isArray(v) && v.length === 1 && v[0] === 'none';  // qualquer zona marcada = achado
    }
    if (field.type === 'multi' && field.gate) {
      const st = state[field.id + '_status'];
      if (st === undefined) return true;
      if (st === field.gate.active) return !(Array.isArray(state[field.id]) && state[field.id].length);
      const opt = field.gate.options.find(o => o.value === st) || {};
      return !opt.finding;
    }
    const v = state[field.id];
    if (v === undefined) return true;
    if (field.normal != null && v === field.normal) return true;   // valor 'normal' = examinado-normal = não-patológico
    if (field.default == null) return false;                        // sem default: qualquer valor definido (≠ normal) = achado
    if (Array.isArray(v)) return v.length === 1 && v[0] === field.default; // field.default escalar (ex.: 'none' ≡ DEFAULTS_MULTI ['none'] do KMSR)
    return v === field.default;
  }
  function makeStackController(inst) {
    return {
      getState: () => Object.assign({}, inst.state),
      getResult: () => buildResult(inst),
      setState: (o) => { Object.assign(inst.state, o); markProgHydrated(inst); applyStateToDOM(inst); afterChange(inst, null); },
      reset: () => resetStack(inst),
      refresh: () => afterChange(inst, null),
      destroy: () => destroyStack(inst),
      getModules: () => inst.modules,
      getEl: () => inst.el,
    };
  }
  function buildResult(inst) {
    const isDef = {}, modules = [];
    for (const m of inst.modules) {
      let path = false;
      for (const f of (m.fields||[])) { if (f.type === 'separator') continue; const d = isDefField(f, inst.state); isDef[f.id] = d; if (!d) path = true; }
      modules.push({ id: m.id, hasPathology: path });
    }
    // getResult() = estado limpo (sem o cosmético _collapsed_); o evento u:stack leva o estado cru (inclui _collapsed_)
    const pub = {}; for (const k in inst.state) { if (k.indexOf('_collapsed_') === 0 || k.indexOf('_done_') === 0 || k.indexOf('_skipped_') === 0) continue; pub[k] = inst.state[k]; }
    return { state: pub, isDef: isDef, modules: modules };
  }
  function applyStateToDOM(inst) {
    for (const m of inst.modules) for (const f of (m.fields||[])) {
      if (f.type === 'separator') continue;
      const root = fieldRoot(inst, f.id), v = inst.state[f.id]; if (!root) continue;
      if (f.type === 'single') {
        const seg = root.querySelector('.u-seg');
        if (seg) { seg.querySelectorAll('.u-seg-btn').forEach(l => { const i = l.querySelector('input'); i.checked = (i.value === v); l.classList.toggle('sel', i.checked); }); }
        else root.querySelectorAll('input[type=radio]').forEach(i => i.checked = i.value === v);
      } else if (f.type === 'decision') {
        root.querySelectorAll('.u-decision-opts input[type=radio]').forEach(i => i.checked = i.value === v);
        const dEl = root.querySelector('.u-decision'); if (dEl) evalDecision(dEl, f, inst.state);
      } else if (f.type === 'multi' && f.gate) {
        const status = inst.state[f.id + '_status'] || f.gate.default;
        root.querySelectorAll('.u-mgate-seg input').forEach(i => i.checked = i.value === status);
        const arr = Array.isArray(inst.state[f.id]) ? inst.state[f.id] : [];
        root.querySelectorAll('.u-mgate-grid input[type=checkbox]').forEach(i => i.checked = arr.includes(i.value));
        const ge = root.querySelector('.u-mgate'); if (ge) evalGate(ge);
      } else if (f.type === 'multi') {
        const arr = Array.isArray(v) ? v : []; root.querySelectorAll('input[type=checkbox]').forEach(i => i.checked = arr.includes(i.value));
        if (arr.length === 0) { const nb = root.querySelector('input[data-none]'); if (nb) nb.checked = true; }
      } else if (f.type === 'numeric') { const i = root.querySelector('input'); if (i) i.value = v != null ? v : ''; }
      else if (f.type === 'text') { const i = root.querySelector('input.u-text'); if (i) i.value = v != null ? v : ''; }
      else if (f.type === 'imc') {
        const imcEl = root.querySelector('.u-imc');
        if (imcEl) {
          const w = inst.state[f.id + '_weight'], h = inst.state[f.id + '_height'], bmi = inst.state[f.id];
          const dEl = imcEl.querySelector('[data-imc="direct"]'), wEl = imcEl.querySelector('[data-imc="weight"]'), hEl = imcEl.querySelector('[data-imc="height"]');
          if (w != null && h != null) { wEl.value = w; hEl.value = h; dEl.value = ''; }
          else { wEl.value = ''; hEl.value = ''; dEl.value = bmi != null ? bmi : ''; }
          evalImc(imcEl); // normaliza read-only + classificação a partir dos inputs
        }
      }
      else if (f.type === 'berger') {
        const el = root.querySelector('.u-berger');
        if (el) {
          const na = inst.state[f.id + '_na'] === true;
          el.querySelectorAll('.u-berger-toggle input').forEach(i => i.checked = (i.value === (na ? 'na' : 'measured')));
          const femInp = el.querySelector('.u-berger-fem'), tibInp = el.querySelector('.u-berger-tib');
          femInp.value = inst.state[f.id + '_fem'] != null ? inst.state[f.id + '_fem'] : '';
          tibInp.value = inst.state[f.id + '_tib'] != null ? inst.state[f.id + '_tib'] : '';
          evalBerger(el);
        }
      }
      else if (f.type === 'onset') {
        const oe = root.querySelector('.u-onset');
        if (oe) {
          const mode = inst.state[f.id + '_mode'] || 'duration';
          oe.querySelectorAll('.u-onset-radio input').forEach(i => i.checked = (i.value === mode));
          const durI = oe.querySelector('.u-onset-dur'); if (durI) durI.value = inst.state[f.id + '_dur'] != null ? inst.state[f.id + '_dur'] : '';
          oe.querySelectorAll('.u-onset-unit input').forEach(i => i.checked = (i.value === (inst.state[f.id + '_unit'] || 'weeks')));
          const de = oe.querySelector('.u-date');
          if (de) { const setv = (sel, v) => { const el = de.querySelector(sel); if (el) el.value = v != null ? v : ''; }; setv('[data-yr]', inst.state[f.id + '_year']); setv('[data-mo]', inst.state[f.id + '_month']); setv('[data-dy]', inst.state[f.id + '_day']); }
          evalOnset(oe);
        }
      }
      else if (f.type === 'episodes') {
        const epEl = root.querySelector('.u-episodes');
        if (epEl) {
          const eps = Array.isArray(inst.state[f.id]) ? inst.state[f.id] : [];
          const recurrent = inst.state[f.id + '_recurrent'] === true || eps.length > 0;   // array presente ⇒ recorrente, mesmo com _recurrent omisso/false
          epEl.querySelectorAll('.u-episodes-toggle input').forEach(i => i.checked = (i.value === (recurrent ? 'recurrent' : 'first')));
          const rows = epEl.querySelector('.u-ep-rows');
          rows.innerHTML = recurrent ? (eps.length ? eps.map((ep, i) => epRowHtml(i, ep)).join('') : epRowHtml(0)) : '';
          evalEpisodes(epEl);
        }
      }
      // custom: setState não escreve o DOM — o campo custom gere o seu próprio estado (ver hatch field.reset em clearDependents)
    }
    syncVisibility(inst); syncIndicators(inst);
    UBNIC.refresh(); // §9: revalida numéricos/datas hidratados (ex.: valor fora de limites mostra erro logo)
  }
  function evalShowIf(field, state) {
    if (typeof field.showIf !== 'function') return true;
    try { return !!field.showIf(state); }
    catch (e) { console.warn('[u-stack] showIf lançou erro (campo mantido visível):', field.id, e); return true; } // fail-open: não esconder por bug de schema
  }
  function clearDependents(inst) {
    let changedAny = false, pass = true;
    while (pass) {
      pass = false;
      for (const m of inst.modules) for (const f of (m.fields||[])) {
        if (f.type === 'separator') continue;
        const hidden = !evalShowIf(f, inst.state);
        if (hidden) delete inst.state['_done_' + f.id];   // campo escondido reaparece como não-respondido
        // imc: ao esconder, limpar chaves derivadas (_weight/_height) + linha de classificação,
        // mesmo que o bmi primário esteja ausente (entrada parcial) — senão ficam órfãs no estado público.
        if (f.type === 'imc' && hidden) {
          if (inst.state[f.id + '_weight'] !== undefined || inst.state[f.id + '_height'] !== undefined) {
            delete inst.state[f.id + '_weight']; delete inst.state[f.id + '_height']; changedAny = true; pass = true;
          }
          const r0 = fieldRoot(inst, f.id), cl0 = r0 && r0.querySelector('.u-imc-class');
          if (cl0) { cl0.textContent = ''; cl0.className = 'u-imc-class'; }
        }
        if (f.type === 'berger' && hidden) {
          if (inst.state[f.id + '_na'] !== undefined || inst.state[f.id + '_fem'] !== undefined || inst.state[f.id + '_tib'] !== undefined) {
            delete inst.state[f.id + '_na']; delete inst.state[f.id + '_fem']; delete inst.state[f.id + '_tib']; changedAny = true; pass = true;
          }
          const r0 = fieldRoot(inst, f.id), rd0 = r0 && r0.querySelector('.u-berger-read');
          if (rd0) { rd0.textContent = ''; rd0.className = 'u-berger-read'; }
        }
        if (f.type === 'multi' && f.gate && hidden && inst.state[f.id + '_status'] !== undefined) { delete inst.state[f.id + '_status']; changedAny = true; pass = true; }
        if (f.type === 'onset' && hidden) {
          ['_mode', '_min', '_max', '_dur', '_unit', '_year', '_month', '_day'].forEach(k => delete inst.state[f.id + k]);
          const r0 = fieldRoot(inst, f.id), rd = r0 && r0.querySelector('.u-onset-read');
          if (rd) { rd.textContent = ''; rd.className = 'u-onset-read'; }
        }
        if (f.type === 'episodes' && hidden) {
          delete inst.state[f.id + '_recurrent'];
          const r0 = fieldRoot(inst, f.id), rows = r0 && r0.querySelector('.u-ep-rows'); if (rows) rows.innerHTML = '';
        }
        if (hidden && inst.state[f.id] !== undefined) {
          delete inst.state[f.id];
          const root = fieldRoot(inst, f.id);
          if (root) {                       // limpar o DOM do campo oculto
            root.querySelectorAll('input').forEach(i => { i.checked = false; if (i.type === 'number') i.value = ''; });
            root.querySelectorAll('.u-seg-btn.sel').forEach(b => b.classList.remove('sel'));
            const seg = root.querySelector('.u-seg'); if (seg) delete seg.dataset.value;
            const multi = root.querySelector('.u-multi'); if (multi) delete multi.dataset.value;
            const radio = root.querySelector('.u-radio'); if (radio) delete radio.dataset.value;
            if (f.type === 'custom' && typeof f.reset === 'function') f.reset(root); // escape hatch: custom limpa o seu próprio DOM
          }
          changedAny = true; pass = true;   // re-avaliar (cascata recursiva)
        }
      }
    }
    return changedAny;
  }
  function syncVisibility(inst) {
    for (const m of inst.modules) for (const f of (m.fields||[])) {
      if (f.type === 'separator') continue;
      const root = fieldRoot(inst, f.id); if (!root) continue;
      if (evalShowIf(f, inst.state)) root.removeAttribute('hidden'); else root.setAttribute('hidden', '');
    }
  }
  function syncIndicators(inst) {
    const res = buildResult(inst);
    if (inst.opts.markFindings) {
      // de-emphasiza a opção DEFAULT selecionada (normal pré-preenchido): marca .u-isdef → CSS dá-lhe um teal
      // quieto. O teal cheio fica para achados/escolhas reais → a patologia salta sem âmbar espalhado.
      // Só campos COM default participam (sem default = escolha real, fica teal cheio).
      for (const m of inst.modules) for (const f of (m.fields || [])) {
        if (f.type === 'separator' || f.default == null) continue;
        const root = fieldRoot(inst, f.id);
        if (root) root.classList.toggle('u-isdef', res.isDef[f.id] === true);
      }
    }
    for (const m of res.modules) {
      const modEl = inst.el.querySelector('.u-module[data-mid="' + m.id + '"]');
      if (!modEl) continue;
      const ind = modEl.querySelector('.u-mod-ind');
      if (ind) ind.classList.toggle('is-active', m.hasPathology);
      if (inst._nav) { const nb = inst._nav.querySelector('[data-go="' + m.id + '"]'); if (nb) nb.classList.toggle('has-pathology', m.hasPathology); }
    }
    if (inst._sections) syncSections(inst);
    if (inst._progressive) syncProgressive(inst);
    syncDecisions(inst);
    evalNotes(inst);
  }
  function syncProgressive(inst) {
    const fields = [];
    inst.modules.forEach(m => (m.fields || []).forEach(f => { if (f.type !== 'separator') fields.push(f); }));
    let curFid = null;
    for (const f of fields) { if (!evalShowIf(f, inst.state)) continue; if (inst.state['_done_' + f.id] !== true) { curFid = f.id; break; } }
    let num = 0;
    for (const f of fields) {
      const step = inst.el.querySelector('.u-pstep[data-fid="' + String(f.id).replace(/"/g, '\\"') + '"]');
      if (!step) continue;
      step.classList.remove('hidden', 'future', 'active', 'done');
      if (!evalShowIf(f, inst.state)) { step.classList.add('hidden'); continue; }
      const numEl = step.querySelector('.u-pstep-num');
      if (inst.state['_done_' + f.id] === true) {
        step.classList.add('done'); num++;
        if (numEl) numEl.textContent = '✓';
        const sum = step.querySelector('.u-pstep-sum');
        if (sum) {
          let t = typeof f.summary === 'function' ? f.summary(inst.state[f.id], inst.state) : labelForValue(f, inst.state[f.id]);
          // onset: o labelForValue nao tem estado para reconstruir a leitura - usa o texto vivo do widget ("ha 33 semanas")
          if (!t && f.type === 'onset') { const rd = step.querySelector('.u-onset-read:not(.u-onset-err)'); t = rd ? rd.textContent.trim() : ''; }
          sum.textContent = t || '';
        }
      } else if (f.id === curFid) {
        step.classList.add('active'); num++;
        if (numEl) numEl.textContent = String(num);
        const btn = step.querySelector('.u-pstep-confirm');
        if (btn) btn.disabled = !!step.querySelector('.has-error') || (progNeedsValue(f) && inst.state[f.id] == null);
      } else {
        step.classList.add('future');
      }
    }
  }
  function markProgHydrated(inst) {
    if (!inst._progressive) return;
    // default aplicado ≠ respondido (mesma semântica do isDef/markFindings): só valores REAIS
    // hidratam como concluídos — um campo com default fica pré-selecionado mas a pergunta faz-se
    inst.modules.forEach(m => (m.fields || []).forEach(f => {
      if (f.type !== 'separator' && inst.state[f.id] !== undefined && !isDefField(f, inst.state)) inst.state['_done_' + f.id] = true;
    }));
  }
  const NOTE_TONES = ['info', 'ok', 'warn', 'critical'];
  function pickTone(t, def) { return NOTE_TONES.indexOf(t) >= 0 ? t : def; }
  function safeCompute(fn, args, tag) { try { return fn.apply(null, args) || {}; } catch (e) { console.warn(tag + ' compute lançou:', e); return {}; } }
  function fillReasons(ul, reasons) {
    if (!ul) return;
    ul.innerHTML = (Array.isArray(reasons) ? reasons : []).map(r => '<li>' + esc(String(r)) + '</li>').join('');
  }
  function fillCriteria(details, criteria) {
    if (!details) return;
    const ul = details.querySelector('ul'), cs = Array.isArray(criteria) ? criteria : [];
    if (ul) ul.innerHTML = cs.map(c => '<li class="' + (c.met ? 'met' : 'unmet') + '"><span class="u-decision-ck">' + (c.met ? '✓' : '✗') + '</span><span>' + esc(String(c.name || '')) + (c.detail != null ? ' <span class="u-decision-detail">' + esc(String(c.detail)) + '</span>' : '') + '</span></li>').join('');
    details.style.display = cs.length ? '' : 'none';
  }
  function evalDecision(el, field, state) {
    const v = typeof field.compute === 'function' ? safeCompute(field.compute, [state], '[u-decision]') : {};
    const verdict = el.querySelector('.u-decision-verdict'); if (!verdict) return;
    verdict.className = 'u-decision-verdict tone-' + pickTone(v.tone, 'info');
    const lab = el.querySelector('.u-decision-label'); if (lab) lab.textContent = v.label || '';
    fillReasons(el.querySelector('.u-decision-reasons'), v.reasons);
    fillCriteria(el.querySelector('.u-decision-criteria'), v.criteria);
  }
  function syncDecisions(inst) {
    for (const m of inst.modules) for (const f of (m.fields || [])) {
      if (f.type !== 'decision') continue;
      const root = fieldRoot(inst, f.id), el = root && root.querySelector('.u-decision');
      if (el) evalDecision(el, f, inst.state);
    }
  }
  // ── Notas tipadas do cartão (subtítulo · objetivo · motor · resultado · validação) ──
  function moduleCardEl(inst, mid) {
    const s = '[data-mid="' + String(mid).replace(/"/g, '\\"') + '"]';
    return inst.el.querySelector('.u-module' + s + ', .u-sec' + s + ', .u-wiz-card' + s);
  }
  function fillNote(el, v) {
    el.className = 'u-note kind-' + (el.getAttribute('data-kind') || 'objective') + ' tone-' + pickTone(v.tone, 'info');
    const t = el.querySelector('.u-note-title'); if (t) t.textContent = v.title || '';
    const b = el.querySelector('.u-note-body'); if (b) b.innerHTML = v.html != null ? String(v.html) : '';
  }
  function fillResult(el, v) {
    el.className = 'u-note u-note-result tone-' + pickTone(v.tone, 'info');
    const hasVal = v.value != null;
    const val = el.querySelector('.u-note-val'); if (val) { val.textContent = hasVal ? String(v.value) : ''; val.style.display = hasVal ? '' : 'none'; }
    const max = el.querySelector('.u-note-max');
    if (max) { const mt = ((v.max != null ? '/ ' + v.max : '') + (v.unit ? ' ' + v.unit : '')).trim(); max.textContent = mt; max.style.display = (hasVal && mt) ? '' : 'none'; }
    const lab = el.querySelector('.u-note-label'); if (lab) lab.textContent = v.label || '';
    fillReasons(el.querySelector('.u-decision-reasons'), v.reasons);
    fillCriteria(el.querySelector('.u-decision-criteria'), v.criteria);
  }
  function fillValidate(el, v) {
    if (!v) { el.hidden = true; el.className = 'u-note u-note-validate'; el.innerHTML = ''; return; }
    const lvl = v.level === 'danger' ? 'critical' : (v.level === 'warn' ? 'warn' : (v.level === 'ok' ? 'ok' : 'info'));
    el.hidden = false; el.className = 'u-note u-note-validate tone-' + lvl;
    el.innerHTML = v.html != null ? String(v.html) : '';
  }
  function evalNotes(inst) {
    for (const m of inst.modules) {
      const card = moduleCardEl(inst, m.id);
      if (card) {
        (m.notes || []).forEach((n, i) => {
          if (typeof n.compute !== 'function') return;   // estáticas já vieram do render
          const el = card.querySelector('.u-note[data-note-idx="' + i + '"]');
          if (el) fillNote(el, safeCompute(n.compute, [inst.state], '[u-note]'));
        });
        if (m.result && typeof m.result.compute === 'function') {
          const el = card.querySelector('.u-note-result');
          if (el) fillResult(el, safeCompute(m.result.compute, [inst.state], '[u-note-result]'));
        }
      }
      for (const f of (m.fields || [])) {
        if (typeof f.validate !== 'function') continue;
        const root = fieldRoot(inst, f.id), el = root && root.querySelector('.u-note-validate');
        if (!el) continue;
        if (root.hasAttribute('hidden')) { fillValidate(el, null); continue; }   // campo escondido → sem validação
        let r; try { r = f.validate(inst.state[f.id], inst.state); } catch (e) { console.warn('[u-note-validate] validate lançou:', f.id, e); r = null; }
        fillValidate(el, r);
      }
    }
  }
  function progMarkDone(inst, fid) {
    if (inst.state['_done_' + fid]) return;   // idempotente: já respondido (ex.: blur + clique no Confirmar) → evita afterChange/u:stack redundante
    inst.state['_done_' + fid] = true;
    afterChange(inst, fid);
    // scroll ao passo que ACABOU de responder (agora colapsado) → fica visível como contexto, com o novo activo por baixo (continuidade)
    const s = inst.el.querySelector('.u-pstep[data-fid="' + String(fid).replace(/"/g, '\\"') + '"]');
    if (s && s.scrollIntoView) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function syncSections(inst) {
    const res = buildResult(inst);
    inst.modules.forEach(function (m, i) {
      const sec = inst.el.querySelector('.u-sec[data-mid="' + String(m.id).replace(/"/g, '\\"') + '"]');
      if (!sec) return;
      const collapsed = inst.state['_collapsed_' + m.id] === true;
      sec.classList.toggle('collapsed', collapsed);
      const chev = sec.querySelector('.u-sec-chev'); if (chev) chev.textContent = collapsed ? '▸' : '▾';

      const modRes = res.modules.find(x => x.id === m.id) || {};
      const normal = inst.state['_normal_' + m.id] === true;
      const touched = (m.fields || []).some(f => f.type !== 'separator' && inst.state[f.id] !== undefined && inst.state[f.id] !== f.default);

      const num = sec.querySelector('.u-sec-num');
      if (num) {
        num.classList.remove('todo', 'done', 'find');
        if (modRes.hasPathology) { num.classList.add('find'); num.textContent = String(i + 1); }
        else if (normal || touched) { num.classList.add('done'); num.textContent = '✓'; }
        else { num.classList.add('todo'); num.textContent = String(i + 1); }
      }
      const cb = sec.querySelector('.u-sec-normal input'); if (cb) cb.checked = normal;

      const sum = sec.querySelector('.u-sec-sum');
      if (sum) {
        let txt = '';
        if (normal) txt = 'Sem alterações';
        else txt = (m.fields || []).filter(f => f.type !== 'separator' && inst.state[f.id] !== undefined && !isDefField(f, inst.state))
                    .map(f => labelForValue(f, inst.state[f.id])).filter(Boolean).join(' · ');
        sum.textContent = collapsed ? txt : '';
        sum.classList.toggle('ok', normal);
        sum.classList.toggle('find', !normal && !!txt);
      }
    });
  }
  function markSectionNormal(inst, mid, checked) {
    const m = inst.modules.find(x => String(x.id) === String(mid)); if (!m) return;
    inst._normalizing = true;
    (m.fields || []).forEach(function (f) {
      if (!f || !('normal' in f)) return;
      inst.state[f.id] = checked ? f.normal : (f.default != null ? f.default : undefined);
    });
    inst.state['_normal_' + mid] = !!checked;
    if (checked) {
      inst.state['_collapsed_' + mid] = true;
      const idx = inst.modules.indexOf(m);
      for (let i = idx + 1; i < inst.modules.length; i++) {
        if (!inst.state['_normal_' + inst.modules[i].id]) { inst.state['_collapsed_' + inst.modules[i].id] = false; break; }
      }
    } else {
      inst.state['_collapsed_' + mid] = false;
    }
    applyStateToDOM(inst);   // reflete valores + chama syncIndicators → syncSections
    inst._normalizing = false;
    inst.el.dispatchEvent(new CustomEvent('u:stack', { bubbles: true, detail: { name: inst.name, state: Object.assign({}, inst.state), changed: null } }));
    const next = inst.el.querySelector('.u-sec[data-mid]:not(.collapsed)');
    if (checked && next && next.scrollIntoView) next.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function advanceToNext(inst, fromRoot) {
    // o DOM dos showIf já foi sincronizado (síncrono) em afterChange, por isso a ordem visível está atual — sem rAF
    const fields = Array.prototype.slice.call(inst.el.querySelectorAll('.u-stack-field'))
      .filter(f => !f.hasAttribute('hidden') && f.offsetParent !== null);
    const i = fields.indexOf(fromRoot);
    if (i >= 0 && i < fields.length - 1) fields[i + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function buildStackNav(inst) {
    if (!inst.el.parentNode) { console.warn('[u-stack] nav requer o elemento montado no DOM; nav ignorada'); return; }
    const nav = document.createElement('div'); nav.className = 'u-stack-nav' + (inst.opts.navFullBleed ? ' u-bleed' : '');
    // chips extra (opt-in): saltam para um seletor externo (ex.: o painel de relatório → chip "R")
    const extra = (inst.opts.navExtra || []).map(x => '<button data-scroll="' + esc(x.target) + '"' + (x.title ? ' title="' + esc(x.title) + '"' : '') + '>' + esc(x.label) + '</button>').join('');
    nav.innerHTML = inst.modules.map(m => '<button data-go="' + esc(m.id) + '"' + (m.title ? ' title="' + esc(m.title) + '"' : '') + '>' + esc(m.navLabel != null ? m.navLabel : m.title) + '</button>').join('') + extra;
    // navTarget (opt-in): monta a nav num seletor/elemento dado (ex.: acima de uma grelha 2-col) em vez do parentNode
    const mount = inst.opts.navTarget ? (typeof inst.opts.navTarget === 'string' ? document.querySelector(inst.opts.navTarget) : inst.opts.navTarget) : null;
    if (mount) mount.appendChild(nav); else inst.el.parentNode.insertBefore(nav, inst.el);
    inst._nav = nav;
    nav.addEventListener('click', (e) => { const b = e.target.closest('button[data-go],button[data-scroll]'); if (!b) return;
      if (b.hasAttribute('data-scroll')) { const x = document.querySelector(b.getAttribute('data-scroll')); if (x) x.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const t = inst.el.querySelector('.u-module[data-mid="' + b.getAttribute('data-go') + '"]'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  }
  function initStackSpy(inst) {
    if (!('IntersectionObserver' in window) || !inst._nav) return;
    const io = new IntersectionObserver((ents) => { ents.forEach(en => { if (en.isIntersecting) {
      const id = en.target.getAttribute('data-mid');
      inst._nav.querySelectorAll('button').forEach(b => b.classList.toggle('current', b.getAttribute('data-go') === id));
    }}); }, { rootMargin: '-56px 0px -60% 0px', threshold: 0 });
    inst.el.querySelectorAll('.u-module').forEach(m => io.observe(m)); inst._io = io;
  }
  function _findField(inst, fid) { for (const m of inst.modules) for (const f of (m.fields || [])) if (f.id === fid) return f; return null; }
  function syncZonesSide(inst) {
    inst.el.querySelectorAll('.u-zones[data-side-from]').forEach(zEl => {
      const root = zEl.closest('.u-stack-field'); if (!root) return;
      const fid = root.getAttribute('data-fid'), field = _findField(inst, fid); if (!field) return;
      const src = inst.state[zEl.getAttribute('data-side-from')];
      if (src !== 'left' && src !== 'right') return;
      if (zEl.getAttribute('data-side') === src) return;
      const sel = Array.isArray(inst.state[fid]) ? inst.state[fid] : [];
      zEl.setAttribute('data-side', src);
      zEl.innerHTML = zonesInnerHtml(field, src);
      zEl.querySelectorAll('input[type=checkbox]').forEach(i => i.checked = sel.includes(i.value));
      if (field.noneLabel && !zEl.querySelector('input[type=checkbox]:checked')) { const nb = zEl.querySelector('input[data-none]'); if (nb) nb.checked = true; }
    });
    inst.el.querySelectorAll('.u-multi[data-side-from]:not(.u-zones)').forEach(mEl => {
      const src = inst.state[mEl.getAttribute('data-side-from')];
      if ((src === 'left' || src === 'right') && mEl.getAttribute('data-side') !== src) mEl.setAttribute('data-side', src);
    });
  }
  function afterChange(inst, changed) {
    if (inst._normalizing) return;   // preenchimento programático (markSectionNormal): não recomputar/limpar o estado (mataria os _normal_/_collapsed_)
    recomputeState(inst);
    if (inst._sections) {   // (afterChange já retornou cedo se _normalizing)
      inst.modules.forEach(function (m) {
        if (!inst.state['_normal_' + m.id]) return;
        const stillNormal = (m.fields || []).every(f => !('normal' in f) || inst.state[f.id] === f.normal);
        if (!stillNormal) inst.state['_normal_' + m.id] = false;
      });
    }
    syncZonesSide(inst);
    clearDependents(inst);   // apaga estado fantasma
    syncVisibility(inst);    // mostra/esconde conforme o estado
    syncIndicators(inst);
    const _detail = { name: inst.name, state: Object.assign({}, inst.state), changed: changed };
    if (inst._progressive && !inst.el.querySelector('.u-pstep.active')) _detail.complete = true;
    inst.el.dispatchEvent(new CustomEvent('u:stack', { bubbles: true, detail: _detail }));
  }
  function resetStack(inst) {
    inst.state = {};
    for (const m of inst.modules) for (const f of (m.fields||[])) { if (f.type !== 'separator' && f.default != null) inst.state[f.id] = (f.type === 'multi') ? [f.default] : f.default; }
    markProgHydrated(inst);   // progressive: campos com default reaparecem como respondidos (paridade com init/setState)
    applyStateToDOM(inst);
    syncVisibility(inst);   // re-esconde os condicionais (showIf falso com o estado limpo) — senão ficam visíveis e vazios
    syncIndicators(inst);
    if (inst.el.scrollIntoView) inst.el.scrollIntoView({ behavior: 'smooth', block: 'start' }); // §3: scroll ao topo no reset
    inst.el.dispatchEvent(new CustomEvent('u:stack', { bubbles: true, detail: { name: inst.name, state: Object.assign({}, inst.state), changed: null } }));
  }
  function destroyStack(inst) {
    if (inst._onChange) inst.el.removeEventListener('u:change', inst._onChange);
    if (inst._onInput) inst.el.removeEventListener('input', inst._onInput);
    if (inst._onHead) inst.el.removeEventListener('click', inst._onHead);
    if (inst._onSec) inst.el.removeEventListener('click', inst._onSec);
    if (inst._onSecChange) inst.el.removeEventListener('change', inst._onSecChange);
    if (inst._onStep) inst.el.removeEventListener('click', inst._onStep);
    if (inst._onStepBlur) inst.el.removeEventListener('change', inst._onStepBlur);
    if (inst._onStepKey) document.removeEventListener('keydown', inst._onStepKey);
    if (inst._io) { inst._io.disconnect(); inst._io = null; }
    if (inst._nav && inst._nav.parentNode) { inst._nav.parentNode.removeChild(inst._nav); inst._nav = null; }
    inst._onChange = inst._onInput = inst._onHead = inst._onSec = inst._onSecChange = inst._onStep = inst._onStepBlur = inst._onStepKey = null; // liberta closures; idempotência explícita
    inst.el._ustack = null;
  }

  // Injeta os ícones SVG (sol/lua) em toggles vazios → cross-fade rotativo fiel ao landing
  // (sem isto, um .u-theme-toggle vazio cai no fallback de emoji, sem animação).
  function ensureThemeIcons() {
    var SUN = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    var MOON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    $$('[data-theme-toggle], .u-theme-toggle').forEach(function (b) {
      if (b.children.length || b.textContent.trim()) return; // só toggles vazios; não clobbar ícones/conteúdo próprios
      b.innerHTML = '<span class="u-ico-sun">' + SUN + '</span><span class="u-ico-moon">' + MOON + '</span>';
    });
  }

  /* ---------- Wizard (recolha vertical: fases / acordeão) ---------- */
  let wizardSeq = 0;
  function renderWizCard(inst, phase, idx) {
    const body = '<div class="u-wiz-body">'
      + '<h3 class="u-wiz-title">' + esc(phase.title || '') + '</h3>'
      + renderCardTop(phase)
      + (phase.fields || []).map(f => renderField(f, inst.uid)).join('')
      + renderResultNote(phase)
      + '<div class="u-wiz-foot"><button type="button" class="u-btn u-wiz-continue" data-wiz-continue>' + esc(inst.opts.continueLabel || 'Continuar') + '</button></div>'
      + '</div>';
    const summary = '<div class="u-wiz-summary" data-wiz-summary><div class="u-wiz-sum-head"><span class="u-wiz-sum-title">' + esc(phase.title || '') + '</span>'
      + '<button type="button" class="u-wiz-edit" data-wiz-edit>' + esc(inst.opts.editLabel || 'Alterar') + '</button></div>'
      + '<div class="u-wiz-sum-body"></div></div>';
    return '<div class="u-wiz-card" data-phase="' + esc(phase.id) + '" data-mid="' + esc(phase.id) + '" data-idx="' + idx + '">' + summary + body + '</div>';
  }
  function renderWizProgress(inst) {
    const bar = inst.el.querySelector('[data-wiz-progress]'); if (!bar) return;
    bar.innerHTML = inst.modules.map((p, i) => {
      const state = i === inst.active ? 'current' : (inst.done.has(i) ? 'done' : 'todo');
      const line = i > 0 ? '<div class="u-wiz-step-line' + (inst.done.has(i - 1) ? ' done' : '') + '"></div>' : '';
      const label = p.navLabel != null ? p.navLabel : (p.title || '');
      return line + '<button type="button" class="u-wiz-step ' + state + '" data-wiz-go="' + i + '"' + (state === 'done' ? '' : ' disabled') + '>'
        + '<span class="u-wiz-step-num">' + (inst.done.has(i) ? '✓' : (i + 1)) + '</span>'
        + '<span class="u-wiz-step-label">' + esc(label) + '</span></button>';
    }).join('');
  }
  function renderWizSummary(inst, idx) {
    const card = inst.el.querySelector('.u-wiz-card[data-idx="' + idx + '"]'); if (!card) return;
    const body = card.querySelector('.u-wiz-sum-body'); if (!body) return;
    const phase = inst.modules[idx];
    const chips = (phase.fields || []).map(f => {
      if (f.type === 'separator') return '';
      const root = fieldRoot(inst, f.id); if (root && root.hasAttribute('hidden')) return '';
      let v = inst.state[f.id]; if (v === undefined && f.default != null) v = f.default;
      let text;
      if (f.type === 'imc' && typeof f.summary !== 'function') {
        const t = UBNIC.imcClass(inst.state[f.id]).text;
        return t ? '<span class="u-wiz-chip">' + esc(t) + '</span>' : '';
      }
      if (f.type === 'berger' && typeof f.summary !== 'function') {
        if (inst.state[f.id + '_na'] === true) return '<span class="u-wiz-chip">Rotação: sem TC</span>';
        const r = bergerCombined(inst.state[f.id + '_fem'], inst.state[f.id + '_tib']);
        if (r.combined == null) return '';
        return '<span class="u-wiz-chip">Rotação: RI comb. ' + r.combined.toFixed(1) + '° (' + r.short + ')</span>';
      }
      if (f.type === 'onset' && typeof f.summary !== 'function') {
        const mode = inst.state[f.id + '_mode'] || 'duration';
        const data = mode === 'duration' ? { dur: inst.state[f.id + '_dur'], unit: inst.state[f.id + '_unit'], durMax: f.durMax } : { yr: inst.state[f.id + '_year'], mo: inst.state[f.id + '_month'], dy: inst.state[f.id + '_day'], durMax: f.durMax };
        const t = onsetFrom(mode, data, new Date()).reading;
        return t ? '<span class="u-wiz-chip">' + esc(t) + '</span>' : '';
      }
      if (f.type === 'episodes' && typeof f.summary !== 'function') {
        if (inst.state[f.id + '_recurrent'] !== true) return '<span class="u-wiz-chip">1.º episódio</span>';
        const eps = Array.isArray(inst.state[f.id]) ? inst.state[f.id] : [];
        if (!eps.length) return '';
        const dates = eps.map(ep => ep.m != null ? ((String(ep.m).length < 2 ? '0' : '') + ep.m + '/' + ep.y) : String(ep.y)).join(', ');   // precisão ao ano → só AAAA
        return '<span class="u-wiz-chip">Episódios: ' + esc(dates) + '</span>';
      }
      if (f.type === 'multi' && f.layout === 'zones' && typeof f.summary !== 'function') {
        const t = zonesSummary(f, inst.state[f.id]);
        return t ? '<span class="u-wiz-chip">' + esc(t) + '</span>' : '';
      }
      if (f.type === 'multi' && f.gate && typeof f.summary !== 'function') {
        const t = gateSummary(f, inst.state);
        return t ? '<span class="u-wiz-chip">' + esc(t) + '</span>' : '';
      }
      if (typeof f.summary === 'function') { try { text = f.summary(v, inst.state); } catch (e) { text = null; } if (text == null) return ''; }
      else { const lbl = labelForValue(f, v); if (lbl == null || lbl === '') return ''; text = esc(f.label) + ': ' + esc(lbl); }
      return '<span class="u-wiz-chip">' + (typeof f.summary === 'function' ? esc(text) : text) + '</span>';
    }).join('');
    body.innerHTML = chips || '<span class="u-wiz-chip u-wiz-chip-empty">—</span>';
  }
  function applyWizCardStates(inst) {
    const cards = inst.el.querySelectorAll('.u-wiz-card');
    cards.forEach((c, i) => {
      c.classList.remove('current', 'done', 'todo');
      c.classList.add(i === inst.active ? 'current' : (inst.done.has(i) ? 'done' : 'todo'));
      if (inst.done.has(i)) renderWizSummary(inst, i);
    });
    if (inst.progress) renderWizProgress(inst);
  }
  function renderWizard(inst) {
    inst.el.innerHTML = (inst.progress ? '<div class="u-wiz-progress" data-wiz-progress></div>' : '')
      + inst.modules.map((p, i) => renderWizCard(inst, p, i)).join('');
    applyWizCardStates(inst);
    applyStateToDOM(inst);     // aplica inst.state (defaults/initial) aos controlos + syncVisibility + refresh
    applyFieldReveal(inst);
    updateWizContinue(inst);
  }
  function wizPhaseValid(inst, idx) {
    const phase = inst.modules[idx]; if (!phase) return true;
    for (const f of (phase.fields || [])) {
      if (f.type === 'separator') continue;
      const root = fieldRoot(inst, f.id); if (!root || root.hasAttribute('hidden')) continue;
      if (f.required && isDefField(f, inst.state) && inst.state[f.id] === undefined) return false;
      if (root.querySelector('.u-field.has-error')) return false;
      if (f.required == null && f.default == null && inst.state[f.id] === undefined) return false;
    }
    return true;
  }
  function wizAdvance(inst) {
    if (!wizPhaseValid(inst, inst.active)) { const b = inst.el.querySelector('.u-wiz-card.current [data-wiz-continue]'); if (b) b.classList.add('u-wiz-shake'); return; }
    inst.done.add(inst.active);
    if (inst.active < inst.modules.length - 1) inst.active++;
    else wizComplete(inst);
    afterWizChange(inst, null);
  }
  function wizComplete(inst) {
    inst.complete = true;
    inst.el.classList.add('u-wiz-done');
    recomputeState(inst);
    if (typeof inst.opts.onComplete === 'function') { try { inst.opts.onComplete(Object.assign({}, inst.state)); } catch (e) { console.warn('[u-wizard] onComplete:', e); } }
    inst.el.dispatchEvent(new CustomEvent('u:wizard', { bubbles: true, detail: { name: inst.name, state: Object.assign({}, inst.state), complete: true } }));
  }
  function updateWizContinue(inst) {
    const cont = inst.el.querySelector('.u-wiz-card.current [data-wiz-continue]');
    if (cont) cont.disabled = !wizPhaseValid(inst, inst.active);   // "Continuar" só ativo se a fase valida
  }
  function afterWizChange(inst, fid) {
    recomputeState(inst);
    syncZonesSide(inst);
    clearDependents(inst);
    syncVisibility(inst);
    applyWizCardStates(inst);
    syncIndicators(inst);          // atualiza .u-isdef/.u-finding (markFindings) ao mudar o valor
    applyFieldReveal(inst);
    updateWizContinue(inst);
    if (inst.advance === 'field' && !inst.done.has(inst.active) && wizPhaseAllAnswered(inst, inst.active)) { wizAdvance(inst); return; }
    if (inst._lastActive !== inst.active) {
      const card = inst.el.querySelector('.u-wiz-card.current');
      if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      inst._lastActive = inst.active;
    }
    inst.el.dispatchEvent(new CustomEvent('u:wizard', { bubbles: true, detail: { name: inst.name, state: Object.assign({}, inst.state), active: inst.active, done: [...inst.done] } }));
  }
  function applyFieldReveal(inst) {
    if (inst.advance !== 'field') return;
    const phase = inst.modules[inst.active]; if (!phase) return;
    let revealUpTo = true;
    for (const f of (phase.fields || [])) {
      if (f.type === 'separator') continue;
      const root = fieldRoot(inst, f.id); if (!root || root.hasAttribute('hidden')) continue;
      root.classList.toggle('u-wiz-pending', !revealUpTo);
      const answered = inst.state[f.id] !== undefined && !(Array.isArray(inst.state[f.id]) && inst.state[f.id].length === 0);
      if (!answered) revealUpTo = false;
    }
    const foot = inst.el.querySelector('.u-wiz-card.current .u-wiz-foot'); if (foot) foot.style.display = 'none';
  }
  function wizPhaseAllAnswered(inst, idx) {
    const phase = inst.modules[idx]; if (!phase) return false;
    for (const f of (phase.fields || [])) {
      if (f.type === 'separator') continue;
      const root = fieldRoot(inst, f.id); if (!root || root.hasAttribute('hidden')) continue;
      const v = inst.state[f.id];
      if (v === undefined || (Array.isArray(v) && v.length === 0)) return false;
    }
    return true;
  }
  function wizGoTo(inst, idx) {
    if (idx < 0 || idx >= inst.modules.length) return;
    inst.active = idx;
    inst.done.delete(idx);     // a fase reaberta deixa de estar "concluída" (volta a current)
    afterWizChange(inst, null);
  }
  function makeWizardController(inst) {
    return {
      getState: () => Object.assign({}, inst.state),
      getResult: () => buildResult(inst),
      getEl: () => inst.el,
      getActive: () => inst.active,
      setState: (o) => { Object.assign(inst.state, o); applyStateToDOM(inst); afterWizChange(inst, null); },
      goTo: (id) => { const i = inst.modules.findIndex(p => p.id === id); if (i >= 0) wizGoTo(inst, i); },
      next: () => wizAdvance(inst),
      back: () => { if (inst.active > 0) wizGoTo(inst, inst.active - 1); },
      reset: () => { inst.state = {}; inst.done = new Set(); inst.active = 0; inst.complete = false; inst.el.classList.remove('u-wiz-done'); if (inst.opts.applyDefaults) inst.modules.forEach(m => (m.fields || []).forEach(f => { if (f.type !== 'separator' && f.default != null) inst.state[f.id] = (f.type === 'multi') ? [f.default] : f.default; })); renderWizard(inst); applyFieldReveal(inst); },
      refresh: () => afterWizChange(inst, null),
      destroy: () => {
        inst.el.removeEventListener('u:change', inst._onChange);
        inst.el.removeEventListener('input', inst._onInput);
        inst.el.removeEventListener('click', inst._onClick);
        inst.el._uwiz = null;
      },
    };
  }
  UBNIC.wizard = function (target, opts) {
    const el = typeof target === 'string' ? $(target) : target; if (!el || !opts) return null;
    const inst = {
      el: el, uid: 'uwiz' + (wizardSeq++), name: opts.name || 'wizard', opts: opts,
      modules: opts.phases || [],
      state: {}, active: 0, _lastActive: 0, done: new Set(),
      progress: opts.progress !== false, advance: opts.advance || 'phase',
    };
    el.classList.add('u-wiz');
    if (opts.boxedFields) el.classList.add('u-stack-boxed'); // sub-painéis nos campos (mesma apresentação do stack)
    if (opts.applyDefaults) inst.modules.forEach(m => (m.fields || []).forEach(f => { if (f.type !== 'separator' && f.default != null) inst.state[f.id] = (f.type === 'multi') ? [f.default] : f.default; }));
    if (opts.initial) Object.assign(inst.state, opts.initial);
    // singleDensity: força densidade uniforme nos campos single sem density/ordinal explícitos
    if (opts.singleDensity) inst.modules.forEach(m => (m.fields||[]).forEach(f => { if (f.type === 'single' && !f.density && !f.ordinal) f.density = opts.singleDensity; }));
    renderWizard(inst);
    inst._onChange = (e) => { const root = e.target.closest && e.target.closest('.u-stack-field'); afterWizChange(inst, root ? root.getAttribute('data-fid') : null); };
    el.addEventListener('u:change', inst._onChange);
    inst._onInput = (e) => { const t = e.target; if (t.matches && t.matches('.u-num') && !t.matches('[data-hard-min],[data-hard-max],[data-soft-min],[data-soft-max],[data-analyte],[data-sex]')) { const root = t.closest('.u-stack-field'); afterWizChange(inst, root ? root.getAttribute('data-fid') : null); } };
    el.addEventListener('input', inst._onInput);
    inst._onClick = (e) => {
      if (e.target.closest('[data-skip]')) {   // "saltar" a fase: emite u:skip + avança
        const card = e.target.closest('.u-wiz-card'); const mid = card && card.getAttribute('data-mid');
        const mod = mid != null ? inst.modules.find(m => String(m.id) === mid) : null;
        inst.el.dispatchEvent(new CustomEvent('u:skip', { bubbles: true, detail: { name: inst.name, module: mid, state: Object.assign({}, inst.state) } }));
        if (mod && mod.skip && typeof mod.skip.onSkip === 'function') { try { mod.skip.onSkip(inst.state); } catch (err) { console.warn('[u-skip] onSkip lançou:', mid, err); } }
        wizAdvance(inst); return;
      }
      if (e.target.closest('[data-wiz-continue]')) { wizAdvance(inst); return; }
      const go = e.target.closest('[data-wiz-go]'); if (go && !go.disabled) { wizGoTo(inst, +go.getAttribute('data-wiz-go')); return; }
      if (e.target.closest('[data-wiz-edit]')) { const card = e.target.closest('.u-wiz-card'); if (card) wizGoTo(inst, +card.getAttribute('data-idx')); return; }
    };
    el.addEventListener('click', inst._onClick);
    el._uwiz = inst;
    recomputeState(inst); syncZonesSide(inst); updateWizContinue(inst);   // popula o estado a partir do DOM inicial (ex.: composto no seu default → state=[]) e reflete a fase no "Continuar" logo no render, sem depender de interação
    return makeWizardController(inst);
  };

  /* ---------- Report (output dual) ---------- */
  let reportSeq = 0;
  const MODE_LABEL = { structured: 'Estruturado', natural: 'Natural' };
  function renderReport(inst) {
    const modes = inst.modes;
    let tabs = '';
    if (modes.length > 1) {
      tabs = '<div class="u-report-tabs">' + modes.map(md =>
        '<button class="u-report-tab' + (md === inst.active ? ' active' : '') + '" data-mode="' + esc(md) + '">' + esc((inst.tabLabels && inst.tabLabels[md]) || MODE_LABEL[md] || md) + '</button>').join('') + '</div>';
    }
    const body = inst.active === 'natural' ? renderNatural(inst) : renderStructured(inst);
    const actions = '<div class="u-report-actions">'
      + '<button class="u-btn-copy" data-report-copy>Copiar</button>'
      + '<button class="u-btn-secondary" data-report-reset>Recomeçar</button></div>';
    const close = inst.panel ? '<button class="u-report-close" type="button" data-report-close aria-label="Fechar relatório">&times;</button>' : '';
    inst.el.innerHTML = close + tabs + '<div class="u-report-body">' + body + '</div>' + actions;
  }
  function setupReportPanel(inst) {
    // drawer mobile: botão flutuante "Relatório" + backdrop (no desktop ficam escondidos por CSS; o painel é lateral fixo)
    const fab = document.createElement('button'); fab.type = 'button'; fab.className = 'u-report-fab';
    fab.innerHTML = '<span>Relatório</span>';
    const backdrop = document.createElement('div'); backdrop.className = 'u-report-backdrop';
    // criar no MESMO contexto de empilhamento do painel (parentNode), senão um ancestral com z-index
    // prende o painel abaixo de um backdrop colocado no <body> (fica coberto/escurecido e sem cliques)
    const host = inst.el.parentNode || document.body;
    host.appendChild(backdrop); host.appendChild(fab);
    inst._fab = fab; inst._backdrop = backdrop;
    const open = () => { inst.el.classList.add('open'); backdrop.classList.add('show'); };
    const close = () => { inst.el.classList.remove('open'); backdrop.classList.remove('show'); };
    inst._panelClose = close;
    fab.addEventListener('click', () => inst.el.classList.contains('open') ? close() : open());
    backdrop.addEventListener('click', close);
    inst._panelKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', inst._panelKey);
  }
  UBNIC.report = function (target, opts) {
    const el = typeof target === 'string' ? $(target) : target; if (!el || !opts || !opts.stack) return null;
    const modes = opts.modes || ['structured', 'natural'];
    const inst = { el: el, uid: 'urep' + (reportSeq++), stack: opts.stack, name: opts.name || 'report',
      modes: modes, natural: opts.natural || {}, active: modes[0],
      tabLabels: opts.tabLabels || null, panel: !!opts.panel,
      structured: opts.structured || { mode: 'all' } };
    el.classList.add('u-report');
    if (inst.panel) { el.classList.add('u-report-panel'); setupReportPanel(inst); } // docado: lateral (desktop) / drawer (mobile)
    renderReport(inst);
    inst._onStack = () => renderReport(inst);
    if (inst.stack.getEl && inst.stack.getEl()) inst.stack.getEl().addEventListener('u:stack', inst._onStack);
    inst._onClick = (e) => {
      const tab = e.target.closest('.u-report-tab'); if (tab) { inst.active = tab.getAttribute('data-mode'); renderReport(inst); return; }
      const cp = e.target.closest('[data-report-copy]'); if (cp) { reportCopy(inst, cp); return; }
      const rs = e.target.closest('[data-report-reset]');
      if (rs) {
        // confirmação em 2 passos (ação destrutiva — apaga todos os dados): 1.º clique arma, 2.º apaga
        if (rs.dataset.armed === '1') { clearTimeout(inst._resetT); inst.stack.reset(); return; } // reset → u:stack re-renderiza o botão (volta ao normal)
        const orig = rs.textContent;
        rs.dataset.armed = '1'; rs.classList.remove('u-btn-secondary'); rs.classList.add('u-btn-danger'); rs.textContent = 'Apagar tudo?';
        inst._resetT = setTimeout(function () { if (!rs.isConnected) return; rs.dataset.armed = '0'; rs.classList.remove('u-btn-danger'); rs.classList.add('u-btn-secondary'); rs.textContent = orig; }, 3500);
        return;
      }
      if (e.target.closest('[data-report-close]')) { if (inst._panelClose) inst._panelClose(); return; }
    };
    el.addEventListener('click', inst._onClick);
    el._ureport = inst;
    return { refresh: () => renderReport(inst), destroy: () => {
      if (inst._onStack && inst.stack.getEl && inst.stack.getEl()) { inst.stack.getEl().removeEventListener('u:stack', inst._onStack); inst._onStack = null; }
      if (inst._onClick) { inst.el.removeEventListener('click', inst._onClick); inst._onClick = null; }
      if (inst._resetT) clearTimeout(inst._resetT);
      if (inst._fab && inst._fab.parentNode) inst._fab.parentNode.removeChild(inst._fab);
      if (inst._backdrop && inst._backdrop.parentNode) inst._backdrop.parentNode.removeChild(inst._backdrop);
      if (inst._panelKey) document.removeEventListener('keydown', inst._panelKey);
      inst.el._ureport = null;
    } };
  };
  function renderStructured(inst) {
    const res = inst.stack.getResult(), mods = inst.stack.getModules();
    const curated = !!(inst.structured && inst.structured.mode === 'curated');
    let html = '';
    mods.forEach(m => {
      let lines = '';
      (m.fields || []).forEach(f => {
        if (f.type === 'separator') return;
        if (!evalShowIf(f, res.state)) return;
        let v = res.state[f.id]; if (v === undefined && f.default != null) v = f.default;
        const chg = res.isDef[f.id] === false;
        if (curated) {
          if (typeof f.summary !== 'function') return;              // curated: só campos com summary
          let s; try { s = f.summary(v, res.state); } catch (e) { console.warn('[u-report] summary lançou erro:', f.id, e); s = null; }
          if (s == null) return;                                    // null/undefined ⇒ omite a linha (curadoria/condicional)
          const prefix = f.reportLabel != null ? f.reportLabel : f.label;
          const sv = f.type === 'numeric' ? '<span class="u-mono">' + esc(s) + '</span>' : esc(s); // mono só nos números (marca)
          lines += '<div class="u-report-line' + (chg ? ' u-report-chg' : '') + '">' + esc(prefix) + ': ' + sv + '</div>';
        } else {
          const label = labelForValue(f, v);
          const lv = f.type === 'numeric' ? '<span class="u-mono">' + esc(label || '—') + '</span>' : esc(label || '—'); // mono só nos números (marca)
          lines += '<div class="u-report-line' + (chg ? ' u-report-chg' : '') + '">' + esc(f.label) + ': ' + lv + '</div>';
        }
      });
      if (lines) html += '<div class="u-report-mod"><div class="u-report-modh">' + esc(m.reportTitle != null ? m.reportTitle : m.title) + '</div>' + lines + '</div>';
    });
    return '<div class="u-report-structured">' + html + '</div>';
  }
  function renderNatural(inst) {
    const res = inst.stack.getResult(), mods = inst.stack.getModules();
    const h = (s) => '<span class="u-path-hl">' + s + '</span>';
    const parts = [], findings = [];
    mods.forEach(m => {
      if (typeof m.describe === 'function') {                 // módulo agrega a sua própria prosa (EXCLUSIVO: ignora describe por-campo neste módulo)
        let d; try { d = m.describe(res.state, h); } catch (e) { console.warn('[u-report] module.describe lançou erro:', m.id, e); d = null; }
        if (d) {
          const text = typeof d === 'string' ? d : (d.text) || '';
          if (text) parts.push('<p>' + text + '</p>');
          const fs = (d && Array.isArray(d.findings)) ? d.findings : [];
          fs.forEach(x => { if (x) findings.push(stripTags(x)); });
        }
        return;
      }
      // fallback por campo (comportamento atual)
      (m.fields || []).forEach(f => {
        if (f.type === 'separator') return;
        if (!evalShowIf(f, res.state)) return;
        const isChg = res.isDef[f.id] === false;
        let v = res.state[f.id]; if (v === undefined && f.default != null) v = f.default;
        const label = labelForValue(f, v);
        if (typeof f.describe === 'function') {
          let d; try { d = f.describe(label, res.state, h); } catch (e) { console.warn('[u-report] describe lançou erro (campo omitido):', f.id, e); d = null; }
          const text = typeof d === 'string' ? d : (d && d.text) || '';
          if (text) parts.push('<p>' + text + '</p>');
          if (isChg) { const finding = typeof d === 'string' ? d : (d && (d.finding || d.text)) || ''; if (finding) findings.push(stripTags(finding)); }
        } else if (isChg) {
          parts.push('<p>' + esc(f.label) + ': ' + esc(label) + '</p>');
          findings.push(f.label + ': ' + label);
        }
      });
    });
    const concl = inst.natural.conclusionLabel || 'CONCLUSÃO';
    const empty = inst.natural.empty || 'Sem alterações significativas.';
    let conclText;
    if (findings.length) { const j = findings.map(esc).join('; '); conclText = j.charAt(0).toUpperCase() + j.slice(1) + '.'; } // maiúscula inicial + ponto final (fiel ao KMSR)
    else conclText = esc(empty);
    const body = parts.join('') + '<p class="u-report-concl"><strong>' + esc(concl) + ':</strong> ' + conclText + '</p>';
    return '<div class="u-report-natural">' + body + '</div>';
  }
  function reportCopy(inst, btn) {
    const bodyEl = inst.el.querySelector('.u-report-body > div'); if (!bodyEl) return;
    let html;
    if (inst.active === 'natural') html = bodyEl.innerHTML.replace(/<span class="u-path-hl">([\s\S]*?)<\/span>/g, '<b>$1</b>');
    else html = bodyEl.innerHTML.replace(/<div class="u-report-line u-report-chg">([\s\S]*?)<\/div>/g, '<div><b>$1</b></div>');
    const text = bodyEl.innerText;
    const done = () => { btn.classList.add('is-copied'); const o = btn.textContent; btn.textContent = '✓ Copiado';
      setTimeout(() => { btn.classList.remove('is-copied'); btn.textContent = o; }, 2000); };
    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      })]).then(done).catch(() => fallbackCopy(text, done));
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }

  function init() {
    ensureThemeIcons();
    UBNIC.initTheme();
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);
    document.addEventListener('keydown', onKeydown);
    $$('.u-rom').forEach(initRom);
    initReveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.UBNIC = UBNIC;
})();
