/**
 * ローマ字入力パターン定義
 * タイピングゲームで受け入れる複数の入力パターンを定義
 */

export interface RomajiPattern {
  hiragana: string;
  patterns: string[];
}

/**
 * ローマ字入力パターンマッピング
 * 各ひらがなに対して受け入れる複数のローマ字パターンを定義
 */
export const ROMAJI_PATTERNS: RomajiPattern[] = [
  // あ行
  { hiragana: 'あ', patterns: ['a'] },
  { hiragana: 'い', patterns: ['i', 'yi'] },
  { hiragana: 'う', patterns: ['u', 'wu', 'whu'] },
  { hiragana: 'え', patterns: ['e'] },
  { hiragana: 'お', patterns: ['o'] },

  // か行
  { hiragana: 'か', patterns: ['ka', 'ca'] },
  { hiragana: 'き', patterns: ['ki'] },
  { hiragana: 'く', patterns: ['ku', 'cu', 'qu'] },
  { hiragana: 'け', patterns: ['ke'] },
  { hiragana: 'こ', patterns: ['ko', 'co'] },

  // が行
  { hiragana: 'が', patterns: ['ga'] },
  { hiragana: 'ぎ', patterns: ['gi'] },
  { hiragana: 'ぐ', patterns: ['gu'] },
  { hiragana: 'げ', patterns: ['ge'] },
  { hiragana: 'ご', patterns: ['go'] },

  // さ行
  { hiragana: 'さ', patterns: ['sa'] },
  { hiragana: 'し', patterns: ['shi', 'si', 'ci'] },
  { hiragana: 'す', patterns: ['su'] },
  { hiragana: 'せ', patterns: ['se', 'ce'] },
  { hiragana: 'そ', patterns: ['so'] },

  // ざ行
  { hiragana: 'ざ', patterns: ['za'] },
  { hiragana: 'じ', patterns: ['ji', 'zi'] },
  { hiragana: 'ず', patterns: ['zu'] },
  { hiragana: 'ぜ', patterns: ['ze'] },
  { hiragana: 'ぞ', patterns: ['zo'] },

  // た行
  { hiragana: 'た', patterns: ['ta'] },
  { hiragana: 'ち', patterns: ['chi', 'ti'] },
  { hiragana: 'つ', patterns: ['tsu', 'tu'] },
  { hiragana: 'て', patterns: ['te'] },
  { hiragana: 'と', patterns: ['to'] },

  // だ行
  { hiragana: 'だ', patterns: ['da'] },
  { hiragana: 'ぢ', patterns: ['di'] },
  { hiragana: 'づ', patterns: ['du'] },
  { hiragana: 'で', patterns: ['de'] },
  { hiragana: 'ど', patterns: ['do'] },

  // な行
  { hiragana: 'な', patterns: ['na'] },
  { hiragana: 'に', patterns: ['ni'] },
  { hiragana: 'ぬ', patterns: ['nu'] },
  { hiragana: 'ね', patterns: ['ne'] },
  { hiragana: 'の', patterns: ['no'] },

  // は行
  { hiragana: 'は', patterns: ['ha'] },
  { hiragana: 'ひ', patterns: ['hi'] },
  { hiragana: 'ふ', patterns: ['fu', 'hu'] },
  { hiragana: 'へ', patterns: ['he'] },
  { hiragana: 'ほ', patterns: ['ho'] },

  // ば行
  { hiragana: 'ば', patterns: ['ba'] },
  { hiragana: 'び', patterns: ['bi'] },
  { hiragana: 'ぶ', patterns: ['bu'] },
  { hiragana: 'べ', patterns: ['be'] },
  { hiragana: 'ぼ', patterns: ['bo'] },

  // ぱ行
  { hiragana: 'ぱ', patterns: ['pa'] },
  { hiragana: 'ぴ', patterns: ['pi'] },
  { hiragana: 'ぷ', patterns: ['pu'] },
  { hiragana: 'ぺ', patterns: ['pe'] },
  { hiragana: 'ぽ', patterns: ['po'] },

  // ま行
  { hiragana: 'ま', patterns: ['ma'] },
  { hiragana: 'み', patterns: ['mi'] },
  { hiragana: 'む', patterns: ['mu'] },
  { hiragana: 'め', patterns: ['me'] },
  { hiragana: 'も', patterns: ['mo'] },

  // や行
  { hiragana: 'や', patterns: ['ya'] },
  { hiragana: 'ゆ', patterns: ['yu'] },
  { hiragana: 'よ', patterns: ['yo'] },

  // ら行
  { hiragana: 'ら', patterns: ['ra'] },
  { hiragana: 'り', patterns: ['ri'] },
  { hiragana: 'る', patterns: ['ru'] },
  { hiragana: 'れ', patterns: ['re'] },
  { hiragana: 'ろ', patterns: ['ro'] },

  // わ行
  { hiragana: 'わ', patterns: ['wa'] },
  { hiragana: 'ゐ', patterns: ['wi'] },
  { hiragana: 'ゑ', patterns: ['we'] },
  { hiragana: 'を', patterns: ['wo', 'o'] },

  // ん
  { hiragana: 'ん', patterns: ['nn', 'n', "n'", 'xn'] },

  // きゃ行
  { hiragana: 'きゃ', patterns: ['kya'] },
  { hiragana: 'きゅ', patterns: ['kyu'] },
  { hiragana: 'きょ', patterns: ['kyo'] },

  // ぎゃ行
  { hiragana: 'ぎゃ', patterns: ['gya'] },
  { hiragana: 'ぎゅ', patterns: ['gyu'] },
  { hiragana: 'ぎょ', patterns: ['gyo'] },

  // しゃ行
  { hiragana: 'しゃ', patterns: ['sha', 'sya'] },
  { hiragana: 'しゅ', patterns: ['shu', 'syu'] },
  { hiragana: 'しょ', patterns: ['sho', 'syo'] },

  // じゃ行
  { hiragana: 'じゃ', patterns: ['ja', 'jya', 'zya'] },
  { hiragana: 'じゅ', patterns: ['ju', 'jyu', 'zyu'] },
  { hiragana: 'じょ', patterns: ['jo', 'jyo', 'zyo'] },

  // ちゃ行
  { hiragana: 'ちゃ', patterns: ['cha', 'tya', 'cya'] },
  { hiragana: 'ちゅ', patterns: ['chu', 'tyu', 'cyu'] },
  { hiragana: 'ちょ', patterns: ['cho', 'tyo', 'cyo'] },

  // にゃ行
  { hiragana: 'にゃ', patterns: ['nya'] },
  { hiragana: 'にゅ', patterns: ['nyu'] },
  { hiragana: 'にょ', patterns: ['nyo'] },

  // ひゃ行
  { hiragana: 'ひゃ', patterns: ['hya'] },
  { hiragana: 'ひゅ', patterns: ['hyu'] },
  { hiragana: 'ひょ', patterns: ['hyo'] },

  // びゃ行
  { hiragana: 'びゃ', patterns: ['bya'] },
  { hiragana: 'びゅ', patterns: ['byu'] },
  { hiragana: 'びょ', patterns: ['byo'] },

  // ぴゃ行
  { hiragana: 'ぴゃ', patterns: ['pya'] },
  { hiragana: 'ぴゅ', patterns: ['pyu'] },
  { hiragana: 'ぴょ', patterns: ['pyo'] },

  // みゃ行
  { hiragana: 'みゃ', patterns: ['mya'] },
  { hiragana: 'みゅ', patterns: ['myu'] },
  { hiragana: 'みょ', patterns: ['myo'] },

  // りゃ行
  { hiragana: 'りゃ', patterns: ['rya'] },
  { hiragana: 'りゅ', patterns: ['ryu'] },
  { hiragana: 'りょ', patterns: ['ryo'] },

  // 小文字
  { hiragana: 'ぁ', patterns: ['la', 'xa'] },
  { hiragana: 'ぃ', patterns: ['li', 'xi', 'lyi', 'xyi'] },
  { hiragana: 'ぅ', patterns: ['lu', 'xu'] },
  { hiragana: 'ぇ', patterns: ['le', 'xe', 'lye', 'xye'] },
  { hiragana: 'ぉ', patterns: ['lo', 'xo'] },
  { hiragana: 'ゃ', patterns: ['lya', 'xya'] },
  { hiragana: 'ゅ', patterns: ['lyu', 'xyu'] },
  { hiragana: 'ょ', patterns: ['lyo', 'xyo'] },
  { hiragana: 'ゎ', patterns: ['lwa', 'xwa'] },

  // 促音
  { hiragana: 'っ', patterns: ['ltu', 'xtu', 'ltsu', 'xtsu'] },

  // 長音記号（カタカナ用だが念のため）
  { hiragana: 'ー', patterns: ['-'] },
];

/**
 * ひらがなからローマ字パターンリストを取得
 */
export function getRomajiPatterns(hiragana: string): string[] {
  const pattern = ROMAJI_PATTERNS.find(p => p.hiragana === hiragana);
  return pattern?.patterns || [hiragana]; // 見つからない場合はそのまま返す
}

/**
 * ひらがな文字列から最も短いローマ字パターンを取得
 * （表示用・デフォルトパターン）
 */
export function getDefaultRomaji(hiragana: string): string {
  const patterns = getRomajiPatterns(hiragana);
  // 最も短いパターンを返す
  return patterns.reduce((shortest, current) =>
    current.length < shortest.length ? current : shortest
  , patterns[0] || hiragana);
}

/**
 * ひらがな文字列全体から全パターンのローマ字配列を生成
 * 各文字ごとに複数パターンを持つため、組み合わせ爆発に注意
 */
export function hiraganaToRomajiVariants(text: string): string[][] {
  const result: string[][] = [];

  for (const char of text) {
    const patterns = getRomajiPatterns(char);
    result.push(patterns);
  }

  return result;
}

/**
 * ひらがな文字列からデフォルトのローマ字文字列を生成
 */
export function hiraganaToDefaultRomaji(text: string): string {
  return Array.from(text).map(char => getDefaultRomaji(char)).join('');
}
