import type { Difficulty, Word } from '../types/game';

export const MOCK_WORDS: Record<Difficulty, Word[]> = {
  EASY: [
    { id: '1', text: 'みかん', reading: 'みかん', romaji: 'mikan', difficulty: 'EASY', charCount: 4 },
    { id: '2', text: 'わかやま', reading: 'わかやま', romaji: 'wakayama', difficulty: 'EASY', charCount: 5 },
    { id: '3', text: 'うめぼし', reading: 'うめぼし', romaji: 'umeboshi', difficulty: 'EASY', charCount: 5 },
    { id: '4', text: 'ぱんだ', reading: 'ぱんだ', romaji: 'panda', difficulty: 'EASY', charCount: 4 },
    { id: '5', text: 'らーめん', reading: 'らーめん', romaji: 'ra-men', difficulty: 'EASY', charCount: 5 },
    { id: '6', text: 'おんせん', reading: 'おんせん', romaji: 'onsen', difficulty: 'EASY', charCount: 5 },
    { id: '7', text: 'かつお', reading: 'かつお', romaji: 'katuo', difficulty: 'EASY', charCount: 4 },
    { id: '8', text: 'しらす', reading: 'しらす', romaji: 'shirasu', difficulty: 'EASY', charCount: 4 },
    { id: '21', text: 'たいよう', reading: 'たいよう', romaji: 'taiyou', difficulty: 'EASY', charCount: 5 },
    { id: '22', text: 'なつまつり', reading: 'なつまつり', romaji: 'natsumatsuri', difficulty: 'EASY', charCount: 6 },
    { id: '23', text: 'やまのぼり', reading: 'やまのぼり', romaji: 'yamanobori', difficulty: 'EASY', charCount: 6 },
    { id: '24', text: 'さくら', reading: 'さくら', romaji: 'sakura', difficulty: 'EASY', charCount: 4 },
    { id: '25', text: 'ゆうひ', reading: 'ゆうひ', romaji: 'yuuhi', difficulty: 'EASY', charCount: 4 },
    { id: '26', text: 'あまぐも', reading: 'あまぐも', romaji: 'amagumo', difficulty: 'EASY', charCount: 5 },
    { id: '27', text: 'かもめ', reading: 'かもめ', romaji: 'kamome', difficulty: 'EASY', charCount: 4 },
    { id: '28', text: 'こはく', reading: 'こはく', romaji: 'kohaku', difficulty: 'EASY', charCount: 4 },
  ],
  NORMAL: [
    { id: '9', text: '和歌山ラーメン', reading: 'わかやまらーめん', romaji: 'wakayamara-men', difficulty: 'NORMAL', charCount: 8 },
    { id: '10', text: 'パンダの赤ちゃん', reading: 'ぱんだのあかちゃん', romaji: 'pandanoakachan', difficulty: 'NORMAL', charCount: 9 },
    { id: '11', text: '有田みかんジュース', reading: 'ありたみかんじゅーす', romaji: 'aritamikanjyu-su', difficulty: 'NORMAL', charCount: 10 },
    { id: '12', text: '南紀白浜温泉', reading: 'なんきしらはまおんせん', romaji: 'nankishirahamaonsen', difficulty: 'NORMAL', charCount: 8 },
    { id: '13', text: '熊野古道を歩く', reading: 'くまのこどうをあるく', romaji: 'kumanokodouoaruku', difficulty: 'NORMAL', charCount: 8 },
    { id: '14', text: '紀州梅干しの名産地', reading: 'きしゅううめぼしのめいさんち', romaji: 'kishuumeboshinomeisanchi', difficulty: 'NORMAL', charCount: 11 },
    { id: '15', text: '高野山金剛峯寺', reading: 'こうやさんこんごうぶじ', romaji: 'kouyasankongoubujl', difficulty: 'NORMAL', charCount: 8 },
    { id: '29', text: '熊野古道の石畳', reading: 'くまのこどうのいしだたみ', romaji: 'kumanokodounoishidatami', difficulty: 'NORMAL', charCount: 11 },
    { id: '30', text: '潮風が香る港町', reading: 'しおかぜがかおるみなとまち', romaji: 'shiokazegakaoruminatomachi', difficulty: 'NORMAL', charCount: 11 },
    { id: '31', text: '秋の紅葉ライトアップ', reading: 'あきのこうようらいとあっぷ', romaji: 'akinokouyouraitoappu', difficulty: 'NORMAL', charCount: 11 },
    { id: '32', text: '白浜の砂浜で遊ぶ', reading: 'しらはまのすなはまであそぶ', romaji: 'shirahamanosunahamadeasobu', difficulty: 'NORMAL', charCount: 11 },
    { id: '33', text: '紀伊水道を渡る船', reading: 'きいすいどうをわたるふね', romaji: 'kiisuidoouwatarufune', difficulty: 'NORMAL', charCount: 10 },
    { id: '34', text: '温泉街の湯けむり', reading: 'おんせんがいのゆけむり', romaji: 'onsengainoyukemuri', difficulty: 'NORMAL', charCount: 10 },
    { id: '35', text: '南高梅の収穫祭', reading: 'なんこううめのしゅうかくさい', romaji: 'nankouumenoshuukakusai', difficulty: 'NORMAL', charCount: 11 },
    { id: '36', text: '熊野川でカヤック体験', reading: 'くまのがわでかやっくたいけん', romaji: 'kumanogawadekayakkutatiken', difficulty: 'NORMAL', charCount: 12 },
    { id: '37', text: '夜空を彩る花火大会', reading: 'よぞらをいろどるはなびたいかい', romaji: 'yozorawirodoruhanabitaikai', difficulty: 'NORMAL', charCount: 12 },
    { id: '38', text: '漁師町の朝市に行く', reading: 'りょうしまちのあさいちにいく', romaji: 'ryoushimachinoasaichiniiku', difficulty: 'NORMAL', charCount: 11 },
    { id: '39', text: '紀州備長炭で焼く串', reading: 'きしゅうびんちょうたんでやくくし', romaji: 'kishuubinchohdeyakukushi', difficulty: 'NORMAL', charCount: 12 },
    { id: '40', text: '熊野本宮大社を参拝', reading: 'くまのほんぐうたいしゃをさんぱい', romaji: 'kumanohonguutaisyawosanpai', difficulty: 'NORMAL', charCount: 12 },
  ],
  SCORE: [
    {
      id: '101',
      text: '夏祭りの広場で子どもたちが笑う',
      reading: 'なつまつりのひろばでこどもたちがわらう',
      romaji: 'natsumatsurinohirobadekodomotachigawarau',
      difficulty: 'SCORE',
      charCount: 19,
    },
    {
      id: '102',
      text: '朝焼けの港で漁船が静かに揺れる',
      reading: 'あさやけのみなとでぎょせんがしずかにゆれる',
      romaji: 'asayakenominatodegyosengashizukaniyureru',
      difficulty: 'SCORE',
      charCount: 21,
    },
    {
      id: '103',
      text: '図書室の窓辺で雨音を聞きながら読む',
      reading: 'としょしつのまどべであまおとをききながらよむ',
      romaji: 'toshoshitsunomadobedeamaotowokikinarayomu',
      difficulty: 'SCORE',
      charCount: 22,
    },
    {
      id: '104',
      text: '夕暮れの公園で犬が駆け回って遊ぶ',
      reading: 'ゆうぐれのこうえんでいぬがかけまわってあそぶ',
      romaji: 'yuugurenokouendeinugakakemawatteasobu',
      difficulty: 'SCORE',
      charCount: 22,
    },
    {
      id: '105',
      text: '放課後の音楽室でピアノと歌声が響く',
      reading: 'ほうかごのおんがくしつでぴあのとうたごえがひびく',
      romaji: 'houkagonoongakushitsudepianotoutagoegahibiku',
      difficulty: 'SCORE',
      charCount: 24,
    },
  ],
  HARD: [
    { id: '16', text: '紀州徳川家の城下町として栄えた', reading: 'きしゅうとくがわけいのじょうかまちとしてさかえた', romaji: 'kishuutokugawakeinojoukamachitoshitesakaeta', difficulty: 'HARD', charCount: 17 },
    { id: '17', text: '世界遺産に登録された熊野三山への参詣道', reading: 'せかいいさんにとうろくされたくまのさんざんへのさんけいどう', romaji: 'sekaiisannitourokusaretakumanosanzanenosankeidou', difficulty: 'HARD', charCount: 22 },
    { id: '18', text: '和歌山県は温暖な気候で果樹栽培が盛ん', reading: 'わかやまけんはおんだんなきこうでかじゅさいばいがさかん', romaji: 'wakayamakenhaondannakikoudekajusaibaiagasakan', difficulty: 'HARD', charCount: 21 },
    { id: '19', text: '紀伊半島南部に位置する自然豊かな地域', reading: 'きいはんとうなんぶにいちするしぜんゆたかなちいき', romaji: 'kiihantounanbuniichisurushizenyutakanachiki', difficulty: 'HARD', charCount: 21 },
    { id: '20', text: '醤油発祥の地として知られる湯浅町', reading: 'しょうゆはっしょうのちとしてしられるゆあさちょう', romaji: 'shouyuhasshounochitoshiteshirareteruyuasachou', difficulty: 'HARD', charCount: 18 },
    { id: '41', text: '黒潮の恵みを受けた海産物が豊富に獲れる', reading: 'くろしおのめぐみをうけたかいさんぶつがほうふにとれる', romaji: 'kuroshioonomegumiwouketakaisanbutsugahoufunitoreru', difficulty: 'HARD', charCount: 23 },
    { id: '42', text: '熊野速玉大社の神秘的な祭礼行事を見学する', reading: 'くまのはやたまだいしゃのしんぴてきなさいれいぎょうじをけんがくする', romaji: 'kumanohayatamadaishanoshinpitekinasaireigyouwokengakusuru', difficulty: 'HARD', charCount: 27 },
    { id: '43', text: '高野山の宿坊で精進料理を味わいながら静寂を楽しむ', reading: 'こうやさんのしゅくぼうでしょうじんりょうりをあじわいながらせいじゃくをたのしむ', romaji: 'kouyasannoshukuboudeshoujinryourioajiwainagaraseijakuwotanoshimu', difficulty: 'HARD', charCount: 32 },
    { id: '44', text: '那智の滝にかかる虹を撮影しに早朝から山道を進む', reading: 'なちのたきにかかるにじをさつえいしにそうちょうからやまみちをすすむ', romaji: 'nachinotakinikakarunijiosatsueishinisouchoukarayamamichiwosusumu', difficulty: 'HARD', charCount: 30 },
    { id: '45', text: '田辺市の弁慶まつりで伝統芸能と勇壮な武者行列を観覧する', reading: 'たなべしのべんけいまつりででんとうげいのうとゆうそうなむしゃぎょうれつをかんらんする', romaji: 'tanabeshibenkeimatsuridedentougeinoutoyuusonamushagyouretsuwokanransuru', difficulty: 'HARD', charCount: 34 },
  ],
};

export function getRandomWord(difficulty: Difficulty): Word {
  const words = MOCK_WORDS[difficulty];
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex]!;
}

export function getRandomWords(difficulty: Difficulty, count: number): Word[] {
  const words = [...MOCK_WORDS[difficulty]];
  const result: Word[] = [];

  for (let i = 0; i < Math.min(count, words.length); i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words.splice(randomIndex, 1)[0];
    if (word) result.push(word);
  }

  return result;
}
