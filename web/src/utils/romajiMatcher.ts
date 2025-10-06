/**
 * ローマ字入力の動的マッチングロジック
 * 複数パターンに対応したリアルタイム判定
 */

import { getRomajiPatterns } from './romajiPatterns';
import { parseHiragana } from './hiraganaParser';

export interface MatchResult {
  isMatch: boolean;           // 現在の入力が正しいか
  isComplete: boolean;        // 文字が確定したか
  remainingPatterns: string[]; // 残りの可能性があるパターン
  completedChar?: string;     // 確定した文字（isComplete=trueの場合）
}

/**
 * ひらがな文字列を解析して、入力可能なローマ字パターンの状態を管理
 */
export class RomajiMatcher {
  private hiraganaChars: string[];
  private currentCharIndex: number;
  private currentInput: string;
  private possiblePatterns: string[];

  constructor(hiraganaText: string) {
    this.hiraganaChars = parseHiragana(hiraganaText);
    this.currentCharIndex = 0;
    this.currentInput = '';
    this.possiblePatterns = this.getCurrentCharPatterns();
    console.log(`[RomajiMatcher] 初期化: "${hiraganaText}" → 分割結果:`, this.hiraganaChars);
  }

  /**
   * 現在の文字に対する全パターンを取得
   */
  private getCurrentCharPatterns(): string[] {
    if (this.currentCharIndex >= this.hiraganaChars.length) {
      return [];
    }
    const currentChar = this.hiraganaChars[this.currentCharIndex]!;
    let patterns = getRomajiPatterns(currentChar);
    
    // 「ん」の特殊処理: 'n'単体を常に除外（nn必須）
    if (currentChar === 'ん') {
      patterns = patterns.filter(p => p !== 'n');
      console.log(`[RomajiMatcher] 「ん」のパターン('n'単体除外):`, patterns);
    } else {
      console.log(`[RomajiMatcher] 文字「${currentChar}」のパターン:`, patterns);
    }
    
    return patterns;
  }

  /**
   * キー入力を処理
   */
  handleInput(key: string): MatchResult {
    const newInput = this.currentInput + key;
    console.log(`[RomajiMatcher] キー入力: "${key}", 累積入力: "${newInput}"`);
    console.log(`[RomajiMatcher] 可能なパターン:`, this.possiblePatterns);

    // 現在の入力で始まるパターンをフィルタリング
    const matchingPatterns = this.possiblePatterns.filter(pattern =>
      pattern.startsWith(newInput)
    );
    console.log(`[RomajiMatcher] マッチしたパターン:`, matchingPatterns);

    // マッチするパターンがない場合はミス
    if (matchingPatterns.length === 0) {
      return {
        isMatch: false,
        isComplete: false,
        remainingPatterns: this.possiblePatterns,
      };
    }

    // 完全一致するパターンがあるかチェック
    const exactMatch = matchingPatterns.find(pattern => pattern === newInput);

    if (exactMatch) {
      // 文字確定 - 次の文字へ
      const completedChar = this.hiraganaChars[this.currentCharIndex]!;
      this.currentCharIndex++;
      this.currentInput = '';
      this.possiblePatterns = this.getCurrentCharPatterns();

      return {
        isMatch: true,
        isComplete: true,
        remainingPatterns: this.possiblePatterns,
        completedChar,
      };
    }

    // 部分一致のみ - 入力継続
    this.currentInput = newInput;
    this.possiblePatterns = matchingPatterns;

    return {
      isMatch: true,
      isComplete: false,
      remainingPatterns: matchingPatterns,
    };
  }

  /**
   * 現在の進捗状況を取得
   */
  getProgress(): {
    totalChars: number;
    completedChars: number;
    currentInput: string;
    remainingPatterns: string[];
  } {
    return {
      totalChars: this.hiraganaChars.length,
      completedChars: this.currentCharIndex,
      currentInput: this.currentInput,
      remainingPatterns: this.possiblePatterns,
    };
  }

  /**
   * 完了したかチェック
   */
  isFinished(): boolean {
    return this.currentCharIndex >= this.hiraganaChars.length;
  }

  /**
   * 次に入力すべき文字のヒントを取得
   */
  getNextCharHint(): string {
    if (this.possiblePatterns.length === 0) return '';

    // 現在の入力の次の文字を取得
    const nextCharSet = new Set<string>();
    this.possiblePatterns.forEach(pattern => {
      if (pattern.length > this.currentInput.length) {
        nextCharSet.add(pattern[this.currentInput.length]!);
      }
    });

    // 複数の可能性がある場合は最初の1つを返す
    return Array.from(nextCharSet)[0] || '';
  }

  /**
   * 現在の文字の残りの入力パターンを表示用に取得
   */
  getRemainingInputDisplay(): string {
    // 現在の文字の残り
    let display = '';

    if (this.possiblePatterns.length > 0) {
      const shortestPattern = this.possiblePatterns.reduce((shortest, current) =>
        current.length < shortest.length ? current : shortest
      );
      display = shortestPattern.slice(this.currentInput.length);
    }

    // 次の文字以降のローマ字も追加
    for (let i = this.currentCharIndex + 1; i < this.hiraganaChars.length; i++) {
      const char = this.hiraganaChars[i]!;
      const patterns = getRomajiPatterns(char);
      if (patterns.length > 0) {
        // 最も短いパターンを選択
        const shortestPattern = patterns.reduce((shortest, current) =>
          current.length < shortest.length ? current : shortest
        );
        display += shortestPattern;
      }
    }

    return display;
  }

  /**
   * リセット
   */
  reset(hiraganaText: string) {
    this.hiraganaChars = parseHiragana(hiraganaText);
    this.currentCharIndex = 0;
    this.currentInput = '';
    this.possiblePatterns = this.getCurrentCharPatterns();
  }
}

/**
 * 簡易版: ひらがな文字列全体に対して現在の入力が正しいかチェック
 * （単純な前方一致チェック用）
 */
export function checkRomajiInput(
  hiraganaText: string,
  userInput: string
): {
  isValid: boolean;
  possibleNextChars: string[];
} {
  const matcher = new RomajiMatcher(hiraganaText);

  // 1文字ずつ入力をシミュレート
  for (const char of userInput) {
    const result = matcher.handleInput(char);
    if (!result.isMatch) {
      return { isValid: false, possibleNextChars: [] };
    }
  }

  // 次に入力可能な文字を収集
  const nextCharSet = new Set<string>();
  const progress = matcher.getProgress();

  progress.remainingPatterns.forEach(pattern => {
    if (pattern.length > progress.currentInput.length) {
      nextCharSet.add(pattern[progress.currentInput.length]!);
    }
  });

  return {
    isValid: true,
    possibleNextChars: Array.from(nextCharSet),
  };
}
