import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const questoes = [
  // ENEM 2024, 1º dia, Caderno Azul
  {
    prova: "ENEM",
    materia: "Linguagens",
    ano: 2024,
    enunciado:
      "Pressão, depressão, estresse e crise de ansiedade. Os males da sociedade contemporânea também estão no esporte. A tenista Naomi Osaka, do Japão, jogadora mais bem paga do mundo e que já ocupou o número 2 do ranking, retirou-se do torneio de Roland Garros de 2021 porque não estava conseguindo administrar as crises de ansiedade provocadas pelos grandes eventos, por ser uma estrela aos 23 anos, e pelo peso de parte da imprensa. O tenista australiano Nick Kyrgios, de 25 anos, revelou sua “situação triste e solitária” enquanto lutava contra a depressão causada pelo ritmo avassalador do Circuito Mundial de Tênis. O jogador de basquete americano Kevin Love também tornou público seu quadro de ansiedade e depressão. O mundo do atleta é solitário e distante da família. O que vemos numa partida não reflete a rotina desgastante. A imprensa denomina atletas como heróis, como se aquele corpo fosse indestrutível, mas a mente é o ponto fraco da história.\n\nAs causas do desequilíbrio na saúde mental apontadas no texto estão relacionadas às",
    opcaoA: "nacionalidades diversificadas dos praticantes.",
    opcaoB: "modalidades esportivas distintas.",
    opcaoC: "faixas etárias aproximadas.",
    opcaoD: "representações heroicas dos atletas.",
    opcaoE: "pressões constantes dos eventos e da mídia.",
    respostaCorreta: "E",
  },
  {
    prova: "ENEM",
    materia: "Linguagens",
    ano: 2024,
    enunciado:
      "Já ouvi gente falando que o podcast é o renascimento do rádio. O rádio é genial, uma mídia imorredoura, mas podcast não tem nada a ver com ele. O formato está mais próximo do ensaio literário do que de um programa de ondas curtas, médias ou longas.\n\nPodcasts são antípodas das redes sociais. Enquanto elas são dispersivas, levam à evasão e à desinformação, os podcasts são uma possibilidade de imersão, concentração, aprendizado. Depois que eles surgiram, lavar a louça e me locomover pela cidade viraram um programaço. Um pós-almoço de domingo e aprendo tudo sobre bonobos e gorilas. Um táxi pro aeroporto e chego ao embarque PhD em reforma tributária.\n\nSegundo a argumentação construída nesse texto, o podcast",
    opcaoA: "provoca dispersão da atenção em seu público.",
    opcaoB: "funciona por meio de uma frequência de ondas curtas.",
    opcaoC: "propicia divulgação de conhecimento para seus usuários.",
    opcaoD: "tem um formato de interação semelhante ao das redes sociais.",
    opcaoE: "constitui uma evolução na transmissão de informações via rádio.",
    respostaCorreta: "C",
  },
  {
    prova: "ENEM",
    materia: "Linguagens",
    ano: 2024,
    enunciado:
      "A Língua da Tabatinga, falada na cidade de Bom Despacho, Minas Gerais, foi por muito tempo estigmatizada devido à sua origem e à própria classe social de seus falantes, pois, segundo uma pesquisadora, era falada por “meninos pobres vindos da Tabatinga ou de Cruz de Monte — ruas da periferia da cidade cujos habitantes sempre foram tidos por marginais”. Conhecida por antigos como a “língua dos engraxates”, a Língua da Tabatinga era utilizada por negros escravizados como uma espécie de “língua secreta”, um código para trocarem informações de como conseguir alimentos, ou para planejar fugas de seus senhores sem risco de serem descobertos por eles.\n\nDe acordo com um documento do Iphan (2011), os falantes da língua apresentam uma forte consciência de sua relação com a descendência africana e da importância de preservar a “fala que os identifica na região”. Essa mudança de compreensão tangencia aspectos de pertencimento, pois, à medida que o falante da Língua da Tabatinga se identifica com a origem afro-brasileira, ele passa a ver essa língua como um legado recebido e tem o cuidado de transmiti-la para outras gerações.\n\nA Língua da Tabatinga tem sido preservada porque o(a)",
    opcaoA: "seu registro passou da forma oral para a escrita.",
    opcaoB: "classe social de seus usuários ganhou prestígio.",
    opcaoC: "sua função inicial se manteve ao longo dos anos.",
    opcaoD: "sentimento de identidade linguística tem se consolidado.",
    opcaoE: "perfil etário de seus falantes tem se tornado homogêneo.",
    respostaCorreta: "D",
  },
  {
    prova: "ENEM",
    materia: "Linguagens",
    ano: 2024,
    enunciado:
      "A telemedicina, nos últimos anos, tem se destacado como uma ferramenta valiosa, proporcionando uma gama de benefícios que vão desde a ampliação do acesso à assistência médica até a otimização dos recursos de todo o ecossistema de saúde.\n\nContudo, é importante reconhecer que nem todas as pessoas estão igualmente preparadas para aproveitar plenamente os cuidados ofertados pela telemedicina. Um dos principais benefícios do atendimento de saúde a distância é a capacidade de superar barreiras geográficas, proporcionando acesso a serviços médicos, especialmente para pacientes que residem em áreas remotas e/ou carentes de certas especialidades médicas, os chamados “vazios assistenciais”. A equidade no acesso é uma questão crítica, uma vez que nem todos têm ao seu alcance dispositivos tecnológicos ou uma conexão à internet que seja confiável.\n\nAo tratar da telemedicina, esse texto ressalta que um dos benefícios dessa tecnologia para a sociedade é o fato de ela",
    opcaoA:
      "disponibilizar prontuário único do cidadão tanto na rede pública quanto na privada.",
    opcaoB: "oportunizar o acesso a atendimento médico a pacientes de áreas periféricas.",
    opcaoC: "fornecer dispositivos tecnológicos para a realização de exames.",
    opcaoD: "promover a interação entre diferentes especialidades médicas.",
    opcaoE: "garantir infraestrutura para o trabalho remoto de médicos.",
    respostaCorreta: "B",
  },
  {
    prova: "ENEM",
    materia: "Linguagens",
    ano: 2024,
    enunciado:
      "Por trás do universo “masculino” das lutas, é cada vez mais notório o aumento da participação de mulheres nessa prática corporal. Algumas situações reforçam esse fenômeno: a inclusão de mulheres em combates de artes marciais mistas, ou MMA, a transmissão televisiva de lutas de mulheres e a criação de horários específicos para elas em academias que ensinam lutas. Uma pesquisa científica mostrou menor participação e mobilização das meninas em comparação com os meninos nas aulas de Educação Física. Entre as justificativas discentes para essa situação está o fato de que eles relacionam a luta como uma expressão corporal masculina e, por consequência, não adequada aos interesses femininos.\n\nSegundo o texto, apesar do aumento da participação de mulheres em lutas, a realidade na escola ainda é diferente em razão do(a)",
    opcaoA: "esportivização desse conteúdo.",
    opcaoB: "masculinização dessa modalidade.",
    opcaoC: "enfoque desses eventos pela mídia.",
    opcaoD: "trato pedagógico dessa manifestação.",
    opcaoE: "marginalização desse tema pela Educação Física.",
    respostaCorreta: "B",
  },
  {
    prova: "ENEM",
    materia: "Ciências Humanas",
    ano: 2024,
    enunciado:
      "Um terremoto de magnitude 5,9 atingiu a cidade de Valparaíso, na costa chilena, a uma profundidade de 112 quilômetros.\n\nUm tremor de terra de magnitude 4,8 foi registrado no município de Atalaia do Norte, no interior do estado do Amazonas. Os eventos dessa região costumam ser resultado das atividades da placa de Nazca.\n\nMoradores usaram as redes sociais para relatar tremores de terra no interior de São Paulo, nas cidades de Júlio Mesquita e Guaimbê, com magnitude 3,0 na escala Richter, considerada pequena e sem previsão de danos.\n\nAs diferenças entre os eventos geológicos relatados decorrem de distintas posições geográficas das cidades em relação a:",
    opcaoA: "Planícies costeiras.",
    opcaoB: "Bacias continentais.",
    opcaoC: "Zonas de subducção.",
    opcaoD: "Áreas de denudação.",
    opcaoE: "Vertentes escarpadas.",
    respostaCorreta: "C",
  },
  {
    prova: "ENEM",
    materia: "Ciências Humanas",
    ano: 2024,
    enunciado:
      "O bispo Bartolomeu de Las Casas é o homem mais odiado da América, o anti-Cristo dos senhores, o açoite destas terras. Por sua culpa, o imperador promulgou novas leis que despojam de escravos índios os filhos dos conquistadores. Las Casas é o homem mais amado da América. Voz dos mudos, teimoso defensor dos que recebem pior tratamento que o esterco das praças, denunciador de quem por cobiça converte Jesus Cristo no mais cruel dos deuses e o rei em lobo faminto de carne humana.\n\nOs diferentes pontos de vista presentes no texto expressam que o bispo era, ao mesmo tempo,",
    opcaoA: "execrado pelos reis e reverenciado pelos religiosos do local.",
    opcaoB: "detestado pelos colonizadores e respeitado pelos povos do lugar.",
    opcaoC: "menosprezado pela colônia e idolatrado pelos governantes da região.",
    opcaoD: "desrespeitado pela metrópole e adorado pelos invasores da Espanha.",
    opcaoE: "desacatado pelos excluídos e valorizado pelos negociantes de negros.",
    respostaCorreta: "B",
  },
  {
    prova: "ENEM",
    materia: "Ciências Humanas",
    ano: 2024,
    enunciado:
      "A valsa vienense é a mais antiga das danças de salão tradicional. É dançada desde a Idade Média, quando os pares davam voltas pelo salão realizando giros em torno de si mesmos em postura fechada. Pelo fato de ser dançada aos pares em contato íntimo, a valsa encantava a sociedade medieval, como também sofria proibições por infringir os “bons costumes”. Originária das danças campestres e folclóricas, no século XVI, a aristocracia francesa abandonou a valsa por sua estreita relação com a cultura plebeia, retomando-a posteriormente.\n\nA expressão cultural descrita no texto foi rejeitada no início da Idade Moderna por congregar",
    opcaoA: "traços advindos da feitiçaria nórdica.",
    opcaoB: "práticas inspiradas em rituais pagãos.",
    opcaoC: "regras decorrentes do período renascentista.",
    opcaoD: "compassos produzidos em territórios colonizados.",
    opcaoE: "elementos provenientes de segmentos populares.",
    respostaCorreta: "E",
  },
  {
    prova: "ENEM",
    materia: "Ciências Humanas",
    ano: 2024,
    enunciado:
      "Os grupos dominantes são beneficiados em termos de credibilidade e podem, com isso, controlar falas de membros de outros grupos, descredibilizando seus testemunhos com base em concepções compartilhadas de preconceito de identidade (gênero e raça). Algumas formas de preconceito tornam as declarações das pessoas menos importantes devido ao seu pertencimento a determinado grupo social. Assim, um falante recebe menos credibilidade devido ao preconceito do ouvinte.\n\nCom base na reflexão suscitada no texto, o preconceito de identidade é responsável por um tipo de injustiça",
    opcaoA: "estética, que normatiza os padrões corporais.",
    opcaoB: "sensorial, que privilegia as habilidades visuais.",
    opcaoC: "afetiva, que impede as expressões emocionais.",
    opcaoD: "epistêmica, que prejudica as trocas informacionais.",
    opcaoE: "econômica, que perpetua as desigualdades materiais.",
    respostaCorreta: "D",
  },
  {
    prova: "ENEM",
    materia: "Ciências Humanas",
    ano: 2024,
    enunciado:
      "A alma funciona no meu corpo de maneira maravilhosa. Nele se aloja, certamente, mas sabe bem dele escapar: escapa para ver as coisas através da janela dos meus olhos, escapa para sonhar quando durmo, para sobreviver quando morro. Minha alma durará muito tempo e mais que muito tempo, quando meu corpo vier a apodrecer. Viva minha alma! É meu corpo luminoso, purificado, virtuoso, ágil, móvel, tépido, viçoso; é meu corpo liso, castrado, arredondado como uma bolha de sabão.\n\nEsse texto reforça uma concepção metafísica clássica que remete a um(a)",
    opcaoA: "pressuposto lógico.",
    opcaoB: "pensamento dicotômico.",
    opcaoC: "contemplação da natureza.",
    opcaoD: "raciocínio argumentativo.",
    opcaoE: "crítica à individualidade.",
    respostaCorreta: "B",
  },

  // UERJ - Vestibular Estadual 2026, 1º Exame de Qualificação (08/06/2025)
  {
    prova: "UERJ",
    materia: "Linguagens",
    ano: 2026,
    enunciado:
      "Rebelião ocorrida na Marinha brasileira entre 22 e 27 de novembro de 1910, em protesto contra os castigos físicos que segmentos de baixa patente recebiam. Os amotinados, liderados pelo marinheiro João Cândido Felisberto, apelidado pela imprensa da época de “Almirante Negro”, tiveram suas reivindicações atendidas, mas uma semana depois quase todos foram presos, mortos ou mandados para seringais na Amazônia.\n\nNa década de 1970, a Revolta da Chibata voltou à baila com “Mestre-sala dos mares”, canção de João Bosco e Aldir Blanc, que homenageia João Cândido. A menção, na letra, a seu apelido Almirante Negro foi censurada e substituída por “navegante negro”.\n\nA canção “Mestre-sala dos mares” foi uma homenagem a João Cândido Felisberto, um dos líderes sobreviventes da Revolta da Chibata. Na ótica das autoridades governamentais, a repressão aos amotinados, em 1910, e a censura à letra da canção, em 1970, estão associadas ao seguinte aspecto dessa Revolta:",
    opcaoA: "quebra da hierarquia interna da corporação militar",
    opcaoB: "crítica da defasagem técnica de condições laborais",
    opcaoC: "defesa de pertencimento étnico de grupos subalternos",
    opcaoD: "propaganda de notícias enaltecedoras da ação revolucionária",
    respostaCorreta: "A",
  },
  {
    prova: "UERJ",
    materia: "Linguagens",
    ano: 2026,
    enunciado:
      "“Inundando o coração do pessoal do porão” (verso da canção “Mestre-sala dos mares”, de João Bosco e Aldir Blanc).\n\nA partir do verso acima, é possível reconhecer uma referência tanto aos porões dos navios negreiros quanto aos porões em que os presos políticos, à época do lançamento da canção, em 1974, eram torturados.\n\nEsse processo de significação recebe o nome de:",
    opcaoA: "sinonímia",
    opcaoB: "antonímia",
    opcaoC: "polissemia",
    opcaoD: "monossemia",
    respostaCorreta: "C",
  },
  {
    prova: "UERJ",
    materia: "Linguagens",
    ano: 2026,
    enunciado:
      "“Glória a todas as lutas inglórias” (verso da canção “Mestre-sala dos mares”, de João Bosco e Aldir Blanc).\n\nO verso destacado sintetiza uma ideia a partir de elementos contraditórios, processo que caracteriza o raciocínio dialético.\n\nA ideia sintetizada, no contexto da canção, pode ser compreendida como a necessidade de:",
    opcaoA: "combate ao invasor europeu",
    opcaoB: "resistência ao poder dominante",
    opcaoC: "proteção das minorias marginalizadas",
    opcaoD: "reconhecimento das vitórias passadas",
    respostaCorreta: "B",
  },
  {
    prova: "UERJ",
    materia: "Linguagens",
    ano: 2026,
    enunciado:
      "Com papel fundamental na Revolta da Chibata, o marinheiro João Cândido é descrito como um dragão do mar, que parece emergir das águas da Baía de Guanabara.\n\nA grandeza física associada a processos reais de emersão é:",
    opcaoA: "vazão",
    opcaoB: "pressão",
    opcaoC: "densidade",
    opcaoD: "temperatura",
    respostaCorreta: "C",
  },
  {
    prova: "UERJ",
    materia: "Linguagens",
    ano: 2026,
    enunciado:
      "As pedras pisadas, referidas na letra da canção, fazem parte do antigo Cais do Valongo, onde desembarcou cerca de um milhão de escravizados no Rio de Janeiro. São pedras altamente resistentes, pois o principal ânion de sua estrutura química é o silicato, representado por SiO4−4.\n\nNesse ânion, a ligação interatômica entre o silício e o oxigênio é denominada:",
    opcaoA: "iônica",
    opcaoB: "dipolo",
    opcaoC: "metálica",
    opcaoD: "covalente",
    respostaCorreta: "D",
  },
  {
    prova: "UERJ",
    materia: "Linguagens",
    ano: 2026,
    enunciado:
      "Trecho do conto “Amor”, de Clarice Lispector: “O bonde se arrastava, em seguida estacava. (...) Foi então que olhou para o homem parado no ponto. A diferença entre ele e os outros é que ele estava realmente parado. De pé, suas mãos se mantinham avançadas. Era um cego. (...) Alguma coisa intranquila estava sucedendo. Então ela viu: o cego mascava chicles... Um homem cego mascava chicles.”\n\nAs obras de Clarice Lispector contêm vários episódios de epifania, isto é, aqueles em que um fato torna-se revelador para um personagem, como na situação acima, vivida pela personagem Ana. Duas palavras do trecho citado que representam o processo de revelação vivido por Ana são:",
    opcaoA: "arrastava – estacava",
    opcaoB: "parado – avançadas",
    opcaoC: "ele – outros",
    opcaoD: "olhou – viu",
    respostaCorreta: "D",
  },
  {
    prova: "UERJ",
    materia: "Linguagens",
    ano: 2026,
    enunciado:
      "A cena que produz a epifania — o cego mascando chicletes — pode ser compreendida como uma metáfora irônica da cegueira em que Ana vive, personagem do conto “Amor”, de Clarice Lispector.\n\nNo caso, a ironia está presente no papel que o cego assume na narrativa de levar Ana a:",
    opcaoA: "observar suas relações hostis",
    opcaoB: "enxergar suas emoções reprimidas",
    opcaoC: "encarar seu contexto de desilusões",
    opcaoD: "contemplar seu presente de incertezas",
    respostaCorreta: "B",
  },
  {
    prova: "UERJ",
    materia: "Linguagens",
    ano: 2026,
    enunciado:
      "A questão da epifania pode ser compreendida num sentido místico-religioso e num sentido literário. No sentido místico-religioso, a epifania é o aparecimento de uma divindade e uma manifestação espiritual. Aplicado à literatura, o termo significa o relato de uma experiência que a princípio se mostra simples e rotineira, mas que acaba por mostrar toda a força de uma inusitada revelação.\n\nNo conto “Amor”, de Clarice Lispector, a revelação vivenciada pela personagem Ana expressa o aspecto literário da epifania. Essas duas perspectivas — religiosa e literária — permitem caracterizar a epifania pela:",
    opcaoA: "defesa da moral",
    opcaoB: "descrição da loucura",
    opcaoC: "presença do mistério",
    opcaoD: "rejeição da humanidade",
    respostaCorreta: "C",
  },
  {
    prova: "UERJ",
    materia: "Linguagens",
    ano: 2026,
    enunciado:
      "Trecho do conto “Amor”, de Clarice Lispector: “O calor se tornara mais abafado, tudo tinha ganho uma força e vozes mais altas. Na Rua Voluntários da Pátria parecia prestes a rebentar uma revolução, as grades dos esgotos estavam secas, o ar empoeirado. Um cego mascando chicles mergulhara o mundo em escura sofreguidão.”\n\nA crise provocada pelo encontro com o cego altera a percepção da personagem Ana, como se observa no trecho acima. Essa nova percepção destaca o seguinte aspecto das coisas do mundo:",
    opcaoA: "futilidade",
    opcaoB: "infalibilidade",
    opcaoC: "uniformidade",
    opcaoD: "potencialidade",
    respostaCorreta: "D",
  },
  {
    prova: "UERJ",
    materia: "Linguagens",
    ano: 2026,
    enunciado:
      "Trecho do conto “Amor”, de Clarice Lispector: “Os filhos de Ana eram bons, uma coisa verdadeira e sumarenta. Cresciam, tomavam banho, exigiam para si, malcriados, instantes cada vez mais completos. (...) Ela plantara as sementes que tinha na mão, não outras, mas essas apenas. E cresciam árvores.”\n\nNo trecho transcrito, percebem-se variações de uma mesma metáfora, presente em todo o conto. Essa metáfora compara emoções e relações humanas ao seguinte elemento:",
    opcaoA: "poder",
    opcaoB: "infância",
    opcaoC: "natureza",
    opcaoD: "sociedade",
    respostaCorreta: "C",
  },
];

async function main() {
  let criadas = 0;
  for (const q of questoes) {
    await prisma.questaoBanco.create({ data: q });
    criadas++;
  }
  console.log(`Seed do banco de questões: ${criadas} questões criadas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
