import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// UERJ - 2º Exame de Qualificação, Vestibular Estadual 2025 (aplicado em 08/09/2024).
// Extraídas do caderno de prova + gabarito retificado fornecidos pela coordenação.
// Só foram incluídas questões cujo enunciado e alternativas são inteiramente textuais
// (sem depender de gráfico/mapa/foto que não é possível reproduzir no banco de questões).
const questoes = [
  {
    materia: "Física",
    enunciado:
      `Texto Base. "A palavra \'linear\' descreve uma relação especial entre duas variáveis (...) Para converter de Celsius para Fahrenheit, você precisa multiplicar a temperatura em Celsius por 1,8 e adicionar 32." Na cidade do Rio de Janeiro, a população já experimentou sensação térmica de 55 °C. Com base nessa fórmula, essa mesma temperatura, em graus Fahrenheit, corresponde a:`,
    opcaoA: "131",
    opcaoB: "158",
    opcaoC: "212",
    opcaoD: "273",
    respostaCorreta: "A",
  },
  {
    materia: "História",
    enunciado:
      'A divisão da História (como conhecimento sobre experiências de sociedades e povos) em Pré-história, Idade Antiga, Idade Média, Idade Moderna e Idade Contemporânea está representada de maneira linear, ratificando a ideia do texto base de que "estamos tão familiarizados com o conceito de linearidade que impomos nossa referência de visão linear sobre o que observamos no mundo real". Essa divisão da História é derivada da seguinte concepção:',
    opcaoA: "antropocêntrica",
    opcaoB: "eurocêntrica",
    opcaoC: "materialista",
    opcaoD: "naturalista",
    respostaCorreta: "B",
  },
  {
    materia: "Português",
    enunciado:
      '"E parece que a melhor explicação para a nossa dependência excessiva da linearidade vem da sala de aula. Pesquisas mostram que nossa propensão para assumir a linearidade surge muito antes de deixarmos a escola." Com o emprego do verbo "parecer", na primeira frase do trecho, o autor faz uso de modalização. Nesse caso, a modalização produz o efeito de:',
    opcaoA: "expor uma opinião contrária",
    opcaoB: "recusar um indício duvidoso",
    opcaoC: "apresentar um saber coletivo",
    opcaoD: "evitar uma afirmação categórica",
    respostaCorreta: "D",
  },
  {
    materia: "Biologia",
    enunciado:
      "Um exemplo de processo que não obedece a relações lineares simples é observado na fermentação alcoólica. Na ausência de oxigênio, as leveduras envolvidas nesse processo, durante uma fase denominada log, crescem exponencialmente, sofrendo reações químicas catabólicas. Nessa fase, tais reações ocorrem no seguinte componente das células de leveduras:",
    opcaoA: "núcleo",
    opcaoB: "lisossoma",
    opcaoC: "citoplasma",
    opcaoD: "mitocôndria",
    respostaCorreta: "C",
  },
  {
    materia: "Matemática",
    enunciado:
      "Em 2024, o governo brasileiro limitou os juros do cartão de crédito, cobrados quando não se paga o valor integral de uma fatura, a no máximo 100% de juros sobre a dívida. A tabela mostra os fatores F que, aplicados à dívida de um cartão de crédito, determinam o valor da dívida total até o mês M: M=1→F=1,15; M=2→F=1,32; M=3→F=1,52; M=4→F=1,75; M=5→F=2,01; M=6→F=2,31; M=7→F=2,66; M=8→F=3,06; M=9→F=3,52; M=10→F=4,05; M=11→F=4,65; M=12→F=5,35. Com base na tabela, o mês M em que a dívida desse cartão atinge juros de 100% é:",
    opcaoA: "8",
    opcaoB: "7",
    opcaoC: "6",
    opcaoD: "5",
    respostaCorreta: "D",
  },
  {
    materia: "Português",
    enunciado:
      '"Vivemos em um mundo não linear, mas estamos tão acostumados a pensar em linhas retas que muitas vezes nem percebemos." Ao longo dos parágrafos do texto base, o autor analisa vários eventos não lineares, para, na conclusão, apresentar sua tese central, citada acima. Esse modo de encaminhar a argumentação é denominado:',
    opcaoA: "alusivo",
    opcaoB: "indutivo",
    opcaoC: "dialético",
    opcaoD: "dedutivo",
    respostaCorreta: "B",
  },
  {
    materia: "Geografia",
    enunciado:
      "A França possui um sistema ferroviário com cerca de 30.000 quilômetros de extensão, dos quais aproximadamente 2.700 quilômetros são linhas de alta velocidade. As distâncias, em linha reta, entre Paris e as cidades de Bordeaux e Toulouse são de 500 e 590 quilômetros, respectivamente, mas o tempo de viagem de trem entre elas e a capital francesa não segue essa proporção — o pensamento linear é inadequado para calcular esse tempo. Uma característica das duas cidades que explica essa inadequação é:",
    opcaoA: "posição relativa na rede técnica",
    opcaoB: "relevância política na escala nacional",
    opcaoC: "localização absoluta na topografia plana",
    opcaoD: "importância industrial na hierarquia urbana",
    respostaCorreta: "A",
  },
  {
    materia: "Português",
    enunciado:
      'Capítulo I de Quincas Borba, de Machado de Assis: "Rubião fitava a enseada – eram oito horas da manhã. (...) Cotejava o passado com o presente. Que era, há um ano? Professor. Que é agora? Capitalista. Olha para si, para as chinelas (...), para a casa, para o jardim, para a enseada, para os morros e para o céu; e tudo, desde as chinelas até o céu, tudo entra na mesma sensação de propriedade." No primeiro parágrafo do romance, o personagem manifesta uma percepção do mundo que revela uma postura de:',
    opcaoA: "idealização da vida urbana",
    opcaoB: "interesse pelo convívio íntimo",
    opcaoC: "busca de respeito profissional",
    opcaoD: "fascínio pela ostentação pessoal",
    respostaCorreta: "D",
  },
  {
    materia: "Português",
    enunciado:
      "Em Quincas Borba, os personagens se movimentam no contexto de emergência do capitalismo no Brasil. Em relação a esse contexto, o protagonista Rubião (ex-professor que se torna capitalista) pode ser melhor identificado pela seguinte figura de linguagem:",
    opcaoA: "antítese",
    opcaoB: "hipérbole",
    opcaoC: "eufemismo",
    opcaoD: "metonímia",
    respostaCorreta: "D",
  },
  {
    materia: "Português",
    enunciado:
      'Capítulo VI de Quincas Borba: "– (...) Ao vencido, ódio ou compaixão; ao vencedor, as batatas. (...) Não há exterminado. Desaparece o fenômeno; a substância é a mesma. (...) Os indivíduos são essas bolhas transitórias. (...) esse suposto mal é um benefício, não só porque elimina os organismos fracos, incapazes de resistência, como porque dá lugar à observação, à descoberta da droga curativa." O trecho sustenta a filosofia do Humanitismo, defendida por Quincas Borba, que faz caricatura dos princípios deterministas do século XIX. Com base nessa filosofia, os indivíduos podem se sentir autorizados à seguinte prática:',
    opcaoA: "valorizar o luxo",
    opcaoB: "neutralizar o vício",
    opcaoC: "defender a guerra",
    opcaoD: "pregar a tolerância",
    respostaCorreta: "C",
  },
  {
    materia: "Português",
    enunciado:
      'Capítulo XI de Quincas Borba: "Faleceu ontem o Sr. Joaquim Borba dos Santos, tendo suportado a moléstia com singular filosofia. Era homem de muito saber, e cansava-se em batalhar contra esse pessimismo amarelo e enfezado (...). A última palavra dele foi que a dor era uma ilusão (...)." A expressão "suportar com filosofia" denota o seguinte sentimento:',
    opcaoA: "espanto",
    opcaoB: "aceitação",
    opcaoC: "animosidade",
    opcaoD: "constrangimento",
    respostaCorreta: "B",
  },
  {
    materia: "Português",
    enunciado:
      'Capítulo XXXV de Quincas Borba: "Ia muita vez ao teatro sem gostar dele, e a bailes, em que se divertia um pouco – mas ia menos por si que para aparecer com os olhos da mulher, os olhos e os seios. Tinha essa vaidade singular; decotava a mulher sempre que podia (...), para mostrar aos outros as suas venturas particulares." O trecho se refere à relação entre Cristiano Palha e sua esposa, Sofia Palha. A necessidade do marido de "mostrar aos outros as suas venturas particulares" configura-se como uma contradição, que se forma porque:',
    opcaoA: "a vontade da esposa é reprimida",
    opcaoB: "a intimidade do casal é exposta",
    opcaoC: "a intenção do marido sobressai",
    opcaoD: "o amor da relação desaparece",
    respostaCorreta: "B",
  },
  {
    materia: "Português",
    enunciado:
      'Capítulo XLVII de Quincas Borba: descreve a execução de um escravizado na forca, conduzida por outro homem negro, encarregado de puxar a corda. "Um deles, mediano, magro, tinha as mãos atadas (...) e levava uma corda enlaçada no pescoço; as pontas do baraço iam nas mãos de outro preto. (...) Eis o réu que sobe à forca. (...) O carrasco pôs mãos à obra." Machado de Assis denuncia a violência da sociedade escravagista; na cena, um elemento que ressalta essa violência é uma diferença existente entre os dois homens negros. O que permite a ação do outro preto mencionado no texto (o carrasco) é a sua:',
    opcaoA: "função",
    opcaoB: "origem",
    opcaoC: "instrução",
    opcaoD: "personalidade",
    respostaCorreta: "A",
  },
  {
    materia: "Português",
    enunciado:
      'Capítulo LV de Quincas Borba: sobre a reação de Cristiano Palha à decisão de Rubião de voltar para Minas, o narrador refere-se à alma de Palha como "uma colcha de retalhos", misturando desapontamento, pesar da separação e cólera. Com base na trajetória de Cristiano Palha, essa descrição enfatiza que o perfil desse personagem se constitui a partir de:',
    opcaoA: "emoções sustentadas pelo impulso",
    opcaoB: "atitudes pautadas pelo oportunismo",
    opcaoC: "posicionamentos articulados pelo idealismo",
    opcaoD: "princípios estabelecidos pelo conhecimento",
    respostaCorreta: "B",
  },
  {
    materia: "Português",
    enunciado:
      'O narrador de Quincas Borba, em diversos momentos, explicita que está escrevendo uma obra de ficção, processo literário chamado metaficção. Uma passagem que evidencia esse processo é: "É de saber que tinham decorrido oito meses desde o princípio do capítulo anterior, e muita coisa estava mudada." — comparada a outras passagens que apenas narram ações das personagens. A alternativa que apresenta a metaficção é:',
    opcaoA:
      "É de saber que tinham decorrido oito meses desde o princípio do capítulo anterior, e muita coisa estava mudada.",
    opcaoB:
      "Rubião estremeceu; a suposição de que naquele Quincas Borba podia estar a alma do outro nunca se lhe varreu inteiramente do cérebro.",
    opcaoC: "Atrás dos motivos de recusa, vieram outros contrários. E se o negócio rendesse?",
    opcaoD:
      "Não se admirava de nada. Se um dia acordasse imperador, só se admiraria da demora do Ministério em vir cumprimentá-lo.",
    respostaCorreta: "A",
  },
  {
    materia: "Português",
    enunciado:
      `Capítulo CXLII de Quincas Borba: "A expressão 'Conversar com os seus botões', parecendo simples metáfora, é frase de sentido real e direto. Os botões operam sincronicamente conosco; formam uma espécie de senado, cômodo e barato, que vota sempre as nossas moções." "Conversar com os seus botões" é uma metáfora gasta, um clichê. No trecho, essa metáfora é revitalizada pois passa por um processo de:`,
    opcaoA: "ampliação",
    opcaoB: "oposição",
    opcaoC: "restrição",
    opcaoD: "injunção",
    respostaCorreta: "A",
  },
  {
    materia: "Português",
    enunciado:
      'Capítulo CXLVIII de Quincas Borba: "Uma só pessoa, o Dr. Camacho (...), ponderou que era de bom aviso não alterar o rosto, verdadeiro espelho da alma, cuja firmeza e constância devia reproduzir." Com esse comentário, o narrador sintetiza um conflito presente em todo o romance. Esse conflito se estabelece entre os seguintes aspectos:',
    opcaoA: "ordem e desordem",
    opcaoB: "essência e aparência",
    opcaoC: "juventude e maturidade",
    opcaoD: "individualismo e solidariedade",
    respostaCorreta: "B",
  },
  {
    materia: "Português",
    enunciado:
      'Capítulo CLV de Quincas Borba: "Espalhou-se a nova mania de Rubião. Alguns (...) encaminhavam a conversação para os negócios de França e do imperador. Rubião resvalava ao abismo, e convencia-os." O narrador, em vários capítulos, emprega a metáfora do abismo, antecipando o seguinte problema sofrido por Rubião (que passa a se imaginar Napoleão III):',
    opcaoA: "falência",
    opcaoB: "loucura",
    opcaoC: "solidão",
    opcaoD: "traição",
    respostaCorreta: "B",
  },
  {
    materia: "Português",
    enunciado:
      'D. Fernanda é a única personagem de Quincas Borba dotada de "simpatia universal", atuando como elemento de contraste em relação às demais personagens do romance, marcadas por egoísmo e interesse próprio. Uma passagem que ilustra esse contraste está transcrita em: "D. Fernanda levou o marido para um gabinete, e, à força de beijos, consolou-o daquele golpe. Ao almoço, já ele sorria, ainda que de um sorriso pálido" — comparada a passagens que apenas descrevem outras personagens agindo por interesse. A alternativa que ilustra o contraste generoso de D. Fernanda é:',
    opcaoA:
      "D. Fernanda levou o marido para um gabinete, e, à força de beijos, consolou-o daquele golpe. Ao almoço, já ele sorria, ainda que de um sorriso pálido;",
    opcaoB:
      "No domingo seguinte, D. Fernanda foi à igreja de Santo Antônio dos Pobres. Acabada a missa, viu surgir (...) o primo, ereto, risonho, gravemente trajado, estendendo-lhe a mão.",
    opcaoC:
      "A compaixão de D. Fernanda tinha-a impressionado muito; achou-lhe um quê distinto e nobre, e advertiu que (...) era de bom tom não ser menos generosa.",
    opcaoD:
      "Quincas Borba acudiu ao chamado, não pulando, nem alegre. D. Fernanda inclinou-se, perguntou-lhe pelo amigo, se estava longe, se queria ir vê-lo.",
    respostaCorreta: "A",
  },
  {
    materia: "Português",
    enunciado:
      'Em Quincas Borba, o narrador apresenta, em dois momentos (Capítulos XLI e XCVII), a perspectiva de Rubião acerca da constelação do Cruzeiro do Sul, associada à esperança de reencontro com Sofia: "todas as noites, às dez horas, fitasse o Cruzeiro, ele o fitaria também, e os pensamentos de ambos iriam achar-se ali juntos" — o que nunca se realiza, pois Sofia não corresponde. Já no Capítulo CCI, o narrador comenta com distanciamento irônico que o Cruzeiro "está assaz alto para não discernir os risos e as lágrimas dos homens". A perspectiva de Rubião e a do narrador podem ser caracterizadas, respectivamente, como:',
    opcaoA: "flexível – rígida",
    opcaoB: "crédula – cética",
    opcaoC: "individual – social",
    opcaoD: "ousada – conformista",
    respostaCorreta: "B",
  },
  {
    materia: "Português",
    enunciado:
      '"A realidade é boa, o realismo é que não presta para nada." Essa declaração foi publicada por Machado de Assis num artigo de jornal. A frase do narrador de Quincas Borba que melhor se associa a essa declaração é:',
    opcaoA: "A imaginação não podia mais, e a realidade próxima atraiu-lhe a vista.",
    opcaoB: "Já é muito concertar farrapos de realidade.",
    opcaoC: "Rubião, na rua, voltou a cabeça para todos os lados, a realidade apossava-se dele e o delírio esvaía-se.",
    opcaoD:
      "Rubião precisava de um pedaço de corda que o atasse à realidade, porque o espírito sentia-se outra vez presa da vertigem.",
    respostaCorreta: "B",
  },
  {
    materia: "Espanhol",
    enunciado:
      'Texto "La juventud de hoy": "Los jóvenes de hoy son un desastre. Siempre han sido un desastre. (...) decían en Grecia hace 2500 años. (...) Cada generación acentúa unos defectos." De acuerdo con el texto, las críticas a los jóvenes son una práctica frecuente a lo largo del tiempo. El fragmento que confirma la recurrencia de esa práctica es:',
    opcaoA: "Cada generación acentúa unos defectos. (l. 5-6)",
    opcaoB: "usan un léxico pobre y no saben redactar. (l. 7-8)",
    opcaoC: "La cuestión es que no están a nuestra altura. (l. 10)",
    opcaoD: "se van de casa, de media, a los treinta años. (l. 25)",
    respostaCorreta: "A",
  },
  {
    materia: "Espanhol",
    enunciado:
      '"Los jóvenes de hoy son un desastre." (l. 1) La forma verbal subrayada ("son") emplea un sentido de:',
    opcaoA: "hecho en proyección",
    opcaoB: "perspectiva histórica",
    opcaoC: "acción en desarrollo",
    opcaoD: "verdad universal",
    respostaCorreta: "D",
  },
  {
    materia: "Espanhol",
    enunciado:
      '"En la Inglaterra del siglo XVII criticaban su dura agresividad; nosotros, su blanda hipersensibilidad." (l. 8-9) En el fragmento se utiliza la siguiente figura de lenguaje:',
    opcaoA: "ironía",
    opcaoB: "antítesis",
    opcaoC: "metáfora",
    opcaoD: "hipérbole",
    respostaCorreta: "B",
  },
  {
    materia: "Espanhol",
    enunciado:
      '"Y, sobre todo, cotejamos a la juventud real de hoy con un ser ficticio: la persona que creemos que fuimos." (l. 19-20) El uso de los dos puntos en la frase destacada tiene la función de introducir una:',
    opcaoA: "enumeración",
    opcaoB: "contestación",
    opcaoC: "explicación",
    opcaoD: "citación",
    respostaCorreta: "C",
  },
  {
    materia: "Espanhol",
    enunciado:
      "Según el último párrafo del texto (que menciona precariedad, dificultad para acceder a una vivienda y menor poder político de los jóvenes), las dificultades enfrentadas por los jóvenes de hoy pueden justificarse por el siguiente factor:",
    opcaoA: "inmadurez emocional",
    opcaoB: "conflictos interpersonales",
    opcaoC: "condiciones socioeconómicas",
    opcaoD: "irresponsabilidad comportamental",
    respostaCorreta: "C",
  },
  {
    materia: "Francês",
    enunciado:
      `Texte "Ces idées reçues qui nous trompent": "Halte là! S\'exclame l\'un des convives. Il ne faut jamais mettre d\'huile dans l\'eau des pâtes! Difficile d\'y croire, au premier abord. (l. 3)" D\'après le texte, ce fragment exprime une réaction face à l\'attitude suivante:`,
    opcaoA: "la validation d'une idée reçue",
    opcaoB: "le jugement basé sur une intuition",
    opcaoC: "la persistance d'une norme établie",
    opcaoD: "le soupçon lancé sur une habitude",
    respostaCorreta: "D",
  },
  {
    materia: "Francês",
    enunciado:
      `"Comment remettre en question ce qui nous a été inculqué depuis la petite enfance?" (l. 4) L\'expression soulignée ("remettre en question") peut être remplacée, sans changement important de sens, par:`,
    opcaoA: "réclamer",
    opcaoB: "présumer",
    opcaoC: "douter de",
    opcaoD: "profiter de",
    respostaCorreta: "C",
  },
  {
    materia: "Francês",
    enunciado:
      "Entre les énoncés connectés par l'expression \"Et pourtant\" (l. 7) — sur l'huile qui n'est pas miscible dans l'eau —, on identifie un rapport de:",
    opcaoA: "opposition",
    opcaoB: "conclusion",
    opcaoC: "explication",
    opcaoD: "comparaison",
    respostaCorreta: "A",
  },
  {
    materia: "Francês",
    enunciado:
      `"la répétition fait foi" (l. 15) Le passage du texte qui reprend l\'idée contenue dans ce fragment est:`,
    opcaoA:
      "En moins de temps qu'il ne faut pour le dire, ce que l'on tenait pour une certitude devient une hérésie. (l. 8-9)",
    opcaoB: "Les convictions bien ancrées qui se révèlent un beau jour erronées sont légion. (l. 12-13)",
    opcaoC: "si tout le monde en est persuadé, c'est donc nécessairement que c'est vrai. (l. 18-19)",
    opcaoD:
      "les contenus qu'il engendre sont conçus à partir d'une recension des articles glanés sur le Web. (l. 24-25)",
    respostaCorreta: "C",
  },
  {
    materia: "Francês",
    enunciado:
      "Dans les cinquième et sixième paragraphes du texte, le narrateur exprime son avis sur le Web (annonçant que 90% du contenu en ligne d'ici 2026 sera produit par des IA). En tenant compte de cet avis, la dernière phrase du texte (\"Si c'est l'intelligence artificielle qui le dit…\", l. 31) acquiert un ton de:",
    opcaoA: "enthousiasme",
    opcaoB: "plaisanterie",
    opcaoC: "connivence",
    opcaoD: "satisfaction",
    respostaCorreta: "B",
  },
  {
    materia: "Inglês",
    enunciado:
      'Text "The dangers of preconceived judgement: look beyond stereotypes" (title). The title of the text recommends a way of behaving in relation to stereotypes. An example of such recommendation is clearly expressed in:',
    opcaoA: "We are all guilty of making snap judgements about others (l. 1-2)",
    opcaoB: "It refers to the action of making lightning-fast judgements (l. 8)",
    opcaoC: "As amusing as it may seem, such judgements can have real-life consequences. (l. 11-12)",
    opcaoD: "We should strive to give people a fair chance before passing judgement. (l. 21)",
    respostaCorreta: "D",
  },
  {
    materia: "Inglês",
    enunciado:
      `"But have you ever wondered why it\'s important not to judge someone before getting to know them? Do you ever consider that?" (l. 3-4) The verb forms underlined above express different ideas due to their tenses. These ideas are, respectively:`,
    opcaoA: "repetition before the present – result in the present",
    opcaoB: "result in the present – experience up to the present",
    opcaoC: "experience up to the present – behaviour in the present",
    opcaoD: "behaviour in the present – repetition before the present",
    respostaCorreta: "C",
  },
  {
    materia: "Inglês",
    enunciado: 'In line 8, the term "thin slice" (judgement) refers to judgement that is characterized as:',
    opcaoA: "uncommon",
    opcaoB: "impulsive",
    opcaoC: "impartial",
    opcaoD: "unclear",
    respostaCorreta: "B",
  },
  {
    materia: "Inglês",
    enunciado: 'The expression from the text that means "imagine oneself in somebody else\'s situation" is:',
    opcaoA: "judge a book by its cover (l. 1)",
    opcaoB: "see the true beauty in diversity. (l. 14)",
    opcaoC: "put yourself in their shoes (l. 18-19)",
    opcaoD: "think outside the box. (l. 28)",
    respostaCorreta: "C",
  },
  {
    materia: "Inglês",
    enunciado:
      "In the last paragraph, the author offers suggestions so that severe criticism can be avoided. One of these suggestions is:",
    opcaoA: "question preconceptions",
    opcaoB: "broaden possibilities",
    opcaoC: "reveal imperfections",
    opcaoD: "discover insecurities",
    respostaCorreta: "A",
  },
  {
    materia: "Matemática",
    enunciado:
      "Considere o triângulo retângulo ABC, em que BC é perpendicular a AC (ângulo reto em C), AD é a bissetriz do ângulo CAB, o ângulo ABC é igual a 30° e BD mede 20 cm (D é um ponto sobre BC). A razão AC/DC é igual a:",
    opcaoA: "√3",
    opcaoB: "√2",
    opcaoC: "√3/2",
    opcaoD: "√2/2",
    respostaCorreta: "A",
  },
  {
    materia: "Matemática",
    enunciado:
      "Um professor de educação física realiza regularmente a medição da altura de seus alunos. Na turma A, que tem 25 alunos, quando um aluno saiu e outro entrou, o professor fez nova medição. Ao final, observou que: a altura dos alunos que não saíram não mudou; a altura do aluno que entrou era 1,82 m; a nova média das alturas dos alunos aumentou em 1 cm. A altura, em metros, do aluno que saiu dessa turma é:",
    opcaoA: "1,72",
    opcaoB: "1,67",
    opcaoC: "1,62",
    opcaoD: "1,57",
    respostaCorreta: "D",
  },
  {
    materia: "Matemática",
    enunciado:
      "Uma pessoa tem no bolso, exatamente, sete notas de valores diferentes: 2, 5, 10, 20, 50, 100 e 200 reais. Essa pessoa retira do bolso, ao acaso, apenas três dessas notas. O número total de retiradas diferentes em que as três notas somam valor maior que 50 reais é igual a:",
    opcaoA: "29",
    opcaoB: "30",
    opcaoC: "31",
    opcaoD: "32",
    respostaCorreta: "C",
  },
  {
    materia: "Matemática",
    enunciado:
      "No pião representado por VAB, seção meridiana de um cone circular reto, a geratriz do cone mede 12 cm (VA = VB = 12 cm) e AB é o diâmetro da base do cone. Ao ser lançado, esse pião cai sobre o plano horizontal e rola, sem deslizar, com a sua geratriz apoiada nesse plano. O pião dá apenas uma volta completa em torno do seu eixo, descrevendo o setor circular AVP de centro V e ângulo central de 120°. A medida do diâmetro AB, em centímetros, é igual a:",
    opcaoA: "6",
    opcaoB: "8",
    opcaoC: "10",
    opcaoD: "12",
    respostaCorreta: "B",
  },
  {
    materia: "Biologia",
    enunciado:
      "Vários parasitas heteróxenos obrigatórios, para completar seu ciclo de vida, se associam a vetores artrópodes que se alimentam de sangue humano. Uma vantagem decorrente desse tipo de associação é:",
    opcaoA: "transmissão por ovos",
    opcaoB: "encontro entre hospedeiros",
    opcaoC: "formação de cistos teciduais",
    opcaoD: "hipertrofia de órgãos reprodutores",
    respostaCorreta: "B",
  },
  {
    materia: "Física",
    enunciado:
      "Durante um treino, quatro posições ocupadas pelos corredores A e B, deslocando-se em movimento uniforme, foram verificadas em intervalos sucessivos de 10 segundos: Corredor A: 0 m, 30 m, 60 m, 90 m. Corredor B: 0 m, 40 m, 80 m, 120 m. Após 60 segundos do início do treino, a distância, em metros, entre os corredores é igual a:",
    opcaoA: "30",
    opcaoB: "60",
    opcaoC: "90",
    opcaoD: "120",
    respostaCorreta: "B",
  },
  {
    materia: "Química",
    enunciado:
      "A tri-iodotironina e a tiroxina são hormônios produzidos pela tireoide, conhecidos, respectivamente, como T3 e T4, em função do número de átomos de iodo presentes em cada molécula (T3 tem 3 átomos de iodo, T4 tem 4 átomos de iodo, sendo os demais átomos da estrutura idênticos exceto pela posição do quarto iodo, ocupada por um hidrogênio em T3). Em relação ao T4, o hormônio T3 apresenta maior número de átomos do seguinte elemento químico:",
    opcaoA: "hidrogênio",
    opcaoB: "nitrogênio",
    opcaoC: "oxigênio",
    opcaoD: "carbono",
    respostaCorreta: "A",
  },
  {
    materia: "Física",
    enunciado:
      "Para determinar a potência dissipada por um equipamento industrial, verificou-se a relação entre a corrente elétrica i, em ampères, e a tensão U, em volts, aferidas no circuito: para i=1A, U=5V; i=2A, U=10V; i=3A, U=15V; i=4A, U=20V (relação linear U=5i). O valor da tensão x, correspondente à corrente de 5 A, não foi registrado. Nesse circuito, quando i = 5 A, a potência instantânea dissipada pelo equipamento, em watts, é igual a:",
    opcaoA: "125",
    opcaoB: "150",
    opcaoC: "175",
    opcaoD: "200",
    respostaCorreta: "A",
  },
  {
    materia: "Química",
    enunciado:
      "O mineral apatita, utilizado como matéria-prima na produção de fertilizantes, contém diferentes sais de cálcio, dentre eles o Ca3(PO4)2. Nesse sal, o ânion presente é denominado:",
    opcaoA: "hipofosfato",
    opcaoB: "hipofosfito",
    opcaoC: "fosfito",
    opcaoD: "fosfato",
    respostaCorreta: "D",
  },
  {
    materia: "Química",
    enunciado:
      "As duas bombas atômicas lançadas pelos Estados Unidos em 1945 (retratadas no filme Oppenheimer) apresentavam como material físsil os átomos urânio-235 (Z=92) e plutônio-239 (Z=94). Comparando os núcleos desses dois átomos, a maior quantidade de nêutrons observada corresponde a:",
    opcaoA: "150",
    opcaoB: "146",
    opcaoC: "145",
    opcaoD: "143",
    respostaCorreta: "C",
  },
  {
    materia: "Biologia",
    enunciado:
      "Anelídeos oligoquetos se locomovem por meio de movimentos peristálticos, no interior de túneis por eles construídos. Para que esse tipo de locomoção ocorra, é fundamental a seguinte característica morfológica:",
    opcaoA: "patas articuladas",
    opcaoB: "líquido celomático",
    opcaoC: "canais ambulacrários",
    opcaoD: "exoesqueleto calcário",
    respostaCorreta: "B",
  },
  {
    materia: "Química",
    enunciado:
      "O CO2 produzido na respiração atua no equilíbrio do pH do sangue, conforme a equação: CO2(aq) + H2O(l) ⇌ H+(aq) + HCO3-(aq). Em um estudo, foi analisada a alteração que quatro fármacos (W, X, Y, Z) podem produzir sobre esse equilíbrio, verificando o pH do sangue após a administração de cada um: W→pH 3; X→pH 5; Y→pH 7; Z→pH 9. A concentração de íons HCO3- no equilíbrio é aumentada quando o seguinte fármaco entra em contato com o sangue:",
    opcaoA: "W",
    opcaoB: "X",
    opcaoC: "Y",
    opcaoD: "Z",
    respostaCorreta: "D",
  },
  {
    materia: "Física",
    enunciado:
      "Para variar em 60 °C a temperatura de m quilogramas de água, foi utilizada toda a energia produzida pela queima de 100 g de etanol. Considere: poder calorífico do etanol igual a 30,00 kJ/g; calor específico da água igual a 4,20 J/g°C. O valor de m, em quilogramas, é aproximadamente igual a:",
    opcaoA: "36",
    opcaoB: "24",
    opcaoC: "18",
    opcaoD: "12",
    respostaCorreta: "D",
  },
  {
    materia: "Biologia",
    enunciado:
      "Admita que determinada doença hereditária autossômica pode apresentar duas formas distintas: uma causada pelo gene dominante A e outra causada pelo gene recessivo b, estando cada gene localizado em cromossomos distintos. Sendo um casal duplamente heterozigoto (AaBb x AaBb) para esses dois genes, a probabilidade de seus filhos apresentarem as duas formas da doença corresponde a:",
    opcaoA: "16,25%",
    opcaoB: "17,25%",
    opcaoC: "18,75%",
    opcaoD: "19,75%",
    respostaCorreta: "C",
  },
  {
    materia: "História",
    enunciado:
      "Um levantamento sobre o nível de satisfação individual com a vida na Alemanha (2016) mostra índices mais baixos (inferiores a 7,0, em escala de 0 a 10) concentrados em estados como Mecklenburg-Vorpommern, Sachsen-Anhalt, Berlin, Thüringen, Sachsen e Brandenburg — todos ligados ao território da antiga Alemanha Oriental. A localização espacial dos estados alemães com índice de satisfação com a vida inferior a 7,0 é explicada, principalmente, pelos processos socioeconômicos ocorridos no país no período de:",
    opcaoA: "1918-1933",
    opcaoB: "1933-1949",
    opcaoC: "1949-1990",
    opcaoD: "1990-2020",
    respostaCorreta: "C",
  },
  {
    materia: "História",
    enunciado:
      'Trecho de Quincas Borba: "O criado esperava teso e sério. Era espanhol; e não foi sem resistência que Rubião o aceitou das mãos de Cristiano; por mais que lhe dissesse que estava acostumado aos seus crioulos de Minas, e não queria línguas estrangeiras em casa, o amigo Palha insistiu, demonstrando-lhe a necessidade de ter criados brancos. Rubião cedeu com pena." O romance, publicado em 1891, tem como cenário o Rio de Janeiro na segunda metade do século XIX. A passagem indica, por parte de Rubião, o apego ao seguinte aspecto do contexto da época:',
    opcaoA: "valorização do progresso",
    opcaoB: "trabalho de escravizados",
    opcaoC: "modernização de hábitos",
    opcaoD: "defesa do republicanismo",
    respostaCorreta: "B",
  },
  {
    materia: "Sociologia",
    enunciado:
      'Uma charge de Caco Galhardo (Folha de S. Paulo, 2024) apresenta fósseis de "A antiga civilização do tempo desperdiçado", legendados com a piada de que, "pela posição dos fósseis, trata-se de um grupo que morreu procurando um bom filme nos canais de streaming". O artista faz uma crítica a comportamentos sociais de diversas sociedades contemporâneas, apresentando relações entre passado e futuro. De acordo com a charge, a condição que impacta diretamente no comportamento social contemporâneo é:',
    opcaoA: "demanda política de propaganda",
    opcaoB: "hierarquização classista de mercado",
    opcaoC: "tecnologia digital de entretenimento",
    opcaoD: "imposição cultural de empregabilidade",
    respostaCorreta: "C",
  },
  {
    materia: "Sociologia",
    enunciado:
      'Reportagem sobre o futebol chinês: "Com 1,4 bilhão de habitantes, não dá para juntar 11 atletas num time competitivo? (...) O sistema centrado na obediência não ajuda a gestar criatividade. (...) a reverência à hierarquia afetava tomadas de decisão desde o roupeiro até seus companheiros em campo, avessos a qualquer ação fora do roteiro." De acordo com o autor, o fracasso dos chineses no futebol deve ser atribuído à seguinte característica presente naquela sociedade:',
    opcaoA: "autoritarismo político",
    opcaoB: "nacionalismo ufanista",
    opcaoC: "controle populacional",
    opcaoD: "sentimento xenofóbico",
    respostaCorreta: "A",
  },
  {
    materia: "Geografia",
    enunciado:
      "Nos últimos anos, os portos das regiões Norte e Nordeste (Arco Norte) passaram a responder por mais de 37% das exportações de soja e milho do Brasil, participação que mais do que duplicou em dez anos, superando cada vez mais o tradicional Arco Sul (Porto de Santos). Essa alteração logística na exportação de grãos no território brasileiro é explicada, principalmente, pelo seguinte processo socioespacial:",
    opcaoA: "utilização de modernas tecnologias de cultivo",
    opcaoB: "incorporação de novos espaços produtivos",
    opcaoC: "eliminação de antigas práticas predatórias",
    opcaoD: "recuperação de velhas ferrovias de carga",
    respostaCorreta: "B",
  },
  {
    materia: "Geografia",
    enunciado:
      "Após 83 anos, a cidade de Porto Alegre voltou a registrar uma grande enchente. Em 1941, o nível do Guaíba (cota de inundação de 3 metros) chegou a uma altura entre 4,75 e 4,76 metros. Em maio de 2024, o nível do Guaíba passou de 5,3 metros. Na atualidade, o agravamento desse tipo de problema na capital gaúcha está relacionado ao contexto de:",
    opcaoA: "intensificação da crise climática",
    opcaoB: "exploração de recursos minerais",
    opcaoC: "degradação do bioma do Pampa",
    opcaoD: "permeabilização do solo da cidade",
    respostaCorreta: "A",
  },
  {
    materia: "História",
    enunciado:
      "Uma fotografia de 1988 registra lideranças de várias etnias indígenas ocupando o auditório do PMDB durante as negociações do capítulo sobre os indígenas na Constituição Brasileira. A mobilização política de povos indígenas garantiu direitos para essas populações na Constituição promulgada naquele ano. A garantia do direito constitucional obtida naquele contexto representou a defesa da ideia de:",
    opcaoA: "estatização",
    opcaoB: "apropriação",
    opcaoC: "emancipação",
    opcaoD: "autodeterminação",
    respostaCorreta: "D",
  },
  {
    materia: "Geografia",
    enunciado:
      "Entre 2013 e 2023, vários Estados europeus tiveram aumento de sua população absoluta, apesar da baixa fecundidade característica do continente nas últimas décadas. Considerando a dinâmica populacional desse continente, essa variação está associada ao seguinte processo demográfico:",
    opcaoA: "saldo migratório positivo",
    opcaoB: "índice de fertilidade ascendente",
    opcaoC: "crescimento vegetativo negativo",
    opcaoD: "taxa de mortalidade descendente",
    respostaCorreta: "A",
  },
  {
    materia: "Filosofia",
    enunciado:
      'Na Conferência de Segurança sobre Inteligência Artificial (Reino Unido, novembro de 2023), representantes de vários países (incluindo EUA, China e UE) declararam conjuntamente que "a IA representa um potencial risco catastrófico para a humanidade" — enquanto, em uma charge sobre o evento, um representante de país participante pensa: "eu não posso esperar para desenvolvê-la primeiro". O autor da charge ironiza o resultado da conferência ao apontar uma possível contradição de alguns países participantes. Essa contradição envolve os seguintes fatores:',
    opcaoA: "direitos humanos – ordenamentos jurídicos",
    opcaoB: "acordos comerciais – práticas monopolistas",
    opcaoC: "desenvolvimento econômico – poderio militar",
    opcaoD: "posicionamento diplomático – interesse estratégico",
    respostaCorreta: "D",
  },
  {
    materia: "Geografia",
    enunciado:
      "Na Nova Holanda, comunidade do Complexo da Maré (Rio de Janeiro), terraços cobertos por alumínio e fibrocimento (mais baratos) aquecem mais que os de PVC durante dias de calor intenso. Um estudo revela que os que vivem em áreas carentes sofrem mais os efeitos do calor do que aqueles que moram em localidades consideradas mais nobres. A reportagem relata um fenômeno espacialmente diferenciado, que se deve a uma situação de:",
    opcaoA: "inversão térmica",
    opcaoB: "injustiça ambiental",
    opcaoC: "poluição atmosférica",
    opcaoD: "macrocefalia urbana",
    respostaCorreta: "B",
  },
  {
    materia: "História",
    enunciado:
      "A Estação Ferroviária Leopoldina, no Rio de Janeiro, inaugurada em 1926, simbolizou em outros tempos o que havia de mais charmoso no Brasil, unindo o centro do Rio a Petrópolis e a Três Rios. Em 2002, deixou de ser utilizada definitivamente para embarque de passageiros, que passaram a embarcar na estação Central do Brasil. As estações de trem representaram um modelo exitoso de investimento em meios de transporte até meados do século XX. A desativação da Estação Leopoldina, no início do século XXI, decorre do seguinte aspecto das transformações urbanas na cidade do Rio de Janeiro:",
    opcaoA: "crescimento de ações para a ocupação de periferias e favelas",
    opcaoB: "deslocamento de verbas para a circulação de automóveis e ônibus",
    opcaoC: "ordenamento de iniciativas para a geração de empregos e serviços",
    opcaoD: "aprimoramento de práticas para a integração de indústrias e finanças",
    respostaCorreta: "B",
  },
  {
    materia: "História",
    enunciado:
      'A canção "Back in Bahia", de Gilberto Gil, foi gravada originalmente em 1972, período em que o cantor vivia exilado em Londres, no momento mais repressivo dos governos militares vigentes no Brasil entre 1964 e 1984 ("Lá em Londres, vez em quando me sentia longe daqui (...) Tanta saudade preservada num velho baú de prata dentro de mim"). Considerando o contexto histórico de sua gravação, as duas principais ideias que explicam a referência à Bahia na canção são:',
    opcaoA: "exílio e reelaboração",
    opcaoB: "conformismo e negação",
    opcaoC: "passadismo e resignação",
    opcaoD: "ressentimento e projeção",
    respostaCorreta: "A",
  },
];

async function main() {
  let criadas = 0;
  for (const q of questoes) {
    await prisma.questaoBanco.create({
      data: { prova: "UERJ", ano: 2025, opcaoE: null, ...q },
    });
    criadas++;
    console.log(`[${criadas}/${questoes.length}] ${q.materia} — criada`);
  }
  console.log(`Concluído: ${criadas} questões inseridas.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
