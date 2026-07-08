/* Referenciação Ortopedia ULSM — conteúdo clínico.
   Transcrição verbatim de docs/ortopedia-regras.md (Documento de Trabalho - Ortopedia,
   regras negociadas entre o serviço de Ortopedia e os CSP da ULSM). Não parafrasear. */
(function (root) {
'use strict';

const ORTO = {
  // ordem = layout em linhas anatómicas (ver grelha CSS do campo região no HTML):
  // MS (ombro·cotovelo·punho/mão) / MI (anca·joelho·pé/tornozelo) / coluna / infantil / prótese·neoformação
  regioes: [
    { id:'ombro', label:'Ombro' }, { id:'cotovelo', label:'Cotovelo' }, { id:'punho_mao', label:'Punho e Mão' },
    { id:'anca', label:'Anca' }, { id:'joelho', label:'Joelho' }, { id:'pe_tornozelo', label:'Pé e Tornozelo' },
    { id:'coluna', label:'Coluna' },
    { id:'infantil', label:'Ortopedia Infantil' },
    { id:'protese', label:'Doente com prótese' }, { id:'neoformacao', label:'Neoformação' },
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
      {value:'omalgia_deltoide',label:'Omalgia referida ao deltoide'},
      {value:'inflamatorio',label:'Padrão inflamatório (noite ++)'},
      {value:'mob_completa',label:'Mobilidade passiva e ativa completas'} ],
    prioridade:[
      {value:'rutura_traum',label:'Suspeita de rutura traumática aguda da coifa',nivel:'mp15'},
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
      {value:'omalgia_deltoide',label:'Omalgia referida ao deltoide'},
      {value:'inflamatorio',label:'Padrão inflamatório (noite ++)'},
      {value:'mob_completa',label:'Mobilidade passiva e ativa completas'} ],
    prioridade:[
      {value:'hiperalgica',label:'Fase hiperálgica de reabsorção com até uma semana de evolução (para infiltração subacromial)',nivel:'su'} ],
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
      {value:'mecanico',label:'Padrão mecânico (aumenta com a atividade)'},
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
      {value:'luxacoes',label:'Episódios de luxação ou sensação de instabilidade durante exercício'},
      {value:'mob_normal',label:'Mobilidade passiva e ativa habitualmente normais'} ],
    prioridade:[
      {value:'lux_aguda',label:'Luxação aguda pós-traumática',nivel:'su'},
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
    mcdt:[ {value:'rx_cotovelo',label:'Raio-X face e perfil do cotovelo'},
           {value:'eco_cotovelo',label:'Ecografia articular (espessamento ECRB)'} ],
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
           {value:'tac_cotovelo',label:'TAC do cotovelo'} ],
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
    exigeAchados:[{value:'hueston',label:'Teste de Hueston positivo'}],
    mcdt:[ {value:'clinico',label:'O diagnóstico é clínico'} ],
    tratamento:[ {value:'vigilancia',label:'Vigilância da evolução até indicação cirúrgica (teste de Hueston positivo)'} ],
    idade:null, notas:[] },

  { id:'rizartrose', regiao:'punho_mao', nome:'Rizartrose', lado:true,
    cardDesc:'Dor mecânica na base do polegar; Grind e Shear test positivos; deformidade, por vezes polegar em Z; perda de força de preensão e pinça.',
    doenteTipo:[
      {value:'dor_base_polegar',label:'Dor de carácter mecânico na base do polegar'},
      {value:'grind_shear',label:'Grind e Shear test positivos'},
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
      {value:'finkelstein',label:'Dor aumenta com desvio cubital (Teste de Finkelstein positivo)'} ],
    prioridade:[
      {value:'jovem_desp',label:'Jovem desportista após tratamento conservador',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:6,
    mcdt:[ {value:'rx_punho',label:'Raio-X face e perfil do punho'},
           {value:'eco_punho',label:'Ecografia (sinovite do 1.º compartimento extensor)'} ],
    tratamento:[ {value:'aines',label:'Controlo da dor (AINEs)'},
                 {value:'tala',label:'Tala imobilizadora do polegar (Push Metagrip, Actimove Rhizo forte) — 24h no 1.º mês; só à noite no 2.º mês'},
                 {value:'fisio',label:'Fisioterapia'} ],
    idade:null,
    notas:['Em mulheres que estiveram grávidas, o tratamento conservador poderá ser prolongado até 9 meses após o parto/cessação da gravidez.'] },

  { id:'canal_carpico', regiao:'punho_mao', nome:'Síndrome do canal cárpico / Neuropatias', lado:true,
    cardDesc:'Parestesias e dor no território do mediano, noturnas e matinais; perda de força progressiva; Phalen, Durkan e Tinel positivos.',
    doenteTipo:[
      {value:'parestesias',label:'Parestesias e dor na mão em território do nervo mediano, sobretudo noturnas (acordam o doente) e matinais'},
      {value:'perda_forca',label:'Perda de força progressiva'},
      {value:'phalen',label:'Phalen, Durkan e Tinel positivos'} ],
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
    mcdt:[ {value:'rx_lombar',label:'Raio-X coluna lombar (face + perfil)'},
           {value:'rx_bacia',label:'Raio-X face da bacia e perfil da anca'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'} ],
    idade:{min:40,max:120}, notas:[] },

  { id:'coxalgia_jovem', regiao:'anca', nome:'Coxalgia no adulto jovem', lado:true,
    cardDesc:'Coxalgia mecânica inguinal durante atividade desportiva (FABER/FADIR+); ressalto, crepitação ou bloqueio.',
    doenteTipo:[
      {value:'coxalgia_desp',label:'Coxalgia mecânica inguinal durante atividade desportiva, principalmente com flexão da anca (FABER ou FADIR positivos)'},
      {value:'ressalto',label:'Sensação de ressalto, crepitação ou bloqueio'},
      {value:'dor_glutea',label:'Dor glútea ou trocantérica por alteração do padrão de marcha'},
      {value:'mob_normal',label:'Mobilidade passiva e ativa habitualmente normais'} ],
    prioridade:[],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_bacia_dunn',label:'Raio-X face da bacia e perfil da anca + Dunn view (deformidade tipo CAM ou PINCER; quistos acetabulares)'} ],
    tratamento:[ {value:'aines',label:'Controlo da dor (AINEs)'},{value:'fisio',label:'Fisioterapia'} ],
    idade:null, notas:[] },

  /* ============ JOELHO ============ */
  { id:'gonalgia', regiao:'joelho', nome:'Gonalgia', lado:true,
    cardDesc:'Dor mecânica ou mista referida ao joelho, edema induzido pela atividade; limitação funcional; bloqueio/instabilidade.',
    doenteTipo:[
      {value:'dor_mecanica',label:'Dor de carácter mecânico ou misto referida ao joelho, edema induzido pela atividade'},
      {value:'limitacao',label:'Limitação funcional com redução das distâncias de marcha'},
      {value:'bloqueio',label:'Sensação de bloqueio, instabilidade ou corpo estranho'},
      {value:'mob_limitada',label:'Limitação das mobilidades passiva e ativa'},
      {value:'deform_axial',label:'Deformidade axial do membro inferior'} ],
    prioridade:[
      {value:'jovem_desp',label:'Jovem desportista após tratamento conservador',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_joelhos',label:'Raio-X dos joelhos — AP em carga + Schuss + perfil + axial das rótulas'},
           {value:'rx_extralongo',label:'Raio-X extra-longo dos membros inferiores em carga'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'},
                 {value:'perda_ponderal',label:'Perda ponderal se IMC > 25'} ],
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
      {value:'derrame_bloqueio',label:'Torção aguda com derrame articular imediato ou bloqueio do joelho',nivel:'su'},
      {value:'lesao_aguda_jovem',label:'Lesão aguda pós-traumática em doente jovem/desportista',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:3,
    mcdt:[ {value:'rx_joelhos',label:'Raio-X dos joelhos — AP em carga + Schuss + perfil + axial das rótulas'},
           {value:'rx_extralongo',label:'Raio-X extra-longo dos membros inferiores em carga'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'},
                 {value:'perda_ponderal',label:'Perda ponderal se IMC > 25'} ],
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
           {value:'eco_retrope',label:'Ecografia do retropé (espessamento)'} ],
    tratamento:[ {value:'calcado',label:'Alteração do calçado'},{value:'talonete',label:'Talonete calcâneo de gel'},
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
      {value:'instabilidade',label:'Sensação de instabilidade recorrente'} ],
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
           {value:'tac_tornozelo',label:'TAC do tornozelo'} ],
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
      {value:'primeiro_neuronio',label:'Sinais do 1.º neurónio'},
      {value:'alt_marcha',label:'Alterações do padrão da marcha'} ],
    prioridade:[
      {value:'defice_neuro',label:'Défice neurológico',nivel:'su'},
      {value:'duvida_defice',label:'Dúvida se défice neurológico / alteração do padrão da marcha',nivel:'mp15'},
      {value:'progressiva',label:'Queixas de evolução progressiva no último mês',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:6,
    mcdt:[ {value:'rx_cervical',label:'Raio-X coluna cervical (face, perfil, estudo dinâmico — hiperflexão/hiperextensão)'},
           {value:'tac_cervical',label:'TAC cervical'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'colar',label:'Repouso e colar cervical (fase aguda, não superior a 72 horas)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'} ],
    idade:null, notas:[] },

  { id:'lombar', regiao:'coluna', nome:'Dor lombar', lado:false,
    cardDesc:'Lombalgia com/sem irradiação e/ou parestesias (dermátomo); claudicação neurogénica.',
    doenteTipo:[
      {value:'lombalgia',label:'Lombalgia com/sem irradiação unilateral/bilateral e/ou parestesias (dermátomo)'},
      {value:'claudicacao',label:'Claudicação neurogénica'},
      {value:'defice_forca',label:'Défice de força / sinais do 1.º neurónio'},
      {value:'alt_marcha',label:'Alterações do padrão da marcha'},
      {value:'genito_urinarias',label:'Alterações genito-urinárias'} ],
    prioridade:[
      {value:'defice_neuro',label:'Défice neurológico',nivel:'su'},
      {value:'duvida_defice',label:'Dúvida se défice neurológico / alteração do padrão da marcha',nivel:'mp15'},
      {value:'progressiva',label:'Queixas de evolução progressiva no último mês',nivel:'p60'} ],
    normalGate:'padrao', minConservadorMeses:6,
    mcdt:[ {value:'rx_lombar',label:'Raio-X coluna lombar (face, perfil, estudo dinâmico — hiperflexão/hiperextensão)'},
           {value:'tac_lombar',label:'TAC lombar'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},
                 {value:'repouso',label:'Repouso (fase aguda, não superior a 72 horas)'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'} ],
    idade:null, notas:[] },

  { id:'fratura_osteop', regiao:'coluna', nome:'Fratura osteoporótica da coluna', lado:false,
    cardDesc:'Dor axial; história de trauma (minor/major) ou início espontâneo.',
    doenteTipo:[
      {value:'dor_axial',label:'Dor axial, história de trauma (minor/major) ou início espontâneo'},
      {value:'defice_forca',label:'Défice de força / perda de motricidade fina dos MS'},
      {value:'primeiro_neuronio',label:'Sinais do 1.º neurónio'},
      {value:'alt_marcha',label:'Alterações do padrão da marcha'},
      {value:'genito_urinarias',label:'Alterações genito-urinárias'} ],
    prioridade:[
      {value:'defice_trauma',label:'Défice neurológico ou existência de trauma recente',nivel:'su'} ],
    normalGate:'sempre', nivelSempre:'mp15', minConservadorMeses:0,
    mcdt:[ {value:'rx_segmento',label:'Raio-X da coluna, segmento afetado, em carga (face e perfil)'},
           {value:'tac_segmento',label:'TAC do segmento afetado'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},{value:'repouso',label:'Repouso'} ],
    idade:{min:50,max:120},
    notas:['Referenciar sempre como muito prioritário.'] },

  /* ============ DOENTE COM PRÓTESE ============ */
  { id:'dor_protese', regiao:'protese', nome:'Dor em doente com prótese', lado:true,
    cardDesc:'Documentar tempo de vida da prótese e complicações; caracterização da dor; trauma; sinais inflamatórios; mobilidades vs prévias.',
    doenteTipo:[
      {value:'trauma',label:'Existência de trauma'},
      {value:'sinais_infl',label:'Existência de sinais inflamatórios'},
      {value:'perda_mob',label:'Mobilidade passiva/ativa diminuída face às mobilidades prévias'} ],
    prioridade:[
      {value:'susp_lux',label:'Suspeita de luxação/fratura/infeção de prótese',nivel:'su'},
      {value:'lux_recorrente',label:'Luxação recorrente',nivel:'mp15'},
      {value:'evol_prog',label:'Queixas de evolução progressiva (perda de mobilidade/capacidade da marcha)',nivel:'p60'} ],
    normalGate:'padrao', requerMotivacao:false, minConservadorMeses:3,
    mcdt:[ {value:'rx_protese',label:'Raio-X face e perfil (linhas de radiolucência progressivas, subsidência de componentes, osteólise)'} ],
    tratamento:[ {value:'analg',label:'Controlo da dor (AINEs, paracetamol, tramadol)'},{value:'repouso',label:'Repouso'},
                 {value:'fisio_baixo',label:'Fisioterapia; exercícios de baixo impacto/hidroterapia'} ],
    idade:null,
    notas:['Seguimento: pelo Ortopedista até 1 ano pós-operatório; depois, seguimento radiológico e clínico anual pelo médico assistente nos CSP até aos 5 anos; posteriormente a cada 3 anos.'] },

  /* ============ NEOFORMAÇÃO ============ */
  { id:'neoformacao', regiao:'neoformacao', nome:'Neoformação', lado:true,
    cardDesc:'Documentar aspeto morfológico, ritmo de crescimento e sintomatologia associada (dor, limitação da mobilidade).',
    doenteTipo:[
      {value:'morfologia',label:'Aspeto morfológico da lesão documentado'},
      {value:'crescimento',label:'Ritmo de crescimento documentado'},
      {value:'sintomas',label:'Sintomatologia associada (dor e limitação da mobilidade)'} ],
    prioridade:[
      {value:'susp_malig',label:'Características suspeitas de malignidade',nivel:'mp15'},
      {value:'rutura_iminente',label:'Risco de rutura iminente ou com solução de continuidade',nivel:'p60'} ],
    normalGate:'sempre', minConservadorMeses:0,
    mcdt:[ {value:'rx_mao_punho',label:'Raio-X face e perfil da mão/punho'},
           {value:'eco_tac',label:'Ecografia e/ou TAC se lesões de maior dimensão'} ],
    tratamento:[ {value:'quisto_cons',label:'Quistos sinoviais: AINEs + crioterapia'} ],
    idade:null,
    notas:['Quistos sinoviais: apenas referenciar se sintomáticos após 6 meses de tratamento conservador. Restantes: referenciar sempre.'] },

  /* ============ ORTOPEDIA INFANTIL ============ */
  { id:'pe_boto', regiao:'infantil', nome:'Pé boto', lado:true,
    cardDesc:'Diagnóstico clínico: retropé em equino e varo; mediopé cavo; antepé em adução; pregas cutâneas mediais e posteriores.',
    doenteTipo:[
      {value:'equino_varo',label:'Retropé em equino e varo; mediopé cavo; antepé em adução; pregas cutâneas mediais e posteriores'},
      {value:'contexto',label:'Patologia associada / dados do parto e gravidez documentados'} ],
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
      {value:'barlow',label:'Barlow/Ortolani positivos ou limitação da abdução da anca (< 3 meses)'},
      {value:'galeazzi',label:'Limitação da abdução da anca e discrepância de comprimento dos membros — Galeazzi (> 3 meses)'},
      {value:'trend',label:'Trendelenburg, obliquidade pélvica, lordose lombar (> 1 ano)'} ],
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
      {value:'marcha_re',label:'Marcha claudicante com membro em rotação externa; sinal de Drehmann'} ],
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
      {value:'adams',label:'Teste de Adams positivo'} ],
    prioridade:[
      {value:'cobb10',label:'Curva > 10º (ângulo de Cobb)',nivel:'normal'} ],
    normalGate:'criterios', minConservadorMeses:0,
    mcdt:[ {value:'rx_extralongo_col',label:'Raio-X face e perfil extralongo da coluna vertebral (ângulo de Cobb, rotação vertebral, Risser)'} ],
    tratamento:[],
    idade:{min:0,max:18},
    notas:['Curvas > 10º: referenciar a consulta de Ortopedia + MFR.'] },

  { id:'varo_valgo', regiao:'infantil', nome:'Deformidade varo/valgo dos membros inferiores', lado:false,
    cardDesc:'Avaliar contra a sequência fisiológica: varo até aos 18 meses, pico de valgo aos 3-5 anos, valgo do adulto (5-7º) aos 7/8 anos.',
    doenteTipo:[],
    prioridade:[
      {value:'unilateral',label:'Varo/valgo unilateral ou assimétrico, independentemente da idade',nivel:'p60'},
      {value:'valgo8',label:'Valgo > 8-10º (AFT) ou DIM > 8-10 cm, progressivo/sem sinais de correção, em > 7 anos',nivel:'normal'},
      {value:'varo3',label:'Varo em criança com idade > 3 anos',nivel:'normal'} ],
    normalGate:'criterios', minConservadorMeses:0,
    mcdt:[ {value:'rx_extralongo_mi',label:'Raio-X extralongo dos membros inferiores'} ],
    tratamento:[],
    idade:{min:0,max:18},
    notas:['Sequência previsível: varo 0-18 meses; neutro 14-24 meses; valgização a partir dos 2 anos; pico de valgo aos 3-5 anos; valgo normal do adulto (5-7º) aos 7/8 anos.',
           'Vigilância se não cumprir critérios de referenciação.'] },

  { id:'dismetria', regiao:'infantil', nome:'Dismetria dos membros inferiores', lado:false,
    cardDesc:'Medição: blocos sob o membro mais curto até nivelar a pelve, ou fita métrica da EIAS ao maléolo medial.',
    doenteTipo:[],
    prioridade:[
      {value:'maior15',label:'Dismetria > 1,5 cm',nivel:'normal'} ],
    normalGate:'criterios', minConservadorMeses:0,
    mcdt:[ {value:'rx_extralongo_mi',label:'Raio-X extralongo dos membros inferiores'} ],
    tratamento:[],
    idade:{min:0,max:18},
    notas:['Medição: com o doente em ortostatismo, colocar blocos sob o membro mais curto até a pelve ficar nivelada (altura dos blocos = discrepância); ou fita métrica desde a espinha ilíaca antero-superior até ao maléolo medial.'] },

  { id:'desvios_torsionais', regiao:'infantil', nome:'Desvios torsionais dos membros inferiores', lado:false,
    cardDesc:'In-toing (pés para dentro) ou out-toing (pés para fora).',
    doenteTipo:[
      {value:'intoing',label:'In-toing (pés para dentro)'},
      {value:'outtoing',label:'Out-toing (pés para fora)'} ],
    prioridade:[
      {value:'unilateral',label:'Desvio unilateral',nivel:'normal'},
      {value:'bilateral_prog',label:'Desvio bilateral progressivo',nivel:'normal'},
      {value:'persistente',label:'Persistência após os 8-10 anos com impacto funcional significativo',nivel:'normal'} ],
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
    prioridade:[
      {value:'rigido',label:'Pé plano-valgo rígido ou unilateral',nivel:'normal'},
      {value:'flex_sint',label:'Pé plano-valgo flexível persistente e sintomático após os 8-10 anos',nivel:'normal'} ],
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
  coxartrose:[45,120], coxalgia_jovem:[16,45],
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

/* ---------- helpers de estado ---------- */
ORTO.patId = function (s) { return s.regiao ? (s['pat_' + s.regiao] || null) : null; };
ORTO.pat = function (s) { const id = ORTO.patId(s); return ORTO.patologias.find(p => p.id === id) || null; };

/* ---------- módulos do u-stack ---------- */
ORTO.buildModules = function () {
  const P = ORTO.patologias;
  const patCards = ORTO.regioes.map(r => ({
    id:'pat_' + r.id, label:'Patologia — ' + r.label, type:'single', density:'cards',
    showIf: s => s.regiao === r.id,
    // cards ordenados por faixa etária típica (mais jovem → mais idoso)
    options: P.filter(p => p.regiao === r.id)
      .slice().sort((a, b) => (a.faixa.min - b.faixa.min) || (a.faixa.max - b.faixa.max))
      .map(p => ({ value:p.id, label:p.nome, desc:p.cardDesc })),
  }));
  const per = (p, sfx, def) => Object.assign({ id:sfx + '_' + p.id, showIf: s => ORTO.patId(s) === p.id }, def);
  const quadro = [], mcdt = [], trat = [];
  P.forEach(p => {
    // rótulos-frase → checkbox-list (default do multi); chips só para rótulos curtos (guia de seleção do catálogo)
    if (p.doenteTipo.length) quadro.push(per(p, 'ach', { label:'Achados — doente tipo', type:'multi', options:p.doenteTipo }));
    if (p.prioridade.length) quadro.push(per(p, 'prio', { label:'Critérios de prioridade', type:'multi',
      options:p.prioridade.map(c => ({ value:c.value, label:c.label, finding:true })) }));
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
      { id:'imc', label:'IMC', type:'imc', showIf: s => ORTO.imcRelevant.indexOf(ORTO.patId(s)) !== -1 },
    ]},
    { id:'regiao', title:'Região anatómica', navLabel:'R', fields:[
      { id:'regiao', label:'Região', type:'single', density:'buttons',
        options:ORTO.regioes.map(r => ({ value:r.id, label:r.label })) },
    ]},
    { id:'patologia', title:'Patologia', navLabel:'P', fields: patCards },
    { id:'quadro', title:'Quadro clínico', navLabel:'Q', fields: [
      { id:'lado', label:'Lado', type:'single',
        options:[{value:'dto',label:'Direito'},{value:'esq',label:'Esquerdo'},{value:'bilat',label:'Bilateral'}],
        showIf: s => { const p = ORTO.pat(s); return !!p && p.lado; } },
      { id:'evol', label:'Tempo de evolução', type:'onset', showIf: s => !!ORTO.patId(s) },
    ].concat(quadro)},
    { id:'mcdt', title:'MCDT', navLabel:'M', fields: mcdt },
    { id:'trat', title:'Tratamento prévio', navLabel:'T', fields: trat.concat([
      // só aparece com ≥1 tratamento efetuado selecionado (sem tratamento, a duração é "nenhum" implícito)
      { id:'tratdur', label:'Duração do tratamento conservador', type:'single', ordinal:true,
        showIf: s => { const p = ORTO.pat(s); return !!p && p.normalGate === 'padrao'
          && (!p.tratamento.length || (s['trat_' + p.id] || []).length > 0); },
        options:[{value:'lt3',label:'< 3 meses'},{value:'m3_6',label:'3–6 meses'},{value:'ge6',label:'≥ 6 meses'}] },
      { id:'crit_normal', label:'Critérios para referenciação NORMAL', type:'multi', showIf:needTratDur,
        options:[{value:'avd',label:'Queixas limitativas para as AVDs'},
                 {value:'motivado',label:'Doente aceita e está motivado para tratamento cirúrgico'}] },
    ])},
  ];
};

root.ORTO = ORTO;
if (typeof module !== 'undefined' && module.exports) module.exports = ORTO;
})(typeof window !== 'undefined' ? window : globalThis);
