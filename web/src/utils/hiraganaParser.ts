/**
 * ひらがな文字列を正しく分割するユーティリティ
 * 拗音（きゃ、しゅ、ちょ など）を1文字として扱う
 */

/**
 * 小文字のひらがな（拗音用）
 */
const SMALL_HIRAGANA = new Set([
  'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ',
  'ゃ', 'ゅ', 'ょ',
  'ゎ',
  'っ',
]);

/**
 * ひらがな文字列を拗音を考慮して分割
 * 例: 'きしゅう' → ['き', 'しゅ', 'う']
 */
export function parseHiragana(text: string): string[] {
  const chars = Array.from(text);
  const result: string[] = [];

  let i = 0;
  while (i < chars.length) {
    const currentChar = chars[i]!;
    const nextChar = chars[i + 1];

    // 次の文字が小文字（拗音・促音）なら結合
    if (nextChar && SMALL_HIRAGANA.has(nextChar)) {
      result.push(currentChar + nextChar);
      i += 2;
    } else {
      result.push(currentChar);
      i += 1;
    }
  }

  return result;
}

/**
 * 文字が小文字のひらがなかチェック
 */
export function isSmallHiragana(char: string): boolean {
  return SMALL_HIRAGANA.has(char);
}
