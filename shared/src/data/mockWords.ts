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
  ],
  NORMAL: [
    { id: '9', text: '和歌山ラーメン', reading: 'わかやまらーめん', romaji: 'wakayamara-men', difficulty: 'NORMAL', charCount: 8 },
    { id: '10', text: 'パンダの赤ちゃん', reading: 'ぱんだのあかちゃん', romaji: 'pandanoakachan', difficulty: 'NORMAL', charCount: 9 },
    { id: '11', text: '有田みかんジュース', reading: 'ありたみかんじゅーす', romaji: 'aritamikanjyu-su', difficulty: 'NORMAL', charCount: 10 },
    { id: '12', text: '南紀白浜温泉', reading: 'なんきしらはまおんせん', romaji: 'nankishirahamaonsen', difficulty: 'NORMAL', charCount: 8 },
    { id: '13', text: '熊野古道を歩く', reading: 'くまのこどうをあるく', romaji: 'kumanokodouoaruku', difficulty: 'NORMAL', charCount: 8 },
    { id: '14', text: '紀州梅干しの名産地', reading: 'きしゅううめぼしのめいさんち', romaji: 'kishuumeboshinomeisanchi', difficulty: 'NORMAL', charCount: 11 },
    { id: '15', text: '高野山金剛峯寺', reading: 'こうやさんこんごうぶじ', romaji: 'kouyasankongoubujl', difficulty: 'NORMAL', charCount: 8 },
  ],
  HARD: [
    { id: '16', text: '紀州徳川家の城下町として栄えた', reading: 'きしゅうとくがわけいのじょうかまちとしてさかえた', romaji: 'kishuutokugawakeinojoukamachitoshitesakaeta', difficulty: 'HARD', charCount: 17 },
    { id: '17', text: '世界遺産に登録された熊野三山への参詣道', reading: 'せかいいさんにとうろくされたくまのさんざんへのさんけいどう', romaji: 'sekaiisannitourokusaretakumanosanzanenosankeidou', difficulty: 'HARD', charCount: 22 },
    { id: '18', text: '和歌山県は温暖な気候で果樹栽培が盛ん', reading: 'わかやまけんはおんだんなきこうでかじゅさいばいがさかん', romaji: 'wakayamakenhaondannakikoudekajusaibaiagasakan', difficulty: 'HARD', charCount: 21 },
    { id: '19', text: '紀伊半島南部に位置する自然豊かな地域', reading: 'きいはんとうなんぶにいちするしぜんゆたかなちいき', romaji: 'kiihantounanbuniichisurushizenyutakanachiki', difficulty: 'HARD', charCount: 21 },
    { id: '20', text: '醤油発祥の地として知られる湯浅町', reading: 'しょうゆはっしょうのちとしてしられるゆあさちょう', romaji: 'shouyuhasshounochitoshiteshirareteruyuasachou', difficulty: 'HARD', charCount: 18 },
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
