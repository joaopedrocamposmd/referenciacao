/* Referenciação Ortopedia ULSM — notas clínicas por região.
   Painel colapsado no fim do passo "Patologia": distinção rápida entre as opções +
   manobras de exame físico (como fazer / positivo se) + ilustrações esquemáticas.
   CONTEÚDO AUXILIAR (boa prática geral), fora do documento do protocolo. */
(function (root) {
'use strict';

/* ---------- ilustrações (SVG esquemático, tokens da marca) ---------- */

// árvore de decisão do ombro: mobilidade passiva é a bifurcação-chave
const SVG_OMBRO = `
<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Árvore de decisão do ombro">
  <style>.nb{fill:var(--s1);stroke:var(--bdr2);rx:8}.nt{font:600 12px Inter,sans-serif;fill:var(--t1)}.ns{font:11px Inter,sans-serif;fill:var(--t3)}.ln{stroke:var(--teal);stroke-width:1.5;fill:none}.lb{font:700 10px 'IBM Plex Mono',monospace;fill:var(--teal)}</style>
  <rect class="nb" x="215" y="12" width="210" height="44" rx="8"/>
  <text class="nt" x="320" y="30" text-anchor="middle">Mobilidade PASSIVA</text>
  <text class="ns" x="320" y="46" text-anchor="middle">(o examinador mobiliza, doente relaxado)</text>
  <path class="ln" d="M260 56 L150 96"/><text class="lb" x="180" y="72">LIMITADA</text>
  <path class="ln" d="M380 56 L490 96"/><text class="lb" x="420" y="72">LIVRE</text>
  <rect class="nb" x="40" y="98" width="220" height="40" rx="8"/>
  <text class="nt" x="150" y="122" text-anchor="middle">Rigidez global (capsular)</text>
  <path class="ln" d="M100 138 L100 172"/><path class="ln" d="M200 138 L200 172"/>
  <rect class="nb" x="20" y="174" width="150" height="56" rx="8"/>
  <text class="nt" x="95" y="194" text-anchor="middle">Capsulite adesiva</text>
  <text class="ns" x="95" y="210" text-anchor="middle">Rx normal · meia-idade</text>
  <text class="ns" x="95" y="224" text-anchor="middle">RE passiva ++ limitada</text>
  <rect class="nb" x="180" y="174" width="150" height="56" rx="8"/>
  <text class="nt" x="255" y="194" text-anchor="middle">Omartrose</text>
  <text class="ns" x="255" y="210" text-anchor="middle">Rx com artrose · idoso</text>
  <text class="ns" x="255" y="224" text-anchor="middle">crepitação · mecânica</text>
  <rect class="nb" x="380" y="98" width="220" height="40" rx="8"/>
  <text class="nt" x="490" y="122" text-anchor="middle">Dor com passiva livre</text>
  <path class="ln" d="M430 138 L410 172"/><path class="ln" d="M490 138 L490 172"/><path class="ln" d="M550 138 L575 172"/>
  <rect class="nb" x="345" y="174" width="120" height="56" rx="8"/>
  <text class="nt" x="405" y="194" text-anchor="middle">Coifa</text>
  <text class="ns" x="405" y="210" text-anchor="middle">Jobe/Patte/Gerber +</text>
  <text class="ns" x="405" y="224" text-anchor="middle">fraqueza · noite ++</text>
  <rect class="nb" x="430" y="240" width="130" height="50" rx="8"/>
  <text class="nt" x="495" y="258" text-anchor="middle">T. calcificante</text>
  <text class="ns" x="495" y="274" text-anchor="middle">dor aguda intensa · Rx c/ calcificação</text>
  <rect class="nb" x="515" y="174" width="115" height="56" rx="8"/>
  <text class="nt" x="572" y="194" text-anchor="middle">Instabilidade</text>
  <text class="ns" x="572" y="210" text-anchor="middle">jovem · apreensão +</text>
  <text class="ns" x="572" y="224" text-anchor="middle">luxações prévias</text>
</svg>`;

// derrame pós-torção do joelho: o TEMPO até ao derrame orienta a lesão
const SVG_JOELHO = `
<svg viewBox="0 0 640 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cronologia do derrame pós-torção">
  <style>.tt{font:600 12px Inter,sans-serif;fill:var(--t1)}.ts{font:11px Inter,sans-serif;fill:var(--t3)}.mk{font:700 11px 'IBM Plex Mono',monospace;fill:var(--teal)}.ax{stroke:var(--bdr2);stroke-width:2}</style>
  <line class="ax" x1="40" y1="70" x2="600" y2="70"/>
  <circle cx="40" cy="70" r="5" fill="var(--red)"/>
  <text class="mk" x="40" y="52" text-anchor="middle">torção</text>
  <circle cx="220" cy="70" r="5" fill="var(--red)"/>
  <text class="mk" x="220" y="52" text-anchor="middle">&lt; 2 horas</text>
  <text class="tt" x="220" y="98" text-anchor="middle">Hemartrose</text>
  <text class="ts" x="220" y="114" text-anchor="middle">LCA · luxação da rótula · fratura osteocondral</text>
  <text class="ts" x="220" y="130" text-anchor="middle">→ critério EMERGENTE do protocolo</text>
  <circle cx="480" cy="70" r="5" fill="var(--amber)"/>
  <text class="mk" x="480" y="52" text-anchor="middle">24–48 horas</text>
  <text class="tt" x="480" y="98" text-anchor="middle">Derrame seroso</text>
  <text class="ts" x="480" y="114" text-anchor="middle">lesão meniscal · inflamatório</text>
</svg>`;

// Barlow / Ortolani esquemático (ancas fletidas; setas de manobra)
const SVG_BARLOW = `
<svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Barlow e Ortolani">
  <style>.tt{font:700 13px Inter,sans-serif;fill:var(--teal)}.ts{font:11px Inter,sans-serif;fill:var(--t3)}.bone{fill:none;stroke:var(--t2);stroke-width:6;stroke-linecap:round}.pelv{fill:var(--teal-bg);stroke:var(--teal);stroke-width:2}.arr{stroke:var(--amber);stroke-width:3;fill:none;marker-end:url(#ah)}</style>
  <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--amber)"/></marker></defs>
  <text class="tt" x="160" y="26" text-anchor="middle">BARLOW — provoca</text>
  <ellipse class="pelv" cx="160" cy="70" rx="70" ry="26"/>
  <circle cx="130" cy="92" r="9" fill="var(--t2)"/>
  <path class="bone" d="M130 92 L110 150 L150 190"/>
  <path class="arr" d="M110 118 L138 104"/>
  <path class="arr" d="M96 150 L96 112"/>
  <text class="ts" x="160" y="216" text-anchor="middle">Aduzir a coxa + pressão posterior:</text>
  <text class="ts" x="160" y="230" text-anchor="middle">a cabeça LUXA para trás (ressalto de saída)</text>
  <text class="tt" x="480" y="26" text-anchor="middle">ORTOLANI — reduz</text>
  <ellipse class="pelv" cx="480" cy="70" rx="70" ry="26"/>
  <circle cx="522" cy="98" r="9" fill="var(--t2)"/>
  <path class="bone" d="M522 98 L560 148 L520 190"/>
  <path class="arr" d="M560 120 L528 102"/>
  <path class="arr" d="M588 148 L588 186"/>
  <text class="ts" x="480" y="216" text-anchor="middle">Abduzir + elevar o grande trocânter:</text>
  <text class="ts" x="480" y="230" text-anchor="middle">a cabeça REDUZ com "clunk" (ressalto de entrada)</text>
</svg>`;

// Galeazzi + Adams num só quadro
const SVG_GALEAZZI_ADAMS = `
<svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Galeazzi e Adams">
  <style>.tt{font:700 13px Inter,sans-serif;fill:var(--teal)}.ts{font:11px Inter,sans-serif;fill:var(--t3)}.ln{fill:none;stroke:var(--t2);stroke-width:6;stroke-linecap:round;stroke-linejoin:round}.ref{stroke:var(--amber);stroke-width:2;stroke-dasharray:5 4}</style>
  <text class="tt" x="160" y="26" text-anchor="middle">GALEAZZI</text>
  <line class="ln" x1="60" y1="160" x2="270" y2="160"/>
  <path class="ln" d="M90 160 L90 120 L130 120 L130 160"/>
  <path class="ln" d="M180 160 L180 100 L225 100 L225 160"/>
  <line class="ref" x1="60" y1="100" x2="270" y2="100"/>
  <text class="ts" x="160" y="192" text-anchor="middle">Decúbito dorsal, pés apoiados, ancas e joelhos fletidos:</text>
  <text class="ts" x="160" y="206" text-anchor="middle">joelhos a ALTURAS DIFERENTES = positivo (&gt; 3 meses)</text>
  <text class="tt" x="480" y="26" text-anchor="middle">ADAMS</text>
  <path class="ln" d="M400 170 L430 170 L470 96 L540 78"/>
  <path class="ln" d="M470 96 Q490 70 512 74"/>
  <ellipse cx="497" cy="84" rx="16" ry="9" fill="var(--amber)" opacity="0.85"/>
  <text class="ts" x="480" y="192" text-anchor="middle">Flexão anterior do tronco, vista por trás:</text>
  <text class="ts" x="480" y="206" text-anchor="middle">GIBA torácica/lombar unilateral = rotação vertebral (escoliose)</text>
</svg>`;

// evolução fisiológica varo→valgo (curva por idade)
const SVG_VARO_VALGO = `
<svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Evolução fisiológica varo-valgo">
  <style>.ax{stroke:var(--bdr2);stroke-width:2}.gr{stroke:var(--bdr);stroke-width:1}.cv{fill:none;stroke:var(--teal);stroke-width:3}.tt{font:600 11px Inter,sans-serif;fill:var(--t2)}.mk{font:700 10px 'IBM Plex Mono',monospace;fill:var(--t3)}.zz{font:700 11px 'IBM Plex Mono',monospace;fill:var(--teal)}</style>
  <line class="ax" x1="60" y1="120" x2="600" y2="120"/>
  <line class="ax" x1="60" y1="30" x2="60" y2="210"/>
  <text class="zz" x="30" y="60" transform="rotate(-90 30 60)">VARO</text>
  <text class="zz" x="30" y="200" transform="rotate(-90 30 200)">VALGO</text>
  <text class="mk" x="60" y="228" text-anchor="middle">0</text>
  <text class="mk" x="170" y="228" text-anchor="middle">18 m</text>
  <text class="mk" x="240" y="228" text-anchor="middle">2 a</text>
  <text class="mk" x="360" y="228" text-anchor="middle">3–5 a</text>
  <text class="mk" x="540" y="228" text-anchor="middle">7–8 a</text>
  <path class="cv" d="M60 60 C120 60 140 110 170 120 C220 138 260 185 360 185 C450 185 500 152 600 148"/>
  <circle cx="60" cy="60" r="4" fill="var(--teal)"/><text class="tt" x="86" y="52">varo fisiológico</text>
  <circle cx="170" cy="120" r="4" fill="var(--teal)"/><text class="tt" x="176" y="106">neutro 14–24 m</text>
  <circle cx="360" cy="185" r="4" fill="var(--teal)"/><text class="tt" x="322" y="205">pico de valgo</text>
  <circle cx="600" cy="148" r="4" fill="var(--teal)"/><text class="tt" x="500" y="136">valgo adulto 5–7°</text>
</svg>`;

/* ---------- manobras e distinção por região ---------- */

const NOTAS = {
  ombro: {
    intro: 'A bifurcação-chave é a mobilidade PASSIVA: limitada = problema articular/capsular; livre com dor = coifa, calcificação ou instabilidade.',
    svg: SVG_OMBRO,
    manobras: [
      { nome:'Jobe (empty can)', como:'Braço a 90° no plano da omoplata, polegar para baixo; o doente resiste à pressão descendente.', positivo:'Dor/fraqueza → supraespinhoso (coifa).' },
      { nome:'Patte', como:'Cotovelo a 90°, braço a 90° de abdução; rotação externa contra resistência.', positivo:'Fraqueza → infraespinhoso.' },
      { nome:'Gerber (lift-off)', como:'Dorso da mão na região lombar; afastar a mão das costas contra resistência.', positivo:'Incapacidade → subescapular.' },
      { nome:'Arco doloroso', como:'Elevação ativa do braço.', positivo:'Dor entre 60–120° → conflito subacromial/coifa.' },
      { nome:'Apreensão', como:'Abdução 90° + rotação externa progressiva.', positivo:'Medo de luxação (não só dor) → instabilidade anterior.' },
    ],
  },
  cotovelo: {
    intro: 'Dor lateral vs medial define a epicondilite; rigidez com crepitação e perda de extensão apontam para artrose.',
    manobras: [
      { nome:'Cozen', como:'Cotovelo estendido; extensão do punho contra resistência.', positivo:'Dor no epicôndilo lateral ("cotovelo de tenista").' },
      { nome:'Mill', como:'Cotovelo estendido; pronação + flexão passiva do punho.', positivo:'Dor no epicôndilo lateral.' },
      { nome:'Epicondilite medial', como:'Flexão do punho/pronação contra resistência.', positivo:'Dor no epicôndilo medial ("golfista").' },
      { nome:'Artrose', como:'Mobilizar passivamente todo o arco.', positivo:'Perda de extensão, crepitação, dor mecânica em fim de arco.' },
    ],
  },
  punho_mao: {
    intro: 'A localização da dor e o território das parestesias separam as quatro entidades sem exames.',
    manobras: [
      { nome:'Finkelstein', como:'Polegar fechado na palma; desvio cubital passivo do punho.', positivo:'Dor no bordo radial → De Quervain.' },
      { nome:'Phalen', como:'Flexão máxima dos punhos, dorsos em contacto, 60 segundos.', positivo:'Parestesias no território do mediano (poupam o 5.º dedo) → canal cárpico.' },
      { nome:'Durkan', como:'Compressão direta do canal cárpico, 30 segundos.', positivo:'Parestesias do mediano.' },
      { nome:'Tinel', como:'Percussão sobre o mediano no punho.', positivo:'Formigueiro irradiado aos dedos.' },
      { nome:'Grind test', como:'Compressão axial + rotação do 1.º metacárpico contra o trapézio.', positivo:'Dor/crepitação na base do polegar → rizartrose.' },
      { nome:'Hueston', como:'Apoiar a mão espalmada na mesa.', positivo:'Palma não apoia (contratura em flexão) → Dupuytren com indicação.' },
    ],
  },
  anca: {
    intro: 'Dor inguinal é anca até prova em contrário; a rotação interna passiva limitada e dolorosa é o sinal mais precoce de coxartrose.',
    manobras: [
      { nome:'FADIR', como:'Flexão 90° + adução + rotação interna passivas.', positivo:'Dor inguinal → conflito femoroacetabular/labrum (jovem).' },
      { nome:'FABER (Patrick)', como:'Figura-de-4: flexão + abdução + rotação externa.', positivo:'Dor inguinal → anca; dor posterior → sacroilíaca.' },
      { nome:'Rotação interna passiva', como:'Decúbito dorsal, anca e joelho a 90°; rodar internamente.', positivo:'Limitação e dor → coxartrose precoce.' },
      { nome:'Distinção com a coluna', como:'Dor glútea com irradiação abaixo do joelho e Lasègue positivo.', positivo:'Radiculopatia lombar, não anca; dor lateral à palpação do trocânter → peritrocantérica.' },
    ],
  },
  joelho: {
    intro: 'Na torção, o tempo até ao derrame orienta a lesão; o bloqueio verdadeiro (perda elástica de extensão) sugere menisco/corpo livre.',
    svg: SVG_JOELHO,
    manobras: [
      { nome:'Lachman', como:'Joelho a 20–30°; gaveta anterior suave da tíbia.', positivo:'Deslocação sem fim firme → LCA (o mais sensível).' },
      { nome:'McMurray', como:'Flexão máxima; rotação da tíbia + extensão progressiva.', positivo:'Clique/dor na interlinha → menisco.' },
      { nome:'Stress valgo/varo', como:'A 0° e 30° de flexão.', positivo:'Abertura a 30° → colateral isolado; a 0° → lesão combinada.' },
      { nome:'Apreensão rotuliana', como:'Empurrar a rótula lateralmente com joelho a 20–30°.', positivo:'Medo/defesa → instabilidade rotuliana.' },
    ],
  },
  pe_tornozelo: {
    intro: 'O local exato da dor + três manobras simples separam quase todas as entidades do antepé/retropé.',
    manobras: [
      { nome:'Windlass', como:'Dorsiflexão passiva do hálux em carga.', positivo:'Dor na origem da fáscia → fasceíte plantar.' },
      { nome:'Thompson', como:'Decúbito ventral; apertar a massa gemelar.', positivo:'SEM flexão plantar do pé → rotura do Aquiles (enviar ao SU).' },
      { nome:'Gaveta anterior do tornozelo', como:'Calcanhar tracionado anteriormente com tíbia fixa.', positivo:'Deslocação aumentada → instabilidade lateral (LTFA).' },
      { nome:'Mulder', como:'Compressão transversal do antepé + pressão plantar no 3.º espaço.', positivo:'Clique doloroso → neuroma de Morton.' },
      { nome:'Teste em pontas + "too many toes"', como:'Observar por trás em pontas dos pés.', positivo:'Retropé NÃO corrige para varo / muitos dedos visíveis lateralmente → pé plano adquirido (tibial posterior).' },
    ],
  },
  coluna: {
    intro: 'Distinguir dor mecânica de radiculopatia, e sobretudo reconhecer mielopatia e cauda equina (vias emergentes).',
    manobras: [
      { nome:'Lasègue (SLR)', como:'Elevação passiva do membro inferior estendido.', positivo:'Dor irradiada abaixo do joelho entre 30–70° → radicular L5/S1; Lasègue cruzado é mais específico.' },
      { nome:'Sinais do 1.º neurónio', como:'Reflexos, Hoffmann, Babinski, clónus; motricidade fina das mãos e marcha.', positivo:'Presentes → mielopatia (cervical) — via muito prioritária/urgente.' },
      { nome:'Claudicação neurogénica vs vascular', como:'Perguntar o que alivia.', positivo:'Alivia sentado/em flexão ("carrinho de compras") → canal estreito; alivia parado em pé, pulsos diminuídos → vascular.' },
      { nome:'Cauda equina', como:'Perguntar sempre: retenção/incontinência, anestesia em sela, défice bilateral.', positivo:'Qualquer um → SU de imediato.' },
    ],
  },
  infantil: {
    intro: 'As manobras certas por idade evitam tanto o sobre- como o sub-diagnóstico; a maioria dos desvios dos membros é fisiológica e segue a curva abaixo.',
    svg: SVG_BARLOW + SVG_GALEAZZI_ADAMS + SVG_VARO_VALGO,
    manobras: [
      { nome:'Barlow / Ortolani (< 3 meses)', como:'Ancas e joelhos fletidos a 90°. Barlow: aduzir + pressão posterior. Ortolani: abduzir + elevar o trocânter.', positivo:'Ressalto de saída (Barlow) ou de entrada — "clunk" (Ortolani) → displasia.' },
      { nome:'Galeazzi (> 3 meses)', como:'Decúbito dorsal, pés apoiados, ancas/joelhos fletidos.', positivo:'Joelhos a alturas diferentes → displasia/dismetria.' },
      { nome:'Adams', como:'Flexão anterior do tronco, observada por trás.', positivo:'Giba unilateral → rotação vertebral (escoliose estrutural).' },
      { nome:'Drehmann', como:'Flexão passiva da anca.', positivo:'Rotação externa obrigatória → epifisiólise (adolescente; descarga + MP15).' },
      { nome:'Teste em pontas + Jack', como:'Pé em pontas; extensão passiva do hálux.', positivo:'Arco reconstitui → pé plano FLEXÍVEL (fisiológico); não reconstitui → rígido (referenciar).' },
      { nome:'Perfil rotacional', como:'Ângulo de progressão da marcha, rotações da anca, eixo coxa-pé.', positivo:'In-toing por metatarso aduto (bebé), torção tibial (2–4 a) ou anteversão femoral (4–8 a) — quase sempre resolve.' },
    ],
  },
};

/* ---------- render ---------- */

function renderNotas(n) {
  let h = '<p class="orto-notas-intro">' + n.intro + '</p>';
  if (n.svg) h += '<div class="orto-notas-svg">' + n.svg + '</div>';
  h += '<div class="orto-notas-grid">' + n.manobras.map(m =>
    '<div class="orto-manobra"><div class="orto-manobra-nome">' + m.nome + '</div>' +
    '<div class="orto-manobra-como">' + m.como + '</div>' +
    '<div class="orto-manobra-pos"><b>Positivo:</b> ' + m.positivo + '</div></div>').join('') + '</div>';
  h += '<p class="orto-notas-disc">Apoio ao exame físico — conteúdo auxiliar de boa prática, fora do documento do protocolo.</p>';
  return h;
}

// injeta um <details> colapsado no fim dos inputs do passo de patologia de cada região
// (no progressivo: dentro do corpo do passo, antes das ações; senão: no fim do campo)
function montarNotasClinicas() {
  Object.keys(NOTAS).forEach(function (rid) {
    var step = document.querySelector('.u-pstep[data-fid="pat_' + rid + '"]');
    var alvo = step ? step.querySelector('.u-pstep-body')
                    : document.querySelector('.u-stack-field[data-fid="pat_' + rid + '"]');
    if (!alvo || alvo.querySelector('.orto-notas')) return;
    var det = document.createElement('details');
    det.className = 'u-details orto-notas';
    det.innerHTML = '<summary>Notas clínicas — como distinguir</summary>' +
      '<div class="u-details-body">' + renderNotas(NOTAS[rid]) + '</div>';
    var acoes = alvo.querySelector('.u-pstep-actions');
    alvo.insertBefore(det, acoes || null);
  });
}

root.ORTO_NOTAS = { dados: NOTAS, montar: montarNotasClinicas };
if (typeof module !== 'undefined' && module.exports) module.exports = root.ORTO_NOTAS;
})(typeof window !== 'undefined' ? window : globalThis);
