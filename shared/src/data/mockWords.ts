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
    { id: '16', text: '夏休みの自由研究で夜空の色を記録した', reading: 'なつやすみのじゆうけんきゅうでよぞらのいろをきろくした', romaji: 'natsuyasuminojiyuukenkyuudeyozoranoirowokirokushita', difficulty: 'HARD', charCount: 24 },
    { id: '17', text: '文化祭の準備で教室に大きな看板を立てた', reading: 'ぶんかさいのじゅんびできょうしつにおおきなかんばんをたてた', romaji: 'bunkasainojunbidekyoushitsuniookinanbanwotateta', difficulty: 'HARD', charCount: 24 },
    { id: '18', text: '新しい部活の勧誘チラシを公園で配った', reading: 'あたらしいぶかつのかんゆうちらしをこうえんでくばった', romaji: 'atarashiibukatsunokanyuuchirashiokouendekubatta', difficulty: 'HARD', charCount: 24 },
    { id: '19', text: '夜の商店街で友だちと屋台を手伝っていた', reading: 'よるのしょうてんがいでともだちとやたいをてつだっていた', romaji: 'yorunoshootenngaidetomodachitoyataiwotetsudatteita', difficulty: 'HARD', charCount: 24 },
    { id: '20', text: '図書室の窓越しに優しい夕暮れの光が差した', reading: 'としょしつのまどごしにやさしいゆうぐれのひかりがさした', romaji: 'toshoshitsunomadogoshiniyasashiiyuugurenohikarigasashita', difficulty: 'HARD', charCount: 25 },
    { id: '41', text: '秋の大会に向けてグラウンドで走り込みを続けた', reading: 'あきのたいかいにむけてぐらうんどではしりこみをつづけた', romaji: 'akinotaikainimuketeguraundodehashirikomiwotsudzuketa', difficulty: 'HARD', charCount: 24 },
    { id: '42', text: '理科の実験で色の変わる溶液を慎重に混ぜた', reading: 'りかのじっけんでいろのかわるようえきをしんちょうにまぜた', romaji: 'rikanojikkendeironokawaruyouekiwoshinchounimazeta', difficulty: 'HARD', charCount: 24 },
    { id: '43', text: '冬の体育館で冷たい床を雑巾で磨き上げた', reading: 'ふゆのたいいくかんでつめたいゆかをぞうきんでみがきあげた', romaji: 'fuyonotaiikukandetsumetaiyukaowoukindeigakiageta', difficulty: 'HARD', charCount: 24 },
    { id: '44', text: '春先の河川敷でカメラを構えて小鳥を撮影した', reading: 'はるさきのかせんじきでかめらをかまえてことりをさつえいした', romaji: 'harusakinokasendikidecameraokamaetekotoriosatsueishita', difficulty: 'HARD', charCount: 25 },
    { id: '45', text: '雨の日の校舎裏で傘を貸し合う姿が微笑ましかった', reading: 'あめのひのこうしゃうらでかさをかしあうすがたがほほえましかった', romaji: 'amenohinokoushauradekanaokashiausugatagahohoemashikatta', difficulty: 'HARD', charCount: 26 },
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
