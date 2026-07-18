/* Referenciação Ortopedia ULSM — conteúdo clínico.
   Transcrição verbatim de docs/ortopedia-regras.md (Documento de Trabalho - Ortopedia,
   regras negociadas entre o serviço de Ortopedia e os CSP da ULSM). Não parafrasear. */
(function (root) {
'use strict';

const ORTO = {
  // ordem = layout em linhas anatómicas (ver grelha CSS do campo região no HTML):
  // MS (ombro·cotovelo·punho/mão) / MI (anca·joelho·pé/tornozelo) / coluna / infantil
  // "Doente com prótese" e "Neoformação" NÃO são regiões: são patologias transversais,
  // sempre as 2 últimas opções dentro de cada região.
  regioes: [
    { id:'ombro', label:'Ombro' }, { id:'cotovelo', label:'Cotovelo' }, { id:'punho_mao', label:'Punho e Mão' },
    { id:'anca', label:'Anca' }, { id:'joelho', label:'Joelho' }, { id:'pe_tornozelo', label:'Pé e Tornozelo' },
    { id:'coluna', label:'Coluna' },
    { id:'infantil', label:'Ortopedia Infantil' },
  ],

  comorbilidades: {
    groups:[ {id:'cardio',label:'Cardiometabólico'},{id:'resp',label:'Respiratório'},
             {id:'osteo',label:'Osteoarticular'},{id:'outros',label:'Outros'} ],
    options:[
      {value:'none',label:'Nenhuma',none:true},
      {value:'hta',label:'Hipertensão',group:'cardio'},{value:'dm',label:'Diabetes',group:'cardio'},
      {value:'dislip',label:'Dislipidemia',group:'cardio'},{value:'obes',label:'Obesidade',group:'cardio'},
      {value:'icc',label:'Insuf. cardíaca',group:'cardio'},{value:'fa',label:'FA',group:'cardio'},
      {value:'dpoc',label:'DPOC',group:'resp'},{value:'asma',label:'Asma',group:'resp'},{value:'saos',label:'SAOS',group:'resp'},
      {value:'op',label:'Osteoporose',group:'osteo'},{value:'ar',label:'Artrite reumatoide',group:'osteo'},{value:'gota',label:'Gota',group:'osteo'},
      {value:'drc',label:'DRC',group:'outros'},{value:'hepat',label:'Doença hepática',group:'outros'},
      {value:'neo',label:'Neoplasia ativa/prévia',group:'outros'},{value:'acoag',label:'Anticoagulado',group:'outros'},
      {value:'imunossup',label:'Imunossupressão',group:'outros'},{value:'tabaco',label:'Tabagismo',group:'outros'},
    ],
  },

  imcRelevant: ['gonalgia','torcao_joelho','epifisiolise'],

  patologias: [

  /* ============ OMBRO ============ */
  { id:'coifa', regiao:'ombro', nome:'Rutura da coifa', lado:true,
    cardDesc:'Meia-idade com omalgia crónica (ou aguda se trauma) referida ao deltoide; padrão inflamatório (noite ++).',
    doenteTipo:[
      {value:'omalgia_deltoide',label:'Omalgia referida ao deltoide',desc:'Dor na face lateral do braço, raramente irradiando abaixo do cotovelo.'},
      {value:'inflamatorio',label:'Padrão inflamatório (noite ++)',desc:'Agrava à noite e em repouso; interfere com o sono.'},
      {value:'mob_completa',label:'Mobilidade passiva e ativa completas',desc:'Amplitudes passivas mantidas distinguem de capsulite e de omartrose.'} ],
    prioridade:[
      {value:'rutura_traum',label:'Suspeita de rutura traumática aguda da coifa',nivel:'su',desc:'Trauma recente com perda funcional aguda (ex.: incapacidade de elevação ativa/pseudoparalisia).'},
      {value:'jovem_desp',label:'Jovem desportista após tratamento conservador',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:6,
    mcdt:[ {value:'rx_ombro',label:'Raio-X face e perfil do ombro (normal ou artropatia da coifa)'},
           {value:'eco_ombro',label:'Ecografia articular (rutura tendinosa SE/IE/SSC)'} ],
    tratamento:[ {value:'aines',label:'Controlo da dor (AINEs)'},{value:'fisio',label:'Fisioterapia'} ],
    idade:null,
    notas:['Ruturas isoladas da LPB têm tratamento essencialmente conservador.'] },

  { id:'tend_calc', regiao:'ombro', nome:'Tendinite calcificante', lado:true,
    cardDesc:'Adulto jovem com omalgia referida ao deltoide; padrão inflamatório (noite ++).',
    doenteTipo:[
      {value:'omalgia_deltoide',label:'Omalgia referida ao deltoide',desc:'Dor na face lateral do braço, raramente irradiando abaixo do cotovelo.'},
      {value:'inflamatorio',label:'Padrão inflamatório (noite ++)',desc:'Agrava à noite e em repouso; interfere com o sono.'},
      {value:'mob_completa',label:'Mobilidade passiva e ativa completas',desc:'Amplitudes passivas mantidas distinguem de capsulite e de omartrose.'} ],
    prioridade:[
      {value:'hiperalgica',label:'Fase hiperálgica de reabsorção com até uma semana de evolução (para infiltração subacromial)',nivel:'su',desc:'Dor súbita e incapacitante — corresponde à fase de reabsorção do depósito cálcico.'} ],
    normalGate:'mfr', minConservadorMeses:0,
    mcdt:[ {value:'rx_ombro',label:'Raio-X face e perfil do ombro (calcificações)'},
           {value:'eco_ombro',label:'Ecografia articular (calcificações +/- tendinose)'} ],
    tratamento:[ {value:'aines',label:'Controlo da dor (AINEs)'},{value:'fisio',label:'Fisioterapia'} ],
    idade:null,
    notas:['Microcalcificações não correspondem verdadeiramente a tendinite calcificante e têm tratamento conservador.'] },

  { id:'omartrose', regiao:'ombro', nome:'Omartrose', lado:true,
    cardDesc:'Idoso com omalgia crónica; padrão mecânico (aumenta com a atividade); crepitação; rigidez.',
    doenteTipo:[
      {value:'omalgia_cronica',label:'Omalgia crónica'},
      {value:'mecanico',label:'Padrão mecânico (aumenta com a atividade)',desc:'Agrava com o uso e alivia com o repouso.'},
      {value:'crepitacao',label:'Crepitação'},
      {value:'rigidez',label:'Mobilidade passiva e ativa limitadas (rigidez)'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_ombro',label:'Raio-X face e perfil do ombro (características de artrose)'},
           {value:'tc_ombro',label:'TC (para planeamento cirúrgico)'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'} ],
    idade:{min:40,max:120}, notas:[] },

  { id:'capsulite', regiao:'ombro', nome:'Capsulite adesiva', lado:true,
    cardDesc:'Meia-idade com omalgia de padrão inflamatório nos primeiros meses, seguida de rigidez; recuperação espontânea até aos 24 meses.',
    doenteTipo:[
      {value:'omalgia_infl',label:'Omalgia de padrão inflamatório nos primeiros meses'},
      {value:'rigidez',label:'Rigidez (limitação passiva e ativa)'} ],
    prioridade:[],
    normalGate:'mfr', minConservadorMeses:0,
    mcdt:[ {value:'rx_ombro',label:'Raio-X face e perfil do ombro (relatado como normal)'},
           {value:'eco_ombro',label:'Ecografia articular (espessamento capsular e do ligamento coracoumeral; eventual derrame articular)'} ],
    tratamento:[ {value:'aines_dipro',label:'Controlo da dor (AINEs, Diprofos IM)'},{value:'fisio',label:'Fisioterapia'} ],
    idade:null,
    notas:['Recuperação espontânea até aos 24 meses.'] },

  { id:'instabilidade_ombro', regiao:'ombro', nome:'Instabilidade', lado:true,
    cardDesc:'Jovem desportista; episódios de luxação ou sensação de instabilidade durante exercício; mobilidade habitualmente normal.',
    doenteTipo:[
      {value:'luxacoes',label:'Episódios de luxação ou sensação de instabilidade durante exercício',desc:'Apreensão com o braço em abdução/rotação externa é típica.'},
      {value:'mob_normal',label:'Mobilidade passiva e ativa habitualmente normais'} ],
    prioridade:[
      {value:'lux_aguda',label:'Luxação aguda pós-traumática',nivel:'su',desc:'Reduzir com urgência; exige Raio-X pré e pós-redução.'},
      {value:'jovem_desp',label:'Jovem desportista após tratamento conservador',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_ombro',label:'Raio-X face e perfil do ombro (podem estar presentes lesões Hill-Sachs e Bankart ósseo)'} ],
    tratamento:[ {value:'fisio',label:'Fisioterapia'} ],
    idade:null, notas:[] },

  /* ============ COTOVELO ============ */
  { id:'epicondilite', regiao:'cotovelo', nome:'Epicondilite', lado:true,
    cardDesc:'Dor não traumática e sinais inflamatórios no epicôndilo medial (agrava com flexão do punho) ou lateral (agrava com extensão do punho).',
    doenteTipo:[
      {value:'epic_medial',label:'Dor/sinais inflamatórios no epicôndilo medial (agrava com flexão do punho)'},
      {value:'epic_lateral',label:'Dor/sinais inflamatórios no epicôndilo lateral (agrava com extensão do punho)'},
      {value:'mob_preservada',label:'Mobilidade ativa e passiva preservadas'} ],
    prioridade:[
      {value:'jovem_desp',label:'Jovem desportista após tratamento conservador',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:6,
    mcdt:[ {value:'rx_cotovelo',label:'Raio-X face e perfil do cotovelo (relatado como normal; eventualmente calcificações)'},
           {value:'eco_cotovelo',label:'Ecografia articular (espessamento ECRB; eventualmente calcificações)'} ],
    tratamento:[ {value:'aines',label:'Controlo da dor (AINEs)'},
                 {value:'banda',label:'Banda para epicondilite'},{value:'fisio',label:'Fisioterapia'} ],
    idade:null, notas:[] },

  { id:'artrose_cotovelo', regiao:'cotovelo', nome:'Artrose do cotovelo', lado:true,
    cardDesc:'Dor não traumática mecânica (aumenta com atividade, com períodos de agudização); rigidez; por vezes crepitações.',
    doenteTipo:[
      {value:'dor_mecanica',label:'Dor não traumática mecânica (aumenta com atividade, com períodos de agudização)'},
      {value:'rigidez',label:'Mobilidade ativa e passiva limitadas (rigidez)'},
      {value:'crepitacao',label:'Crepitações com movimentos'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_cotovelo',label:'Raio-X face e perfil do cotovelo (características de artrose)'},
           {value:'tac_cotovelo',label:'TAC do cotovelo (para planeamento cirúrgico)'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'} ],
    idade:null, notas:[] },

  /* ============ PUNHO E MÃO ============ */
  { id:'dupuytren', regiao:'punho_mao', nome:'Doença de Dupuytren', lado:true,
    cardDesc:'Cordão na face palmar da mão, com contratura de 1 ou mais dedos, de evolução progressiva.',
    doenteTipo:[
      {value:'cordao',label:'Cordão na face palmar da mão, com contratura de 1 ou mais dedos, de evolução progressiva'},
      {value:'hueston',label:'Teste de Hueston positivo (não consegue apoiar a palma da mão na mesa)'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:0,
    exigeCrit:[{value:'hueston',label:'Teste de Hueston positivo'}],
    mcdt:[ {value:'clinico',label:'O diagnóstico é clínico'} ],
    tratamento:[ {value:'vigilancia',label:'Vigilância da evolução até indicação cirúrgica (teste de Hueston positivo)'} ],
    idade:null, notas:[] },

  { id:'rizartrose', regiao:'punho_mao', nome:'Rizartrose', lado:true,
    cardDesc:'Dor mecânica na base do polegar; Grind e Shear test positivos; deformidade, por vezes polegar em Z; perda de força de preensão e pinça.',
    doenteTipo:[
      {value:'dor_base_polegar',label:'Dor de carácter mecânico na base do polegar'},
      {value:'grind_shear',label:'Grind e Shear test positivos',desc:'Dor à compressão axial e rotação da base do polegar (trapézio-metacárpica).'},
      {value:'deform_z',label:'Deformidade na base do polegar, por vezes polegar em Z'},
      {value:'perda_forca',label:'Perda de força de preensão e pinça'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_polegar',label:'Raio-X do polegar (face + perfil + Robert’s) — características de artrose'} ],
    tratamento:[ {value:'aines',label:'Controlo da dor (AINEs)'},
                 {value:'tala',label:'Tala imobilizadora do polegar (Push Metagrip, Actimove Rhizo forte) — 24h no 1.º mês; só à noite no 2.º mês'},
                 {value:'fisio',label:'Fisioterapia'} ],
    idade:null, notas:[] },

  { id:'dequervain', regiao:'punho_mao', nome:'Tenossinovite De Quervain', lado:true,
    cardDesc:'Dor na face dorso-radial do punho, possível tumefação; dor aumenta com desvio cubital (Finkelstein positivo).',
    doenteTipo:[
      {value:'dor_dorsoradial',label:'Dor na face dorso-radial do punho, possível tumefação dorso-radial'},
      {value:'finkelstein',label:'Dor aumenta com desvio cubital (Teste de Finkelstein positivo)',desc:'Polegar fechado na palma + desvio cubital do punho reproduz a dor.'} ],
    prioridade:[
      {value:'jovem_desp',label:'Jovem desportista após tratamento conservador',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:6,
    mcdt:[ {value:'rx_punho',label:'Raio-X face e perfil do punho (relatado como normal)'},
           {value:'eco_punho',label:'Ecografia (sinovite do 1.º compartimento extensor)'} ],
    tratamento:[ {value:'aines',label:'Controlo da dor (AINEs)'},
                 {value:'tala',label:'Tala imobilizadora do polegar (Push Metagrip, Actimove Rhizo forte) — 24h no 1.º mês; só à noite no 2.º mês'},
                 {value:'fisio',label:'Fisioterapia'} ],
    idade:null,
    notas:['Em mulheres que estiveram grávidas, o tratamento conservador poderá ser prolongado até 9 meses após o parto/cessação da gravidez.'] },

  { id:'canal_carpico', regiao:'punho_mao', nome:'Síndrome do canal cárpico / Neuropatias', lado:true,
    cardDesc:'Parestesias e dor no território do mediano, noturnas e matinais; perda de força progressiva; Phalen, Durkan e Tinel positivos.',
    doenteTipo:[
      {value:'parestesias',label:'Parestesias e dor na mão em território do nervo mediano, sobretudo noturnas (acordam o doente) e matinais',desc:'Poupam tipicamente o 5.º dedo.'},
      {value:'perda_forca',label:'Perda de força progressiva'},
      {value:'phalen',label:'Phalen, Durkan e Tinel positivos',desc:'Phalen: flexão máxima dos punhos 60 s; Durkan: compressão do canal 30 s; Tinel: percussão sobre o mediano.'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'emg',label:'EMG'} ],
    tratamento:[ {value:'aines_cct',label:'Controlo da dor (AINEs e/ou CCT)'} ],
    idade:null,
    notas:['Em mulheres que estiveram grávidas, o tratamento conservador poderá ser prolongado até 9 meses após o parto/cessação da gravidez.'] },

  /* ============ ANCA ============ */
  { id:'coxartrose', regiao:'anca', nome:'Coxartrose', lado:true,
    cardDesc:'Coxalgia (dor inguinal ++, por vezes irradiada ao joelho), mecânica ou mista, com redução das distâncias de marcha; rigidez.',
    doenteTipo:[
      {value:'coxalgia',label:'Coxalgia (dor inguinal ++, por vezes irradiada ao joelho), mecânica ou mista'},
      {value:'marcha',label:'Redução das distâncias de marcha'},
      {value:'rigidez',label:'Limitação da mobilidade passiva e ativa (rigidez)'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_bacia',label:'Raio-X face da bacia em carga e perfil da anca (características de artrose)'},
           {value:'rx_lombar',label:'Raio-X face e perfil da coluna lombar'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'} ],
    idade:{min:40,max:120}, notas:[] },

  { id:'coxalgia_jovem', regiao:'anca', nome:'Coxalgia no adulto jovem', lado:true,
    cardDesc:'Coxalgia mecânica inguinal durante atividade desportiva (FABER/FADIR+); ressalto, crepitação ou bloqueio.',
    doenteTipo:[
      {value:'coxalgia_desp',label:'Coxalgia mecânica inguinal mal definida, agrava na posição sentada por algum tempo; pode agravar durante atividade desportiva, principalmente com rotação e/ou flexão da anca (FABER ou FADIR positivos)',desc:'FABER: flexão-abdução-rotação externa; FADIR: flexão-adução-rotação interna — dor inguinal sugere conflito femoroacetabular/lesão do labrum.'},
      {value:'dor_glutea',label:'Dor glútea ou trocantérica por alteração do padrão de marcha'},
      {value:'mob_normal',label:'Mobilidade passiva e ativa habitualmente normais'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_bacia_dunn',label:'Raio-X face da bacia e perfil da anca + Dunn view (deformidade tipo CAM ou PINCER; displasia acetabular)'} ],
    tratamento:[ {value:'aines',label:'Controlo da dor (AINEs)'},{value:'fisio',label:'Fisioterapia'} ],
    idade:null, notas:[] },

  { id:'coxalgia_subita', regiao:'anca', nome:'Coxalgia súbita — lesão musculotendinosa (reto femoral ou isquiotibiais)', lado:true,
    doenteTipo:[
      {value:'hematoma',label:'Hematoma/equimose de grandes dimensões na face anterior ou posterior da coxa'},
      {value:'impotencia',label:'Dor com deambulação, incapacidade para a prática desportiva, impotência funcional associada'} ],
    prioridade:[
      {value:'dor_subita',label:'Dor súbita associada a trauma ou esforço súbito, no dia-a-dia ou na prática desportiva, com dor inguinal ou na face posterior da coxa imediata',nivel:'su'} ],
    normalGate:'agudo', minConservadorMeses:0,
    mcdt:[ {value:'eco_coxa',label:'Ecografia'} ],
    tratamento:[ {value:'aines',label:'Controlo da dor (AINEs)'},
                 {value:'gelo',label:'Gelo'},
                 {value:'canadianas',label:'Canadianas'} ],
    idade:null,
    notas:['Sem duração mínima de tratamento conservador: perante o quadro agudo, a orientação é o Serviço de Urgência.'] },

  { id:'dor_lateral_coxa', regiao:'anca', nome:'Dor na face lateral da coxa / anca', lado:true,
    doenteTipo:[
      {value:'trocanterica',label:'Coxalgia lateral, trocantérica, sem dor inguinal'},
      {value:'noite',label:'Agrava de noite, deitado sobre o lado afetado'},
      {value:'sentado_escadas',label:'Agrava após longos períodos sentado e ao subir escadas'},
      {value:'glutea',label:'Pode apresentar dor glútea irradiada'},
      {value:'mob_normal',label:'Mobilidade passiva e ativa habitualmente normais'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_bacia',label:'Raio-X face da bacia e perfil da anca'},
           {value:'eco_dirigida',label:'Ecografia dirigida'} ],
    tratamento:[ {value:'aines',label:'Controlo da dor (AINEs)'},
                 {value:'crioterapia',label:'Crioterapia'},
                 {value:'controlo_ponderal',label:'Controlo ponderal'},
                 {value:'fisio',label:'Fisioterapia'} ],
    idade:null,
    notas:['Duração do tratamento conservador no documento: 3 a 6 meses.'] },

  /* ============ JOELHO ============ */
  { id:'gonalgia', regiao:'joelho', nome:'Gonalgia', lado:true,
    cardDesc:'Dor mecânica ou mista referida ao joelho, edema induzido pela atividade; limitação funcional; bloqueio/instabilidade.',
    doenteTipo:[
      {value:'dor_mecanica',label:'Dor de carácter mecânico ou misto referida ao joelho, edema induzido pela atividade'},
      {value:'limitacao',label:'Limitação funcional com redução das distâncias de marcha'},
      {value:'bloqueio',label:'Sensação de bloqueio, instabilidade ou corpo estranho',desc:'Bloqueio verdadeiro (extensão impedida) sugere lesão meniscal ou corpo livre.'},
      {value:'mob_limitada',label:'Limitação das mobilidades passiva e ativa'},
      {value:'deform_axial',label:'Deformidade axial do membro inferior'} ],
    prioridade:[
      {value:'jovem_desp',label:'Jovem desportista após tratamento conservador',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_joelhos',label:'Raio-X dos joelhos — AP em carga + Schuss + perfil + axial das rótulas'},
           {value:'rx_extralongo',label:'Raio-X extra-longo dos membros inferiores em carga'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'},
                 {value:'perda_ponderal',label:'Perda ponderal se IMC > 25',visivel:s=>s.imc==null||s.imc>25} ],
    idade:null,
    notas:['Tendinite da pata de ganso, síndrome de dor anterior do joelho e quisto de Baker têm tratamento essencialmente conservador, com aporte residual pela especialidade de Ortopedia.'] },

  { id:'torcao_joelho', regiao:'joelho', nome:'Torção do joelho', lado:true,
    cardDesc:'Dor aguda referida ao joelho desencadeada por mecanismo de torção; bloqueio, instabilidade ou corpo estranho.',
    doenteTipo:[
      {value:'dor_torcao',label:'Dor aguda referida ao joelho desencadeada por mecanismo de torção'},
      {value:'bloqueio',label:'Sensação de bloqueio, instabilidade ou corpo estranho'},
      {value:'mob_limitada',label:'Limitação das mobilidades passiva e ativa'},
      {value:'deform_axial',label:'Deformidade axial do membro inferior'} ],
    prioridade:[
      {value:'derrame_bloqueio',label:'Torção aguda com derrame articular imediato ou bloqueio do joelho',nivel:'su',desc:'Derrame nas primeiras 2 horas sugere hemartrose — lesão do LCA, luxação da rótula ou fratura osteocondral.'},
      {value:'lesao_aguda_jovem',label:'Lesão aguda pós-traumática em doente jovem/desportista',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_joelhos',label:'Raio-X dos joelhos — AP em carga + Schuss + perfil + axial das rótulas'},
           {value:'rx_extralongo',label:'Raio-X extra-longo dos membros inferiores em carga'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'},
                 {value:'perda_ponderal',label:'Perda ponderal se IMC > 25',visivel:s=>s.imc==null||s.imc>25} ],
    idade:null, notas:[] },

  /* ============ PÉ E TORNOZELO ============ */
  { id:'hallux_valgus', regiao:'pe_tornozelo', nome:'Hallux valgus', lado:true,
    cardDesc:'Dor não aguda referida ao bunion; sinais inflamatórios recorrentes; má adaptação ao calçado.',
    doenteTipo:[
      {value:'dor_bunion',label:'Dor não aguda referida ao bunion (proeminência do 1.º metatarsiano)'},
      {value:'sinais_infl',label:'Sinais inflamatórios recorrentes no bunion'},
      {value:'calcado',label:'Má adaptação ao calçado com repercussão na marcha'},
      {value:'dedos_menores',label:'Queixas associadas a deformidade dos dedos menores ou metatarsalgias de transferência/calosidade central dolorosa'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_pes',label:'Raio-X dos pés em carga (face e perfil)'} ],
    tratamento:[ {value:'calcado',label:'Alteração do calçado'},
                 {value:'separador',label:'Separador interdigital para hallux valgus'} ],
    idade:null, notas:[] },

  { id:'hallux_rigidus', regiao:'pe_tornozelo', nome:'Hallux rigidus', lado:true,
    cardDesc:'Dor não aguda na 1.ª MTF; sinais inflamatórios dorsais; exostose dorsal dolorosa; limitação da dorsiflexão do hálux.',
    doenteTipo:[
      {value:'dor_mtf',label:'Dor não aguda referida à 1.ª articulação metatarso-falângica'},
      {value:'sinais_infl',label:'Sinais inflamatórios recorrentes dorsais na 1.ª MTF'},
      {value:'calcado',label:'Má adaptação ao calçado com repercussão na marcha'},
      {value:'exostose',label:'Exostose dorsal dolorosa na cabeça do 1.º metatarsiano'},
      {value:'dorsiflexao',label:'Limitação da dorsiflexão do hálux'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_pes',label:'Raio-X dos pés em carga (face e perfil) — artrose da 1.ª MTF'} ],
    tratamento:[ {value:'calcado_rocker',label:'Alteração do calçado (solas tipo Rockerbottom)'},
                 {value:'palmilha_rigida',label:'Palmilha adaptada rígida no antepé'},{value:'fisio',label:'Fisioterapia'} ],
    idade:null, notas:[] },

  { id:'dedos_menores', regiao:'pe_tornozelo', nome:'Deformidade dos dedos menores', lado:true,
    cardDesc:'"Joanete de Sastre"; dedos menores em garra ou martelo; dor e sinais inflamatórios recorrentes.',
    doenteTipo:[
      {value:'sastre',label:'"Joanete de Sastre" (proeminência do 5.º metatarsiano)'},
      {value:'garra',label:'Deformidade dos dedos menores em garra ou martelo'},
      {value:'sinais_infl',label:'Dor e sinais inflamatórios recorrentes'},
      {value:'calcado',label:'Má adaptação ao calçado com repercussão na marcha'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_pes',label:'Raio-X dos pés em carga (face e perfil)'} ],
    tratamento:[ {value:'calcado',label:'Alteração do calçado'},{value:'separador',label:'Separador interdigital'} ],
    idade:null, notas:[] },

  { id:'metatarsalgia', regiao:'pe_tornozelo', nome:'Metatarsalgia', lado:true,
    cardDesc:'Metatarsalgias com calosidade plantar central ou dorsal dos dedos dolorosa; dor irradiada para os dedos.',
    doenteTipo:[
      {value:'calosidade',label:'Metatarsalgias com calosidade plantar central ou dorsal dos dedos dolorosa'},
      {value:'dor_irradiada',label:'Dor irradiada para os dedos'},
      {value:'hv_assoc',label:'Hallux valgus ou deformidade dos dedos menores associada'},
      {value:'calcado',label:'Má adaptação ao calçado com repercussão na marcha'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_pes',label:'Raio-X dos pés em carga (face e perfil)'},
           {value:'eco_antepe',label:'Ecografia do antepé (neuroma de Morton)'} ],
    tratamento:[ {value:'calcado',label:'Alteração do calçado'},{value:'palmilha',label:'Palmilha adequada'} ],
    idade:null, notas:[] },

  { id:'fasceite', regiao:'pe_tornozelo', nome:'Fasceíte plantar', lado:true,
    cardDesc:'Dor plantar na inserção da fáscia, matinal, com melhoria ao longo do dia; agravada por esforço ou ortostatismo prolongado.',
    doenteTipo:[
      {value:'dor_plantar',label:'Dor plantar na inserção da fáscia plantar, não aguda'},
      {value:'dor_matinal',label:'Dor matinal com melhoria ao longo do dia, agravada por esforço ou ortostatismo prolongado'} ],
    prioridade:[
      {value:'jovem_desp',label:'Jovem desportista após tratamento conservador',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:6,
    mcdt:[ {value:'rx_pes',label:'Raio-X dos pés em carga (face e perfil) — pode existir esporão calcâneo'},
           {value:'eco_retrope',label:'Ecografia do retropé (espessamento do tendão)'} ],
    tratamento:[ {value:'calcado',label:'Alteração do calçado'},{value:'talonete',label:'Talonete calcâneo de gelo'},
                 {value:'alongamento',label:'Exercícios de alongamento (anexo 1 do documento)'},
                 {value:'fisio',label:'Fisioterapia'},{value:'aines',label:'Controlo da dor (AINEs)'} ],
    idade:null, notas:[] },

  { id:'aquiles', regiao:'pe_tornozelo', nome:'Tendinite de Aquiles', lado:true,
    cardDesc:'Dor após esforço ou durante atividade; tumefação palpável do tendão; dor insercional ou médio-tendinosa.',
    doenteTipo:[
      {value:'dor_esforco',label:'Dor após esforço ou progressivamente durante atividade'},
      {value:'tumefacao',label:'Tumefação palpável do tendão ou região insercional'},
      {value:'dor_insercao',label:'Dor na inserção ou região médio-tendinosa do tendão de Aquiles'} ],
    prioridade:[
      {value:'jovem_desp',label:'Jovem desportista após tratamento conservador',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:6,
    mcdt:[ {value:'rx_tornozelo',label:'Raio-X do tornozelo em carga (face e perfil) — pode existir deformidade de Haglund'},
           {value:'eco_tendao',label:'Ecografia do tendão (espessamento)'} ],
    tratamento:[ {value:'calcado',label:'Alteração do calçado'},{value:'talonete',label:'Talonete calcâneo de gel'},
                 {value:'fisio',label:'Fisioterapia'},{value:'aines',label:'Controlo da dor (AINEs)'} ],
    idade:null, notas:[] },

  { id:'entorse_tornozelo', regiao:'pe_tornozelo', nome:'Sequelas de entorse / instabilidade', lado:true,
    cardDesc:'Entorses de repetição; dor persistente mais de 6 meses após entorse; instabilidade recorrente.',
    doenteTipo:[
      {value:'entorses_rep',label:'Entorses de repetição'},
      {value:'dor_6m',label:'Dor persistente mais de 6 meses após entorse'},
      {value:'instabilidade',label:'Sensação de instabilidade recorrente',desc:'Falseios de repetição, sobretudo em piso irregular.'} ],
    prioridade:[
      {value:'jovem_desp',label:'Jovem desportista após tratamento conservador',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_tornozelo',label:'Raio-X do tornozelo em carga (face e perfil)'},
           {value:'eco_tornozelo',label:'Ecografia do tornozelo (lesões do complexo ligamentar lateral ou medial)'},
           {value:'tac_tornozelo',label:'TAC se ecografia normal ou suspeita de lesão osteocondral'} ],
    tratamento:[ {value:'imob_elastica',label:'Imobilização elástica durante atividade desportiva'},
                 {value:'fisio',label:'Fisioterapia'},{value:'aines',label:'Controlo da dor (AINEs)'} ],
    idade:null, notas:[] },

  { id:'artrose_tornozelo', regiao:'pe_tornozelo', nome:'Artrose do tornozelo', lado:true,
    cardDesc:'Dor crónica do tornozelo ou retropé; limitação do arco de mobilidade; limitação da marcha.',
    doenteTipo:[
      {value:'dor_cronica',label:'Dor crónica do tornozelo ou retropé'},
      {value:'arco_limitado',label:'Limitação do arco de mobilidade'},
      {value:'marcha',label:'Limitação da marcha e distância percorrida'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_tornozelo_pe',label:'Raio-X do tornozelo e pé em carga (face e perfil)'},
           {value:'tac_tornozelo',label:'TAC do tornozelo (para planeamento cirúrgico)'} ],
    tratamento:[ {value:'calcado_rocker',label:'Calçado com sola tipo Rockerbottom e adaptação da atividade'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'},
                 {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'} ],
    idade:null, notas:[] },

  { id:'pe_plano_adq', regiao:'pe_tornozelo', nome:'Pé plano adquirido', lado:true,
    cardDesc:'Dor mecânica no tornozelo e arcada medial; perda progressiva da arcada; limitação da carga em pontas.',
    doenteTipo:[
      {value:'dor_medial',label:'Dor não aguda, mecânica, no tornozelo e arcada medial do pé'},
      {value:'perda_arcada',label:'Perda progressiva da arcada medial do pé'},
      {value:'pontas',label:'Limitação da capacidade de sustentar carga em pontas'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:6,
    mcdt:[ {value:'rx_tornozelo_pe',label:'Raio-X do tornozelo e pé em carga (face e perfil)'},
           {value:'eco_tornozelo',label:'Ecografia do tornozelo (tendão tibial posterior e ligamento de Spring)'},
           {value:'tac',label:'TAC'} ],
    tratamento:[ {value:'palmilha_arco',label:'Palmilha com apoio do arco medial e/ou cunha interna e adaptação da atividade'},
                 {value:'fisio',label:'Fisioterapia'},{value:'aines',label:'Controlo da dor (AINEs)'} ],
    idade:null, notas:[] },

  /* ============ COLUNA ============ */
  { id:'cervical', regiao:'coluna', nome:'Dor cervical', lado:false,
    cardDesc:'Cervicalgia (occipital/trapézio) com/sem irradiação e/ou parestesias (dermátomo).',
    doenteTipo:[
      {value:'cervicalgia',label:'Cervicalgia (dor occipital/trapézio) com/sem irradiação unilateral/bilateral e/ou parestesias (dermátomo)'},
      {value:'defice_forca',label:'Défice de força / perda de motricidade fina dos MS'},
      {value:'primeiro_neuronio',label:'Sinais do 1.º neurónio',desc:'Hiperreflexia, clónus, Babinski/Hoffmann; na cervical, perda de destreza fina das mãos.'},
      {value:'alt_marcha',label:'Alterações do padrão da marcha'} ],
    prioridade:[
      {value:'defice_neuro',label:'Défice neurológico motor focal, súbito, associado a dor axial e/ou radicular dos MS',nivel:'su',desc:'Perda objetiva de força de instalação súbita — enviar de imediato ao SU.'},
      {value:'fratura_rx',label:'Fratura diagnosticada em RX/TAC',nivel:'su'},
      {value:'progressiva',label:'Instalação progressiva de défices neurológicos sensitivo/motores dos membros, associada a dor axial e/ou radicular, no último mês',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_cervical',label:'Raio-X coluna cervical (face, perfil, estudo dinâmico — hiperflexão/hiperextensão) — alterações degenerativas; instabilidade no plano sagital'},
           {value:'tac_cervical',label:'TAC cervical (alterações degenerativas; hérnias discais)'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'colar',label:'Repouso e colar cervical (fase aguda, não superior a 72 horas)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'} ],
    idade:null, notas:[] },

  { id:'lombar', regiao:'coluna', nome:'Dor lombar/dorsolombar', lado:false,
    cardDesc:'Lombalgia com/sem irradiação e/ou parestesias (dermátomo); claudicação neurogénica.',
    doenteTipo:[
      {value:'lombalgia',label:'Lombalgia com/sem irradiação unilateral/bilateral e/ou parestesias (dermátomo)'},
      {value:'claudicacao',label:'Claudicação neurogénica',desc:'Dor/parestesias nas pernas ao andar, aliviadas ao sentar ou com flexão anterior (ao contrário da vascular).'},
      {value:'defice_forca',label:'Défice de força / sinais do 1.º neurónio'},
      {value:'alt_marcha',label:'Alterações do padrão da marcha'},
      {value:'genito_urinarias',label:'Alterações genito-urinárias'} ],
    prioridade:[
      {value:'defice_neuro',label:'Défice neurológico motor focal, súbito, associado a dor axial e/ou radicular dos MI',nivel:'su',desc:'Perda objetiva de força de instalação súbita — enviar de imediato ao SU.'},
      {value:'fratura_rx',label:'Fratura diagnosticada em RX/TAC',nivel:'su'},
      {value:'cauda_equina',label:'Suspeita de Síndrome da Cauda Equina',nivel:'su',desc:'Retenção/incontinência, anestesia em sela ou défice bilateral — SU de imediato.'},
      {value:'progressiva',label:'Instalação progressiva de défices neurológicos sensitivo/motores dos membros, associada a dor axial e/ou radicular, no último mês',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_lombar',label:'Raio-X coluna lombar (face, perfil, estudo dinâmico — hiperflexão/hiperextensão) — alterações degenerativas; instabilidade no plano sagital'},
           {value:'tac_lombar',label:'TAC lombar (alterações degenerativas; hérnias discais)'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'repouso',label:'Repouso (fase aguda, não superior a 72 horas)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'} ],
    idade:null, notas:[] },

  /* ============ DOENTE COM PRÓTESE (transversal: última opção em todas as regiões) ============ */
  { id:'dor_protese', transversal:true, nome:'Dor em doente com prótese', lado:true,
    cardDesc:'Documentar tempo de vida da prótese e complicações; caracterização da dor; trauma; sinais inflamatórios; mobilidades vs prévias.',
    doenteTipo:[
      {value:'trauma',label:'Existência de trauma'},
      {value:'sinais_infl',label:'Existência de sinais inflamatórios',desc:'Rubor, calor, tumefação ou fístula — considerar infeção periprotésica.'},
      {value:'perda_mob',label:'Mobilidade passiva/ativa diminuída face às mobilidades prévias'} ],
    detalhes:[
      {id:'tempo_protese',label:'Tempo de vida da prótese e complicações',placeholder:'ex.: PTA há 8 anos, sem intercorrências até agora'},
      {id:'caract_dor',label:'Caracterização da dor',placeholder:'ex.: dor inguinal mecânica, em carga, desde há 2 meses'} ],
    prioridade:[
      {value:'susp_lux',label:'Suspeita de luxação/fratura/infeção de prótese',nivel:'su',desc:'Dor aguda com impotência funcional, membro encurtado/mal posicionado, ou febre e sinais inflamatórios.'},
      {value:'lux_recorrente',label:'Luxação recorrente',nivel:'mp15',desc:'Dois ou mais episódios de luxação da mesma prótese.'},
      {value:'evol_prog',label:'Queixas de evolução progressiva (perda de mobilidade/capacidade da marcha)',nivel:'p60'} ],
    normalGate:'padrao', requerMotivacao:false, minConservadorMeses:3,
    mcdt:[ {value:'rx_protese',label:'Raio-X face e perfil da anca (linhas de radiolucência progressivas, subsidência de componentes, osteólise)'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},{value:'repouso',label:'Repouso'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'} ],
    idade:null,
    notas:['Seguimento: pelo Ortopedista até 1 ano pós-operatório; depois, seguimento radiológico e clínico anual pelo médico assistente nos CSP até aos 5 anos; posteriormente a cada 3 anos.'] },

  /* ============ NEOFORMAÇÃO (transversal: última opção em todas as regiões) ============ */
  { id:'neoformacao', transversal:true, nome:'Neoformação', lado:true,
    cardDesc:'Documentar aspeto morfológico, ritmo de crescimento e sintomatologia associada (dor, limitação da mobilidade).',
    doenteTipo:[
      {value:'dor',label:'Dor associada'},
      {value:'lim_mob',label:'Limitação da mobilidade'} ],
    detalhes:[
      {id:'morfologia',label:'Aspeto morfológico da lesão',placeholder:'ex.: nódulo duro e aderente, ~2 cm, face dorsal do punho'},
      {id:'crescimento',label:'Ritmo de crescimento',placeholder:'ex.: estável há 2 anos / crescimento rápido no último mês'} ],
    prioridade:[
      {value:'susp_malig',label:'Características suspeitas de malignidade',nivel:'mp15',desc:'Crescimento rápido, dimensão > 5 cm, localização profunda à fáscia, dor em repouso, recidiva local.'},
      {value:'rutura_iminente',label:'Risco de rutura iminente ou com solução de continuidade; doente aceita e está motivado para tratamento cirúrgico',nivel:'p60'} ],
    normalGate:'sempre', nivelSempre:'normal', minConservadorMeses:0,
    mcdt:[ {value:'rx_mao_punho',label:'Raio-X face e perfil da mão/punho'},
           {value:'eco_tac',label:'Ecografia e/ou TAC se lesões de maior dimensão'} ],
    tratamento:[ {value:'quisto_cons',label:'Quistos sinoviais: AINEs + crioterapia'} ],
    idade:null,
    notas:['Quistos sinoviais: apenas referenciar se sintomáticos após 6 meses de tratamento conservador. Restantes: referenciar sempre.'] },

  /* ============ ORTOPEDIA INFANTIL ============ */
  { id:'pe_boto', regiao:'infantil', nome:'Pé boto', lado:true,
    cardDesc:'Diagnóstico clínico: retropé em equino e varo; mediopé cavo; antepé em adução; pregas cutâneas mediais e posteriores.',
    doenteTipo:[
      {value:'equino_varo',label:'Retropé em equino e varo; mediopé cavo; antepé em adução; pregas cutâneas mediais e posteriores'} ],
    detalhes:[
      {id:'perinatal',label:'Patologia associada / parto e gravidez',placeholder:'ex.: gravidez vigiada, parto eutócico às 39s, sem outra patologia'} ],
    prioridade:[],
    normalGate:'sempre', nivelSempre:'mp15', minConservadorMeses:0,
    mcdt:[ {value:'clinico',label:'O diagnóstico é clínico'} ],
    tratamento:[],
    idade:{min:0,max:18},
    notas:['Referenciar todos os casos.'] },

  { id:'displasia_anca', regiao:'infantil', nome:'Displasia do desenvolvimento da anca', lado:true,
    cardDesc:'Fatores de risco (AF, apresentação pélvica); Barlow/Ortolani, limitação da abdução; Galeazzi; Trendelenburg.',
    doenteTipo:[
      {value:'fr',label:'Fatores de risco (antecedentes familiares, apresentação pélvica, deformidades posicionais)'},
      {value:'barlow',label:'Barlow/Ortolani positivos ou limitação da abdução da anca (< 3 meses)',desc:'Barlow provoca a luxação (adução + pressão posterior); Ortolani redu-la (abdução + elevação) — "clunk".'},
      {value:'galeazzi',label:'Limitação da abdução da anca e discrepância de comprimento dos membros — Galeazzi (> 3 meses)',desc:'Galeazzi: joelhos a alturas diferentes, com ancas e joelhos fletidos.'},
      {value:'trend',label:'Trendelenburg, obliquidade pélvica, lordose lombar (> 1 ano)'} ],
    detalhes:[
      {id:'perinatal',label:'Patologia associada / parto e gravidez',placeholder:'ex.: apresentação pélvica, AF de displasia'} ],
    prioridade:[],
    normalGate:'sempre', nivelSempre:'mp15', minConservadorMeses:0,
    mcdt:[ {value:'eco_anca',label:'Ecografia perante clínica sugestiva até aos 4-6 meses; ecografia de rastreio às 6/8 semanas se fatores de risco'},
           {value:'rx_anca',label:'Raio-X perante clínica sugestiva a partir dos 4-6 meses de idade'} ],
    tratamento:[],
    idade:{min:0,max:18},
    notas:['Referenciar todos os casos (protocolo ULSM — gestão de documentos).'] },

  { id:'epifisiolise', regiao:'infantil', nome:'Epifisiólise femoral proximal', lado:true,
    cardDesc:'Sexo masculino, obeso, início da adolescência; coxalgia ou dor referida ao joelho; marcha claudicante em rotação externa.',
    doenteTipo:[
      {value:'perfil',label:'Sexo masculino, obeso, início da adolescência'},
      {value:'coxalgia',label:'Coxalgia ou dor referida ao joelho'},
      {value:'marcha_re',label:'Marcha claudicante com membro em rotação externa; sinal de Drehmann',desc:'Drehmann: rotação externa obrigatória da anca durante a flexão passiva.'} ],
    detalhes:[
      {id:'perinatal',label:'Patologia associada / parto e gravidez / duração das queixas',placeholder:'ex.: sem antecedentes; coxalgia há 3 semanas'} ],
    prioridade:[],
    normalGate:'sempre', nivelSempre:'mp15', minConservadorMeses:0,
    mcdt:[ {value:'rx_bacia_low',label:'Raio-X AP da bacia e perfil de Lauenstein (sinal de Klein, sinal "S")'} ],
    tratamento:[ {value:'descarga',label:'Aconselhar descarga'} ],
    idade:{min:8,max:18},
    notas:['Referenciar sempre como muito prioritário — mesmo com Raio-X relatado normal, se suspeita clínica.'] },

  { id:'escoliose', regiao:'infantil', nome:'Escoliose', lado:false,
    cardDesc:'Adolescente, sexo feminino, curva torácica direita; assimetria de ombros/cintura, giba; teste de Adams.',
    doenteTipo:[
      {value:'perfil',label:'Adolescente, sexo feminino, curva torácica direita'},
      {value:'assimetria',label:'Assimetria de ombros e/ou cintura, proeminência de uma omoplata, giba torácica/lombar, desvio do tronco em relação à pelve'},
      {value:'adams',label:'Teste de Adams positivo',desc:'Flexão anterior do tronco revela giba costal/lombar (assimetria rotacional).'} ],
    detalhes:[
      {id:'pat_assoc',label:'Patologia associada / evolução da deformidade',placeholder:'ex.: sem patologia associada; giba notada há 6 meses, a aumentar'} ],
    prioridade:[
      {value:'cobb10',label:'Curvas > 10º (ângulo de Cobb) — referenciar sempre a consulta de Ortopedia e MFR',nivel:'normal'} ],
    normalGate:'criterios', minConservadorMeses:0,
    mcdt:[ {value:'rx_extralongo_col',label:'Raio-X face e perfil extralongo da coluna vertebral (ângulo de Cobb, rotação vertebral, Risser)'} ],
    tratamento:[ {value:'reforco_natacao',label:'Reforço muscular, natação'} ],
    idade:{min:0,max:18},
    notas:['Vigilância se não cumprir critérios de referenciação.'] },

  { id:'varo_valgo', regiao:'infantil', nome:'Deformidade varo/valgo dos membros inferiores', lado:false,
    cardDesc:'Avaliar contra a sequência fisiológica: varo até aos 18 meses, pico de valgo aos 3-5 anos, valgo do adulto (5-7º) aos 7/8 anos.',
    doenteTipo:[],
    detalhes:[
      {id:'pat_assoc',label:'Patologia associada / evolução da deformidade',placeholder:'ex.: valgo bilateral notado aos 4 anos, sem correção desde então'} ],
    prioridade:[
      {value:'unilateral',label:'Varo/valgo unilateral ou assimétrico, independentemente da idade',nivel:'p60',desc:'Assimetria sugere causa patológica (Blount, displasia, sequela fisária), não variante fisiológica.'},
      {value:'valgo8',label:'Valgo > 8-10º (AFT) ou DIM > 8-10 cm, progressivo/sem sinais de correção, em > 7 anos',nivel:'normal',visivel:s=>s.idade==null||s.idade===''||+s.idade>=7},
      {value:'varo3',label:'Varo em criança com idade > 3 anos',nivel:'normal',visivel:s=>s.idade==null||s.idade===''||+s.idade>=3} ],
    normalGate:'criterios', minConservadorMeses:0,
    mcdt:[ {value:'rx_extralongo_mi',label:'Raio-X extralongo dos membros inferiores'} ],
    tratamento:[],
    idade:{min:0,max:18},
    notas:['Sequência previsível: varo 0-18 meses; neutro 14-24 meses; valgização a partir dos 2 anos; pico de valgo aos 3-5 anos; valgo normal do adulto (5-7º) aos 7/8 anos.',
           'Vigilância se não cumprir critérios de referenciação.'] },

  { id:'dismetria', regiao:'infantil', nome:'Dismetria dos membros inferiores', lado:false,
    cardDesc:'Medição: blocos sob o membro mais curto até nivelar a pelve, ou fita métrica da EIAS ao maléolo medial.',
    doenteTipo:[],
    detalhes:[
      {id:'pat_assoc',label:'Patologia associada / evolução da deformidade / medição',placeholder:'ex.: dismetria de 2 cm medida com blocos, estável'} ],
    prioridade:[
      {value:'maior15',label:'Dismetria > 1,5 cm',nivel:'normal'} ],
    normalGate:'criterios', minConservadorMeses:0,
    mcdt:[ {value:'rx_extralongo_mi',label:'Raio-X extralongo dos membros inferiores'} ],
    tratamento:[],
    idade:{min:0,max:18},
    notas:['Vigilância se não cumprir critérios de referenciação (o critério de referenciação é dismetria > 1,5 cm).',
           'Medição: com o doente em ortostatismo, colocar blocos sob o membro mais curto até a pelve ficar nivelada (altura dos blocos = discrepância); ou fita métrica desde a espinha ilíaca antero-superior até ao maléolo medial.'] },

  { id:'desvios_torsionais', regiao:'infantil', nome:'Desvios torsionais dos membros inferiores', lado:false,
    cardDesc:'In-toing (pés para dentro) ou out-toing (pés para fora).',
    doenteTipo:[
      {value:'intoing',label:'In-toing (pés para dentro)',desc:'Causas típicas por idade: metatarso aduto (bebé), torção tibial (2-4 anos), anteversão femoral (4-8 anos).'},
      {value:'outtoing',label:'Out-toing (pés para fora)'} ],
    detalhes:[
      {id:'pat_assoc',label:'Patologia associada / evolução da deformidade',placeholder:'ex.: in-toing bilateral desde o início da marcha, sem quedas'} ],
    prioridade:[
      {value:'unilateral',label:'Desvio unilateral',nivel:'normal'},
      {value:'bilateral_prog',label:'Desvio bilateral progressivo',nivel:'normal'},
      {value:'persistente',label:'Desvio persistente e sintomático após os 8-10 anos',nivel:'normal',visivel:s=>s.idade==null||s.idade===''||+s.idade>=8} ],
    normalGate:'criterios', minConservadorMeses:0,
    mcdt:[ {value:'rx_extralongo_mi',label:'Raio-X extralongo dos membros inferiores'} ],
    tratamento:[],
    idade:{min:0,max:18},
    notas:['Vigilância se não cumprir os critérios de referenciação.'] },

  { id:'pe_plano_valgo', regiao:'infantil', nome:'Pé plano-valgo', lado:true,
    cardDesc:'Colapso do arco longitudinal medial; valgo do retropé; abdução do antepé ("too many toes sign").',
    doenteTipo:[
      {value:'colapso_arco',label:'Colapso do arco longitudinal medial'},
      {value:'valgo_retrope',label:'Valgo do retropé — calcâneo em eversão'},
      {value:'too_many_toes',label:'Abdução do antepé — "too many toes sign"'},
      {value:'flexivel',label:'Flexível: arco reconstitui com teste em pontas dos pés e teste de Jack (extensão passiva do hálux)'},
      {value:'rigido_achado',label:'Rígido: arco não reconstitui com as manobras'} ],
    detalhes:[
      {id:'pat_assoc',label:'Patologia associada / evolução da deformidade',placeholder:'ex.: pé plano flexível desde sempre, dor após desporto no último ano'} ],
    prioridade:[
      {value:'rigido',label:'Pé plano-valgo rígido ou unilateral',nivel:'normal'},
      {value:'flex_sint',label:'Pé plano-valgo flexível persistente e sintomático após os 8-10 anos',nivel:'normal',visivel:s=>s.idade==null||s.idade===''||+s.idade>=8} ],
    normalGate:'criterios', minConservadorMeses:0,
    mcdt:[ {value:'rx_pes_obliquo',label:'Raio-X face e perfil dos pés em carga + Raio-X oblíquo dos pés'} ],
    tratamento:[],
    idade:{min:0,max:18},
    notas:['Vigilância se fora dos critérios de referenciação.'] },

  { id:'pe_cavo_varo', regiao:'infantil', nome:'Pé cavo-varo', lado:true,
    cardDesc:'Raramente idiopático (mais frequentemente neuromuscular ou sequelar); aumento do arco medial; varo do retropé; garra dos dedos.',
    doenteTipo:[
      {value:'arco_aumentado',label:'Aumento do arco longitudinal medial — pé cavo'},
      {value:'varo_retrope',label:'Varo do retropé — calcâneo em inversão'},
      {value:'garra',label:'Garra dos dedos'},
      {value:'calosidades',label:'Calosidades plantares'} ],
    detalhes:[
      {id:'pat_assoc',label:'Patologia associada / evolução da deformidade',placeholder:'ex.: suspeita neuromuscular, deformidade progressiva desde os 6 anos'} ],
    prioridade:[],
    normalGate:'sempre', minConservadorMeses:0,
    mcdt:[ {value:'rx_pes',label:'Raio-X face e perfil dos pés em carga'} ],
    tratamento:[],
    idade:{min:0,max:18},
    notas:['Raramente idiopático; mais frequentemente neuromuscular ou sequelar. Referenciar sempre.'] },
  ],
};

/* ---------- faixas etárias típicas (inferidas do "doente tipo"; ordenação/destaque, NÃO filtro) ---------- */
const FAIXAS = {
  coifa:[40,70], tend_calc:[18,45], omartrose:[65,120], capsulite:[40,65], instabilidade_ombro:[14,40],
  epicondilite:[18,65], artrose_cotovelo:[50,120],
  dupuytren:[40,120], rizartrose:[40,120], dequervain:[18,65], canal_carpico:[30,120],
  coxartrose:[45,120], coxalgia_jovem:[16,45], coxalgia_subita:[16,55], dor_lateral_coxa:[40,120],
  gonalgia:[18,120], torcao_joelho:[14,65],
  hallux_valgus:[30,120], hallux_rigidus:[30,120], dedos_menores:[30,120], metatarsalgia:[18,120],
  fasceite:[18,120], aquiles:[18,70], entorse_tornozelo:[14,60], artrose_tornozelo:[40,120], pe_plano_adq:[40,120],
  cervical:[18,120], lombar:[18,120], fratura_osteop:[50,120],
  dor_protese:[40,120], neoformacao:[0,120],
  pe_boto:[0,2], displasia_anca:[0,3], epifisiolise:[8,16], escoliose:[8,18],
  varo_valgo:[0,10], dismetria:[0,18], desvios_torsionais:[0,12], pe_plano_valgo:[2,18], pe_cavo_varo:[2,18],
};
ORTO.patologias.forEach(function (p) {
  const f = FAIXAS[p.id];
  p.faixa = f ? { min:f[0], max:f[1] } : { min:0, max:120 };
});
ORTO.faixaMatch = function (p, idade) {
  return idade != null && idade !== '' && +idade >= p.faixa.min && +idade <= p.faixa.max;
};

/* ---------- conteúdo do folheto para o doente ----------
   NOTA: explicações leigas e sinais de alarme são conteúdo ADICIONAL (não constam do
   documento de trabalho); redigidos segundo boa prática geral, para validação clínica local. */
const LEIGO = {
  coifa:'Lesão dos tendões que envolvem o ombro (coifa dos rotadores), que pode causar dor e fraqueza ao elevar o braço.',
  tend_calc:'Depósitos de cálcio num tendão do ombro, que causam dor, muitas vezes pior à noite.',
  omartrose:'Desgaste da cartilagem da articulação do ombro (artrose), que causa dor e rigidez.',
  capsulite:'"Ombro congelado" — inflamação e aperto da cápsula do ombro; na maioria dos casos resolve por si, podendo demorar até 24 meses.',
  instabilidade_ombro:'Ombro que "salta" ou dá sensação de sair do sítio, sobretudo durante o desporto.',
  epicondilite:'Inflamação dos tendões do cotovelo ("cotovelo de tenista/golfista"), com dor num dos lados do cotovelo.',
  artrose_cotovelo:'Desgaste da cartilagem do cotovelo, com dor e rigidez.',
  dupuytren:'Espessamento na palma da mão que pode ir "encolhendo" um ou mais dedos.',
  rizartrose:'Desgaste da articulação da base do polegar, com dor a agarrar e a fazer pinça.',
  dequervain:'Inflamação dos tendões do polegar junto ao punho, com dor no bordo do punho.',
  canal_carpico:'Compressão de um nervo ao nível do punho, com formigueiros e dormência na mão, sobretudo à noite.',
  coxartrose:'Desgaste da cartilagem da anca (artrose), com dor na virilha e dificuldade progressiva a andar.',
  coxalgia_jovem:'Dor na anca do adulto jovem, geralmente relacionada com o desporto e com a forma da articulação.',
  coxalgia_subita:'Lesão aguda de um músculo da coxa (reto femoral ou isquiotibiais), habitualmente por esforço súbito.',
  dor_lateral_coxa:'Dor na parte de fora da anca, na zona do trocânter, muitas vezes por inflamação dos tendões dos músculos glúteos.',
  gonalgia:'Dor no joelho, frequentemente por desgaste da cartilagem ou sobrecarga.',
  torcao_joelho:'Lesão do joelho após um movimento de torção, que pode atingir os meniscos ou os ligamentos.',
  hallux_valgus:'"Joanete" — desvio do dedo grande do pé, com proeminência dolorosa.',
  hallux_rigidus:'Desgaste da articulação do dedo grande do pé, com dor e rigidez.',
  dedos_menores:'Deformidade dos dedos do pé (em garra ou em martelo), com dor e dificuldade com o calçado.',
  metatarsalgia:'Dor na planta do pé, na zona de apoio dos dedos, muitas vezes com calosidades.',
  fasceite:'Inflamação da fáscia da planta do pé, com dor no calcanhar sobretudo nos primeiros passos da manhã.',
  aquiles:'Inflamação do tendão de Aquiles (atrás do tornozelo), com dor no esforço.',
  entorse_tornozelo:'Sequelas de entorses do tornozelo, com dor persistente ou sensação de falta de firmeza.',
  artrose_tornozelo:'Desgaste da cartilagem do tornozelo ou do retropé, com dor e limitação a andar.',
  pe_plano_adq:'Queda progressiva do arco do pé no adulto, com dor no tornozelo e no lado interno do pé.',
  cervical:'Dor no pescoço, por vezes com irradiação ou formigueiros para os braços.',
  lombar:'Dor no fundo das costas, por vezes com irradiação ou formigueiros para as pernas.',
  dor_protese:'Dor numa articulação já operada com prótese, que deve ser avaliada.',
  neoformacao:'Tumefação ("alto") de aparecimento recente, que deve ser avaliada.',
  pe_boto:'Deformidade do pé do bebé presente ao nascer, que precisa de tratamento precoce por Ortopedia.',
  displasia_anca:'Desenvolvimento incompleto da anca do bebé, que precisa de avaliação precoce por Ortopedia.',
  epifisiolise:'Deslizamento da cabeça do fémur no adolescente — precisa de avaliação urgente e de evitar apoiar a perna.',
  escoliose:'Curvatura da coluna, mais frequente na adolescência.',
  varo_valgo:'Pernas "arqueadas" ou "em X" na criança — na maioria dos casos faz parte do crescimento normal.',
  dismetria:'Diferença de comprimento entre as pernas.',
  desvios_torsionais:'Pés "para dentro" ou "para fora" na criança — na maioria dos casos corrige com o crescimento.',
  pe_plano_valgo:'Pé plano na criança — quase sempre flexível e parte do desenvolvimento normal.',
  pe_cavo_varo:'Arco do pé demasiado alto na criança, que deve ser sempre avaliado.',
};
ORTO.patologias.forEach(function (p) { p.leigo = LEIGO[p.id] || ''; });

/* Doente tipo (protocolo) = texto de apoio à escolha no cartão da patologia.
   Substitui descrições redigidas à mão: o que o cartão mostra é o documento. */
ORTO.patologias.forEach(function (p) {
  if (p.doenteTipo && p.doenteTipo.length)
    p.cardDesc = p.doenteTipo.map(function (o) { return o.label; }).join(' · ');
});
ORTO.patologias.find(function (p) { return p.id === 'fasceite'; }).anexo = 'anexo1';

// tratamentos do documento → linguagem simples (chave = value dos chips de tratamento)
ORTO.tratamentoLeigo = {
  aines:'Medicação anti-inflamatória para a dor, conforme indicado pelo seu médico.',
  analg:'Medicação para a dor (anti-inflamatórios, paracetamol ou outra), conforme indicado pelo seu médico.',
  aines_dipro:'Medicação anti-inflamatória para a dor; em alguns casos, uma injeção prescrita pelo médico.',
  aines_cct:'Medicação para a dor, conforme indicado pelo seu médico.',
  fisio:'Fisioterapia.',
  fisio_baixo:'Fisioterapia e exercício de baixo impacto: caminhada leve, bicicleta ou exercícios na água.',
  banda:'Banda de cotovelo (banda para epicondilite) durante as atividades.',
  tala:'Tala de imobilização do polegar: todo o dia no 1.º mês; só à noite no 2.º mês.',
  calcado:'Calçado largo e confortável, evitando saltos altos e biqueiras apertadas.',
  calcado_rocker:'Calçado com sola curva (tipo "rocker"), que reduz a dobragem dolorosa do pé; adaptar as atividades.',
  separador:'Separador de silicone entre os dedos.',
  palmilha:'Palmilha adequada, aconselhada em ortopedia técnica.',
  palmilha_rigida:'Palmilha rígida na parte da frente do pé.',
  palmilha_arco:'Palmilha com apoio do arco do pé; adaptar as atividades.',
  talonete:'Almofada de gel no calcanhar, dentro do sapato.',
  alongamento:'Exercícios de alongamento diários (ver exercícios abaixo).',
  imob_elastica:'Ligadura ou estabilizador elástico do tornozelo durante o desporto.',
  colar:'Repouso e colar cervical apenas na fase aguda, no máximo 72 horas.',
  repouso:'Repouso relativo na fase aguda (evitar o que agrava a dor; não ficar imobilizado).',
  perda_ponderal:'Perda de peso, se excesso de peso — alivia a carga sobre a articulação.',
  vigilancia:'Vigilância da evolução; volte à consulta se notar agravamento da contratura dos dedos.',
  quisto_cons:'Para quistos: medicação anti-inflamatória e gelo local.',
  descarga:'Não apoiar a perna (usar canadianas) até à observação hospitalar.',
  gelo:'Gelo local nas primeiras 48 horas, 15 a 20 minutos, várias vezes ao dia.',
  canadianas:'Uso de canadianas enquanto a marcha for dolorosa.',
  crioterapia:'Crioterapia (gelo local) após a atividade.',
  controlo_ponderal:'Controlo do peso, se aplicável — reduz a sobrecarga sobre a anca.',
  reforco_natacao:'Reforço muscular e natação.',
};

// Anexo 1 do documento — exercícios para fasceíte plantar (imagem: anexo1-fasceite.png)
ORTO.anexo1 = {
  titulo:'Exercícios diários — fasceíte plantar (Anexo 1 do protocolo)',
  imagem:'anexo1-fasceite.png',
  passos:[
    'Sentado, com a perna esticada, puxe a ponta do pé na sua direção com uma toalha; mantenha 30 segundos, 3 vezes.',
    'De frente para a parede, com a perna de trás esticada e o calcanhar no chão, incline-se em direção à parede para alongar a barriga da perna; 30 segundos, 3 vezes.',
    'Sentado num banco, deslize o pé para trás mantendo os dedos no chão, para alongar a planta do pé; 30 segundos.',
    'Com o pé sobre uma toalha estendida no chão, use os dedos para a enrugar e puxar; 10 a 15 repetições.',
    'Na beira de um degrau, deixe o calcanhar descair lentamente abaixo do nível do degrau; 30 segundos.',
    'Role uma garrafa ou um rolo sob a planta do pé, 1 a 2 minutos.',
  ],
};

// sinais de alarme para o doente (folheto) — conteúdo adicional, fora do documento;
// 'visivel' restringe à região em que o alarme faz sentido
ORTO.alarmeDoente = [
  { texto:'Febre ou arrepios associados à dor.' },
  { texto:'Dor intensa em repouso ou durante a noite, que não alivia.' },
  { texto:'Perda de força, dormência ou formigueiros de aparecimento recente.' },
  { texto:'Incapacidade súbita de mexer ou de apoiar o membro.' },
  { texto:'Na dor de costas: dificuldade em urinar/controlar os esfíncteres ou dormência na zona genital — recorra de imediato ao Serviço de Urgência.',
    visivel: s => s.regiao === 'coluna' },
  { texto:'Na criança: recusa súbita em andar ou em usar o membro, sobretudo com febre — recorra ao Serviço de Urgência.',
    visivel: s => s.regiao === 'infantil' },
];

/* ---------- helpers de estado ---------- */
ORTO.patId = function (s) { return s.regiao ? (s['pat_' + s.regiao] || null) : null; };
ORTO.pat = function (s) { const id = ORTO.patId(s); return ORTO.patologias.find(p => p.id === id) || null; };

/* ---------- módulos do u-stack ---------- */
ORTO.buildModules = function () {
  const P = ORTO.patologias;
  // transversais (dor em prótese, neoformação): sempre as 2 últimas opções de todas as regiões
  const transversais = [P.find(p => p.id === 'dor_protese'), P.find(p => p.id === 'neoformacao')];
  const patCards = ORTO.regioes.map(r => ({
    id:'pat_' + r.id, label:'Patologia — ' + r.label, type:'single', density:'cards',
    showIf: s => s.regiao === r.id,
    // cards ordenados por faixa etária típica (mais jovem → mais idoso) + transversais no fim
    options: P.filter(p => p.regiao === r.id)
      .slice().sort((a, b) => (a.faixa.min - b.faixa.min) || (a.faixa.max - b.faixa.max))
      .concat(transversais)
      .map(p => ({ value:p.id, label:p.nome, desc:p.cardDesc })),
  }));
  const per = (p, sfx, def) => Object.assign({ id:sfx + '_' + p.id, showIf: s => ORTO.patId(s) === p.id }, def);
  const quadro = [], mcdt = [], trat = [];
  P.forEach(p => {
    // o doente tipo NÃO é escolha múltipla: é texto de apoio no cartão da patologia (ver cardDesc)
    // detalhes textuais exigidos pela história clínica do documento (ex.: morfologia da lesão, parto e gravidez)
    (p.detalhes || []).forEach(d => quadro.push({
      id:'det_' + p.id + '_' + d.id, label:d.label, type:'text', placeholder:d.placeholder,
      showIf: s => ORTO.patId(s) === p.id,
    }));
    // título conforme o conteúdo: chips nivel:'normal' são critérios de ENTRADA (referenciação),
    // os restantes são de prioridade; com mistura, usa o combinado
    const temNormal = p.prioridade.some(c => c.nivel === 'normal');
    const temPrio = p.prioridade.some(c => c.nivel !== 'normal');
    const tituloPrio = temNormal && temPrio ? 'Critérios de referenciação e prioridade'
                     : temNormal ? 'Critérios de referenciação' : 'Critérios de prioridade';
    if (p.prioridade.length) quadro.push(per(p, 'prio', { label:tituloPrio, type:'multi',
      // tone = prioridade que o critério desencadeia: SU/MP15 → vermelho, P60 → âmbar, NORMAL → verde
      options:p.prioridade.map(c => ({ value:c.value, label:c.label, desc:c.desc, visivel:c.visivel, finding:true,
        tone:{ su:'critical', mp15:'critical', p60:'warn', normal:'ok' }[c.nivel] })) }));
    if (p.mcdt.length) mcdt.push(per(p, 'mcdt', { label:'MCDT realizados', type:'multi', options:p.mcdt }));
    if (p.tratamento.length) trat.push(per(p, 'trat', { label:'Tratamento efetuado', type:'multi', options:p.tratamento }));
  });
  const needTratDur = s => { const p = ORTO.pat(s); return !!p && p.normalGate === 'padrao'; };
  return [
    { id:'doente', title:'Doente', navLabel:'D', fields:[
      { id:'idade', label:'Idade', type:'numeric', unit:'anos', hardMin:0, hardMax:120 },
      // sexo removido do questionário: não filtra patologias nem altera a decisão
      { id:'comorb', label:'Comorbilidades', type:'multi', density:'chips', default:'none',
        groups:ORTO.comorbilidades.groups, options:ORTO.comorbilidades.options },
    ]},
    { id:'regiao', title:'Região anatómica', navLabel:'R', fields:[
      { id:'regiao', label:'Região', type:'single', density:'buttons',
        options:ORTO.regioes.map(r => ({ value:r.id, label:r.label,
          // otimização: "Ortopedia Infantil" esconde-se com idade adulta conhecida
          visivel: r.id === 'infantil' ? (s => s.idade == null || s.idade === '' || +s.idade <= 18) : undefined })) },
    ]},
    { id:'patologia', title:'Patologia', navLabel:'P', fields: patCards },
    { id:'quadro', title:'Quadro clínico', navLabel:'Q', fields: [
      { id:'lado', label:'Lado', type:'single',
        options:[{value:'dto',label:'Direito'},{value:'esq',label:'Esquerdo'},{value:'bilat',label:'Bilateral'}],
        showIf: s => { const p = ORTO.pat(s); return !!p && p.lado; } },
      { id:'evol', label:'Tempo de evolução', type:'onset', showIf: s => !!ORTO.patId(s) },
      // item (2) da História Clínica do protocolo — texto livre, opcional
      { id:'func', label:'Funcionalidade e grau de incapacidade', type:'text', showIf: s => !!ORTO.patId(s),
        placeholder:'ex.: marcha limitada a 200 m, sobe escadas com apoio, dor noturna, baixa laboral' },
      // IMC vive no quadro clínico: só é pedido quando a patologia escolhida o torna relevante
      { id:'imc', label:'IMC', type:'imc', showIf: s => ORTO.imcRelevant.indexOf(ORTO.patId(s)) !== -1 },
    ].concat(quadro)},
    { id:'mcdt', title:'MCDT', navLabel:'M', fields: mcdt },
    { id:'trat', title:'Tratamento prévio', navLabel:'T', fields: trat.concat([
      // só aparece com ≥1 tratamento efetuado selecionado (sem tratamento, a duração é "nenhum" implícito).
      // evolução conhecida < 3 meses ⇒ a única resposta possível seria "< 3 meses" → a pergunta não se faz
      // (o motor deriva 'lt3'); com evolução entre 3–6 meses, a opção "≥ 6 meses" também não é possível.
      { id:'tratdur', label:'Duração do tratamento conservador', type:'single', ordinal:true,
        showIf: s => { const p = ORTO.pat(s); return !!p && p.normalGate === 'padrao'
          && (!p.tratamento.length || (s['trat_' + p.id] || []).length > 0)
          && !(s.evol != null && s.evol < 13); },
        options:[{value:'lt3',label:'< 3 meses'},
                 {value:'m3_6',label:'3–6 meses',visivel:s=>s.evol==null||s.evol>=13},
                 {value:'ge6',label:'≥ 6 meses',visivel:s=>s.evol==null||s.evol>=26}] },
      { id:'crit_normal', label:'Critérios para referenciação NORMAL', type:'multi', showIf:needTratDur,
        options:[{value:'avd',label:'Queixas limitativas para as AVDs',tone:'ok'},
                 {value:'motivado',label:'Doente aceita e está motivado para tratamento cirúrgico',tone:'ok'},
                 // critérios específicos de patologia (ex.: Hueston no Dupuytren)
                 {value:'hueston',label:'Teste de Hueston positivo',tone:'ok',
                  visivel:s=>{const p=ORTO.pat(s);return !!p&&(p.exigeCrit||[]).some(c=>c.value==='hueston');}}] },
    ])},
  ];
};

root.ORTO = ORTO;
if (typeof module !== 'undefined' && module.exports) module.exports = ORTO;
})(typeof window !== 'undefined' ? window : globalThis);
