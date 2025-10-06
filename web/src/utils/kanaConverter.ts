/**
 * ローマ字 → ひらがな 変換ユーティリティ
 */

// ローマ字 → ひらがな マッピング
const ROMAJI_TO_HIRAGANA: Record<string, string> = {
  // あ行
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  // か行
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  // が行
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  // さ行
  sa: 'さ', si: 'し', su: 'す', se: 'せ', so: 'そ',
  shi: 'し',
  // ざ行
  za: 'ざ', zi: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  ji: 'じ',
  // た行
  ta: 'た', ti: 'ち', tu: 'つ', te: 'て', to: 'と',
  chi: 'ち', tsu: 'つ',
  // だ行
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  // な行
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  // は行
  ha: 'は', hi: 'ひ', hu: 'ふ', he: 'へ', ho: 'ほ',
  fu: 'ふ',
  // ば行
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  // ぱ行
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  //ま行
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  // や行
  ya: 'や', yu: 'ゆ', yo: 'よ',
  // ら行
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  // わ行
  wa: 'わ', wi: 'ゐ', we: 'ゑ', wo: 'を',
  // ん
  n: 'ん', nn: 'ん',
  // きゃ行
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
  // ぎゃ行
  gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  // しゃ行
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ',
  sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
  // じゃ行
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ',
  jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ',
  zya: 'じゃ', zyu: 'じゅ', zyo: 'じょ',
  // ちゃ行
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ',
  tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ',
  // にゃ行
  nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
  // ひゃ行
  hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
  // びゃ行
  bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
  // ぴゃ行
  pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
  // みゃ行
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
  // りゃ行
  rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  // 小文字
  la: 'ぁ', li: 'ぃ', lu: 'ぅ', le: 'ぇ', lo: 'ぉ',
  lya: 'ゃ', lyu: 'ゅ', lyo: 'ょ',
  ltu: 'っ', ltsu: 'っ',
  lwa: 'ゎ',
  // 促音
  xtu: 'っ', xtsu: 'っ',
};

// ひらがな → ローマ字の逆引きマップ
const HIRAGANA_TO_ROMAJI: Record<string, string> = {};
for (const [romaji, kana] of Object.entries(ROMAJI_TO_HIRAGANA)) {
  // 最も短いローマ字を優先（例: し → si より shi を優先しない）
  if (!HIRAGANA_TO_ROMAJI[kana] || romaji.length < HIRAGANA_TO_ROMAJI[kana]!.length) {
    HIRAGANA_TO_ROMAJI[kana] = romaji;
  }
}

/**
 * ひらがなをローマ字表記に変換
 */
export function hiraganaToRomaji(hiragana: string): string[] {
  const result: string[] = [];

  for (const char of hiragana) {
    const romaji = HIRAGANA_TO_ROMAJI[char];
    if (romaji) {
      result.push(romaji);
    } else {
      // マッチしない文字はそのまま
      result.push(char);
    }
  }

  return result;
}
