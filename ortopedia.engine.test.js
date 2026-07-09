'use strict';
const assert = require('assert');
const ORTO = require('./ortopedia.schema.js');
const E = require('./ortopedia.engine.js');

/* — integridade do schema — */
const ids = new Set();
ORTO.patologias.forEach(p => {
  assert(!ids.has(p.id), 'id duplicado: ' + p.id); ids.add(p.id);
  assert(ORTO.regioes.some(r => r.id === p.regiao), p.id + ': região inválida');
  ['nome','cardDesc','doenteTipo','prioridade','mcdt','tratamento','normalGate'].forEach(k =>
    assert(p[k] !== undefined, p.id + ' sem ' + k));
  assert(['padrao','criterios','sempre','mfr'].includes(p.normalGate), p.id + ': normalGate inválido');
  p.prioridade.forEach(c => assert(['su','mp15','p60','normal'].includes(c.nivel), p.id + '/' + c.value + ': nivel inválido'));
  if (p.normalGate === 'criterios')
    assert(p.prioridade.some(c => c.nivel === 'normal'), p.id + ': gate criterios sem chips nivel normal');
  const vals = new Set();
  [].concat(p.doenteTipo, p.prioridade, p.mcdt, p.tratamento).forEach(o => {
    // valores únicos DENTRO de cada campo; entre campos podem repetir (campos distintos)
  });
  ['doenteTipo','prioridade','mcdt','tratamento'].forEach(k => {
    const seen = new Set();
    p[k].forEach(o => { assert(!seen.has(o.value), p.id + '/' + k + ': valor duplicado ' + o.value); seen.add(o.value); });
  });
});

// faixa etária típica: presente e coerente em todas
ORTO.patologias.forEach(p => {
  assert(p.faixa && p.faixa.min >= 0 && p.faixa.max <= 120 && p.faixa.min <= p.faixa.max, p.id + ': faixa inválida');
});
assert(ORTO.faixaMatch(ORTO.patologias.find(p => p.id === 'omartrose'), 70), 'omartrose devia incluir 70 anos');
assert(!ORTO.faixaMatch(ORTO.patologias.find(p => p.id === 'instabilidade_ombro'), 70), 'instabilidade não devia incluir 70');
assert(!ORTO.faixaMatch(ORTO.patologias.find(p => p.id === 'omartrose'), null), 'sem idade → sem match');

const st = (patId, extra) => {
  const p = ORTO.patologias.find(x => x.id === patId);
  return Object.assign({ regiao:p.regiao, ['pat_' + p.regiao]:patId, idade:55, sexo:'m' }, extra);
};
const pat = id => ORTO.patologias.find(x => x.id === id);

// 1. EMERGENTE→SU: tendinite calcificante hiperálgica
assert.equal(E.decide(st('tend_calc', { prio_tend_calc:['hiperalgica'] }), pat('tend_calc')).nivel, 'su');
// 2. MFR: tendinite calcificante sem critério emergente
assert.equal(E.decide(st('tend_calc', {}), pat('tend_calc')).nivel, 'mfr');
// 3. MP15: coifa com rutura traumática aguda
assert.equal(E.decide(st('coifa', { prio_coifa:['rutura_traum'] }), pat('coifa')).nivel, 'mp15');
// 4. P60: coifa jovem desportista
assert.equal(E.decide(st('coifa', { prio_coifa:['jovem_desp'] }), pat('coifa')).nivel, 'p60');
// 5. NORMAL: coifa com conservador ≥6m + AVD + motivado
assert.equal(E.decide(st('coifa', { tratdur:'ge6', crit_normal:['avd','motivado'] }), pat('coifa')).nivel, 'normal');
// 6. SEM CRITÉRIOS: coifa com 3–6m (mínimo 6) → falta cita a duração
const d6 = E.decide(st('coifa', { tratdur:'m3_6', crit_normal:['avd','motivado'] }), pat('coifa'));
assert.equal(d6.nivel, 'sem_criterios');
assert(d6.falta.some(f => f.indexOf('6') !== -1), 'falta deve citar mínimo 6 meses');
// 7. SEMPRE: displasia → mp15 sem chips
assert.equal(E.decide(st('displasia_anca', {}), pat('displasia_anca')).nivel, 'mp15');
// 8. incompleto: sem patologia
assert.equal(E.decide({ regiao:'ombro' }, null).nivel, 'incompleto');
// 9. cascata: SU ganha a MP15 (lombar com défice + dúvida)
assert.equal(E.decide(st('lombar', { prio_lombar:['defice_neuro','duvida_defice'] }), pat('lombar')).nivel, 'su');
// 10. MCDT em falta sinalizados
const dm = E.decide(st('coifa', { tratdur:'ge6', crit_normal:['avd','motivado'], mcdt_coifa:['rx_ombro'] }), pat('coifa'));
assert(dm.mcdtEmFalta.length === 1 && dm.mcdtEmFalta[0].indexOf('Ecografia') !== -1, 'eco em falta');
// 11. aviso etário: displasia com idade adulta
assert(E.decide(st('displasia_anca', { idade:40 }), pat('displasia_anca')).avisos.some(a => /idade/i.test(a)));
// 12. texto de referenciação contém prioridade, patologia e lado
const s12 = st('coifa', { prio_coifa:['rutura_traum'], lado:'dto' });
const dec12 = E.decide(s12, pat('coifa'));
const txt = E.buildText(s12, pat('coifa'), dec12, ORTO);
assert(/MUITO PRIORIT/i.test(txt.texto), 'texto sem prioridade');
assert(/coifa/i.test(txt.texto), 'texto sem patologia');
assert(/direito/i.test(txt.texto.toLowerCase()), 'texto sem lado');
// 13. sem critérios → texto de registo clínico com plano
const s13 = st('coifa', { tratdur:'lt3' });
const t13 = E.buildText(s13, pat('coifa'), E.decide(s13, pat('coifa')), ORTO);
assert(/REGISTO/i.test(t13.titulo), 'devia ser registo clínico');
assert(/PLANO/i.test(t13.texto), 'registo sem plano conservador');
// 14. gate criterios: dismetria só com chip >1,5 cm
assert.equal(E.decide(st('dismetria', {}), pat('dismetria')).nivel, 'sem_criterios');
assert.equal(E.decide(st('dismetria', { prio_dismetria:['maior15'] }), pat('dismetria')).nivel, 'normal');
// 15. exigeAchados: Dupuytren sem Hueston não é NORMAL; com Hueston + AVD + motivado é
const dDup1 = E.decide(st('dupuytren', { crit_normal:['avd','motivado'] }), pat('dupuytren'));
assert.equal(dDup1.nivel, 'sem_criterios');
assert(dDup1.falta.some(f => /hueston/i.test(f)), 'falta deve citar Hueston');
assert.equal(E.decide(st('dupuytren', { ach_dupuytren:['hueston'], crit_normal:['avd','motivado'] }), pat('dupuytren')).nivel, 'normal');
// 16. prótese: sem motivado (requerMotivacao:false) — conservador + AVD chega
assert.equal(E.decide(st('dor_protese', { tratdur:'m3_6', crit_normal:['avd'] }), pat('dor_protese')).nivel, 'normal');
// 17b. MFR → título de referenciação a MFR
const s17b = st('capsulite', {});
const t17b = E.buildText(s17b, pat('capsulite'), E.decide(s17b, pat('capsulite')), ORTO);
assert(/REFERENCIAÇÃO A MFR/.test(t17b.titulo), 'título MFR errado: ' + t17b.titulo);
// 17. onset em texto: duração 4 meses
const s17 = st('coifa', { prio_coifa:['rutura_traum'], evol_mode:'duration', evol_dur:4, evol_unit:'months' });
assert(/há 4 meses/.test(E.buildText(s17, pat('coifa'), E.decide(s17, pat('coifa')), ORTO).texto), 'evolução em falta no texto');

// 18. IMC com peso/altura no relatório (arredondado a 1 casa)
const s18 = st('gonalgia', { prio_gonalgia:['jovem_desp'], imc:27.68, imc_weight:80, imc_height:170 });
const t18 = E.buildText(s18, pat('gonalgia'), E.decide(s18, pat('gonalgia')), ORTO);
assert(/IMC: 27\.7 kg\/m² \(peso 80 kg, altura 170 cm\)/.test(t18.texto), 'linha de IMC errada: ' + t18.texto.match(/IMC.*/));

// 19. detalhes textuais no relatório (neoformação)
const s19 = st('neoformacao', { det_neoformacao_morfologia:'nódulo duro dorsal ~2 cm', det_neoformacao_crescimento:'estável há 2 anos' });
const t19 = E.buildText(s19, pat('neoformacao'), E.decide(s19, pat('neoformacao')), ORTO);
assert(/Aspeto morfológico da lesão: nódulo duro dorsal ~2 cm\./.test(t19.texto), 'detalhe morfologia em falta');
assert(/Ritmo de crescimento: estável há 2 anos\./.test(t19.texto), 'detalhe crescimento em falta');

// — folheto para o doente —
ORTO.patologias.forEach(p => assert(p.leigo && p.leigo.length > 10, p.id + ': sem explicação leiga'));
ORTO.patologias.forEach(p => (p.tratamento || []).forEach(t =>
  assert(ORTO.tratamentoLeigo[t.value], p.id + '/' + t.value + ': tratamento sem versão leiga')));
// 20. fasceíte sem critérios → plano conservador + exercícios do Anexo 1
const s20 = st('fasceite', { trat_fasceite:['aines'], tratdur:'lt3' });
const f20 = E.buildFolheto(s20, pat('fasceite'), E.decide(s20, pat('fasceite')), ORTO);
assert(/tratamento indicado é conservador/.test(f20.texto), 'intro conservador em falta');
assert(/EXERCÍCIOS DIÁRIOS/i.test(f20.texto) && /toalha/.test(f20.texto), 'exercícios do Anexo 1 em falta');
assert(/pelo menos 6 meses/.test(f20.texto), 'duração mínima em falta no folheto');
assert(/SINAIS DE ALARME/.test(f20.texto), 'sinais de alarme em falta');
// 21. coifa MP15 → intro "muito prioritário"; SU → só urgência, sem plano
const s21 = st('coifa', { prio_coifa:['rutura_traum'] });
assert(/muito prioritário/.test(E.buildFolheto(s21, pat('coifa'), E.decide(s21, pat('coifa')), ORTO).texto));
const s21b = st('tend_calc', { prio_tend_calc:['hiperalgica'] });
const f21b = E.buildFolheto(s21b, pat('tend_calc'), E.decide(s21b, pat('tend_calc')), ORTO);
assert(/Serviço de Urgência/.test(f21b.texto) && !/Fisioterapia\./.test(f21b.texto), 'SU não deve ter plano conservador');
assert(!/SINAIS DE ALARME/.test(f21b.texto), 'SU não deve ter sinais de alarme no folheto');
assert(!/volte a marcar consulta/.test(f21b.texto), 'SU não deve ter nota de reavaliação');
// …mas fora do SU mantêm-se (fasceíte sem critérios, cenário 20)
assert(/SINAIS DE ALARME/.test(f20.texto) && /volte a marcar consulta/.test(f20.texto), 'fora do SU o folheto mantém alarmes e reavaliação');

// 22. EMERGENTE → texto sem "MCDT em falta (protocolo)"
const s22 = st('tend_calc', { prio_tend_calc:['hiperalgica'] }); // nenhum MCDT selecionado
const d22 = E.decide(s22, pat('tend_calc'));
assert.equal(d22.nivel, 'su');
assert(d22.mcdtEmFalta.length > 0, 'cenário devia ter MCDT em falta');
assert(!/MCDT em falta/.test(E.buildText(s22, pat('tend_calc'), d22, ORTO).texto), 'EMERGENTE não deve listar MCDT em falta');
// …mas nos restantes níveis continua a aparecer
const s22b = st('coifa', { prio_coifa:['rutura_traum'] });
assert(/MCDT em falta/.test(E.buildText(s22b, pat('coifa'), E.decide(s22b, pat('coifa')), ORTO).texto), 'MP15 deve manter MCDT em falta');

console.log('OK — todos os testes passaram');
