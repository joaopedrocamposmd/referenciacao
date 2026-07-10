/* Referenciação Ortopedia ULSM — motor de decisão e geração de texto.
   Puro (sem DOM/Date): testável em Node (ortopedia.engine.test.js).
   Cascata de prioridade conforme o Documento de Trabalho - Ortopedia (ULSM):
   EMERGENTE(SU) → MUITO PRIORITÁRIO(15d) → PRIORITÁRIO(60d) → NORMAL → sem critérios. */
(function (root) {
'use strict';

const DUR_RANK = { none:0, lt3:1, m3_6:2, ge6:3 };
const NIVEL = {
  su:            { label:'EMERGENTE — enviar ao Serviço de Urgência', alert:'urgent' },
  mp15:          { label:'MUITO PRIORITÁRIO (15 dias)', alert:'urgent' },
  p60:           { label:'PRIORITÁRIO (60 dias)', alert:'warn' },
  normal:        { label:'NORMAL', alert:'ok' },
  mfr:           { label:'Orientar para MFR (não Ortopedia)', alert:'warn' },
  sem_criterios: { label:'Sem critérios de referenciação', alert:'warn' },
  incompleto:    { label:'Preenchimento incompleto', alert:'info' },
};

function minRank(meses) { return meses >= 6 ? 3 : meses >= 3 ? 2 : 0; }
// opção com 'visivel' (ex.: perda ponderal só se IMC>25; critérios etários) — invisível não conta nem aparece
function optVisivel(o, state) { return !o || typeof o.visivel !== 'function' || !!o.visivel(state); }
// evolução conhecida < 3 meses (13 semanas) ⇒ o conservador não pode ter ≥3 meses: deriva 'lt3'
// (a pergunta da duração nem se faz nesse caso — ver showIf do tratdur no schema)
function durEfetiva(state) {
  if (state.tratdur) return state.tratdur;
  if (state.evol != null && state.evol < 13) return 'lt3';
  return 'none';
}

function decide(state, pat) {
  if (!pat) return { nivel:'incompleto', motivo:'Escolha a região e a patologia.', falta:[], mcdtEmFalta:[], avisos:[] };
  const sel = state['prio_' + pat.id] || [];
  const avisos = [];
  if (pat.idade && state.idade != null && state.idade !== '') {
    const a = +state.idade;
    if (a < pat.idade.min || a > pat.idade.max)
      avisos.push('Idade (' + a + ' anos) fora do perfil típico desta patologia — confirme a seleção.');
  }
  (pat.notas || []).forEach(n => avisos.push(n));
  const mcdtSel = state['mcdt_' + pat.id] || [];
  const mcdtEmFalta = (pat.mcdt || []).filter(m => mcdtSel.indexOf(m.value) === -1).map(m => m.label);
  const base = { falta:[], mcdtEmFalta:mcdtEmFalta, avisos:avisos };

  // cascata su → mp15 → p60
  for (const lvl of ['su','mp15','p60']) {
    const hit = (pat.prioridade || []).find(c => c.nivel === lvl && sel.indexOf(c.value) !== -1 && optVisivel(c, state));
    if (hit) return Object.assign(base, { nivel:lvl, motivo:hit.label });
  }
  if (pat.normalGate === 'mfr')
    return Object.assign(base, { nivel:'mfr', motivo:'Iniciar fisioterapia urgente e referenciar a consulta de MFR.' });
  if (pat.normalGate === 'sempre')
    return Object.assign(base, { nivel: pat.nivelSempre || 'normal', motivo:'Referenciar sempre.' });
  if (pat.normalGate === 'criterios') {
    const hit = (pat.prioridade || []).find(c => c.nivel === 'normal' && sel.indexOf(c.value) !== -1 && optVisivel(c, state));
    if (hit) return Object.assign(base, { nivel:'normal', motivo:hit.label });
    return Object.assign(base, { nivel:'sem_criterios', motivo:'Nenhum critério de referenciação selecionado.',
      falta:(pat.prioridade || []).filter(c => c.nivel === 'normal' && optVisivel(c, state)).map(c => c.label) });
  }
  // gate 'padrao': conservador cumprido + achados exigidos + AVD (+ motivado)
  const falta = [];
  if (DUR_RANK[durEfetiva(state)] < minRank(pat.minConservadorMeses || 0))
    falta.push('Tratamento conservador com duração mínima de ' + pat.minConservadorMeses + ' meses');
  const ach = state['ach_' + pat.id] || [];
  (pat.exigeAchados || []).forEach(a => { if (ach.indexOf(a.value) === -1) falta.push(a.label); });
  const crit = state.crit_normal || [];
  if (crit.indexOf('avd') === -1) falta.push('Queixas limitativas para as AVDs');
  if (pat.requerMotivacao !== false && crit.indexOf('motivado') === -1)
    falta.push('Doente aceita e está motivado para tratamento cirúrgico');
  if (!falta.length) return Object.assign(base, { nivel:'normal', motivo:'Critérios de referenciação NORMAL cumpridos.' });
  return Object.assign(base, { nivel:'sem_criterios', motivo:'Critérios NORMAL incompletos.', falta:falta });
}

/* ---------- texto ---------- */
const lbl = (opts, vals) => (opts || []).filter(o => (vals || []).indexOf(o.value) !== -1).map(o => o.label);
const LADO = { dto:'direito', esq:'esquerdo', bilat:'bilateral' };
const DUR_TXT = { none:'sem tratamento conservador prévio', lt3:'< 3 meses', m3_6:'3–6 meses', ge6:'≥ 6 meses' };
const UNIT_PT = { weeks:['semana','semanas'], months:['mês','meses'], years:['ano','anos'] };
const MES_PT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

// reconstrói a leitura do widget onset a partir do estado do stack (evol_mode/_dur/_unit/_year/_month)
function evolTxt(state, id) {
  id = id || 'evol';
  if (state[id + '_mode'] === 'duration' && state[id + '_dur'] != null && state[id + '_unit']) {
    const n = state[id + '_dur'], u = UNIT_PT[state[id + '_unit']] || UNIT_PT.weeks;
    return 'há ' + n + ' ' + (n === 1 ? u[0] : u[1]);
  }
  if (state[id + '_year']) {
    const m = state[id + '_month'];
    return 'desde ' + (m ? MES_PT[m - 1] + ' de ' : '') + state[id + '_year'];
  }
  return null;
}

function buildText(state, pat, dec, ORTO) {
  if (!pat || dec.nivel === 'incompleto') return { titulo:'', texto:'' };
  const registo = dec.nivel === 'sem_criterios';
  const sexo = state.sexo === 'm' ? 'masculino' : state.sexo === 'f' ? 'feminino' : null;
  const comorb = lbl(ORTO.comorbilidades.options, (state.comorb || []).filter(c => c !== 'none'));
  const ach = lbl(pat.doenteTipo, state['ach_' + pat.id]);
  const prio = lbl((pat.prioridade || []).filter(o => optVisivel(o, state)), state['prio_' + pat.id]);
  const mcdt = lbl(pat.mcdt, state['mcdt_' + pat.id]);
  const trat = lbl((pat.tratamento || []).filter(o => optVisivel(o, state)), state['trat_' + pat.id]);
  const crit = lbl([{value:'avd',label:'queixas limitativas para as AVDs'},
                    {value:'motivado',label:'doente aceita e está motivado para tratamento cirúrgico'}], state.crit_normal);
  const evol = evolTxt(state);

  const L = [];
  // 1.ª linha = região (tipologia de consulta da aplicação interna) + decisão/prioridade
  const reg = (ORTO.regioes.find(r => r.id === state.regiao) || {}).label;
  L.push(((reg || pat.nome) + ' — ' + NIVEL[dec.nivel].label).toUpperCase());
  L.push('');
  const motivo = [pat.nome,
    pat.lado && state.lado ? 'lado ' + LADO[state.lado] : null,
    evol ? 'evolução ' + evol : null].filter(Boolean).join(', ');
  L.push('MOTIVO: ' + motivo + '.');
  if (!registo && dec.nivel !== 'mfr') {
    L.push('');
    L.push('PRIORIDADE PROPOSTA: ' + NIVEL[dec.nivel].label + (dec.motivo ? ' — ' + dec.motivo : ''));
  }
  if (dec.nivel === 'mfr') { L.push(''); L.push('ORIENTAÇÃO: ' + dec.motivo); }
  L.push('');
  const cab = [state.idade != null && state.idade !== '' ? state.idade + ' anos' : null,
               sexo ? 'sexo ' + sexo : null].filter(Boolean).join(', ');
  L.push('HISTÓRIA CLÍNICA: ' + (cab || '—') + '.');
  L.push('Antecedentes: ' + (comorb.length ? comorb.join(', ') : 'sem comorbilidades relevantes') + '.');
  if (state.imc) {
    const pesoAlt = (state.imc_weight != null && state.imc_height != null)
      ? ' (peso ' + state.imc_weight + ' kg, altura ' + state.imc_height + ' cm)' : '';
    L.push('IMC: ' + (Math.round(state.imc * 10) / 10) + ' kg/m²' + pesoAlt + '.');
  }
  const det = (pat.detalhes || [])
    .map(d => ({ label:d.label, v: state['det_' + pat.id + '_' + d.id] }))
    .filter(x => x.v != null && x.v !== '');
  if (ach.length || det.length) {
    L.push('');
    if (ach.length) L.push('QUADRO CLÍNICO: ' + ach.join('; ') + '.');
    det.forEach(x => L.push(x.label + ': ' + x.v + '.'));
  }
  if (prio.length || crit.length) {
    L.push('');
    if (prio.length) L.push('CRITÉRIOS PRESENTES: ' + prio.join('; ') + '.');
    if (crit.length) L.push((prio.length ? 'Adicionalmente: ' : 'CRITÉRIOS PRESENTES: ') + crit.join('; ') + '.');
  }
  L.push('');
  L.push('MCDT: ' + (mcdt.length ? mcdt.join('; ') : 'nenhum realizado') + '.');
  // em EMERGENTE o doente segue para o SU — os MCDT do protocolo de consulta deixam de ser exigíveis
  if (dec.mcdtEmFalta.length && dec.nivel !== 'su') L.push('MCDT em falta (protocolo): ' + dec.mcdtEmFalta.join('; ') + '.');
  L.push('');
  const durTxt = trat.length ? durEfetiva(state) : state.tratdur;   // derivada só faz sentido com tratamento feito
  L.push('TRATAMENTO PRÉVIO: ' + (trat.length ? trat.join('; ') : 'não efetuado')
    + (durTxt && durTxt !== 'none' ? ' (' + DUR_TXT[durTxt] + ')' : '') + '.');
  if (registo) {
    L.push('');
    L.push('AVALIAÇÃO: sem critérios atuais de referenciação a Ortopedia (Documento de Trabalho ULSM).');
    if (dec.falta.length) L.push('Em falta: ' + dec.falta.join('; ') + '.');
    L.push('');
    const planoTrat = (pat.tratamento || []).filter(o => optVisivel(o, state));
    if (planoTrat.length)
      L.push('PLANO: manter/otimizar tratamento conservador — ' + planoTrat.map(t => t.label).join('; ')
        + (pat.minConservadorMeses ? ' (duração mínima ' + pat.minConservadorMeses + ' meses)' : '') + '.');
    else
      L.push('PLANO: vigilância; referenciar quando cumprir os critérios acima.');
  }
  return { titulo: L[0], texto: L.join('\n') };
}

/* ---------- folheto para o doente ---------- */
const FOLHETO_INTRO = {
  su:            'Deve dirigir-se hoje ao Serviço de Urgência, como indicado pelo seu médico.',
  mp15:          'Foi pedida consulta de Ortopedia com carácter muito prioritário. Enquanto aguarda:',
  p60:           'Foi pedida consulta de Ortopedia com prioridade. Enquanto aguarda:',
  normal:        'Foi pedida consulta de Ortopedia. Enquanto aguarda:',
  mfr:           'Foi orientado para consulta de Medicina Física e Reabilitação (fisiatria). Enquanto aguarda:',
  sem_criterios: 'Nesta fase, o tratamento indicado é conservador (sem cirurgia). O seu plano:',
};

function buildFolheto(state, pat, dec, ORTO) {
  if (!pat || dec.nivel === 'incompleto') return { titulo:'', texto:'' };
  const L = [];
  L.push('INFORMAÇÃO PARA O DOENTE — ' + pat.nome.toUpperCase());
  L.push('');
  if (pat.leigo) { L.push('O QUE É: ' + pat.leigo); L.push(''); }
  L.push(FOLHETO_INTRO[dec.nivel]);
  if (dec.nivel !== 'su') {
    const passos = (pat.tratamento || []).filter(t => optVisivel(t, state)).map(t => ORTO.tratamentoLeigo[t.value]).filter(Boolean);
    passos.forEach(p => L.push('• ' + p));
    if (!passos.length) L.push('• Siga as indicações dadas na consulta.');
    if (dec.nivel === 'sem_criterios' && pat.minConservadorMeses) {
      L.push('');
      L.push('Este tratamento deve ser mantido, de forma continuada, durante pelo menos '
        + pat.minConservadorMeses + ' meses antes de reavaliar a necessidade de consulta hospitalar.');
    }
    if (pat.anexo === 'anexo1' && ORTO.anexo1) {
      L.push('');
      L.push(ORTO.anexo1.titulo.toUpperCase() + ':');
      ORTO.anexo1.passos.forEach((p, i) => L.push((i + 1) + '. ' + p));
    }
  }
  // em EMERGENTE o doente vai já ao SU — sinais de alarme e reavaliação não se aplicam
  if (dec.nivel !== 'su') {
    L.push('');
    L.push('SINAIS DE ALARME — procure ajuda médica se tiver:');
    (ORTO.alarmeDoente || []).filter(al => optVisivel(al, state)).forEach(al => L.push('• ' + (al.texto || al)));
    L.push('');
    L.push('Se as queixas se agravarem ou persistirem apesar do tratamento, volte a marcar consulta com o seu médico de família.');
  }
  return { titulo: L[0], texto: L.join('\n') };
}

const OrtoEngine = { decide:decide, buildText:buildText, buildFolheto:buildFolheto, NIVEL:NIVEL };
root.OrtoEngine = OrtoEngine;
if (typeof module !== 'undefined' && module.exports) module.exports = OrtoEngine;
})(typeof window !== 'undefined' ? window : globalThis);
