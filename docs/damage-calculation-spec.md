# ダメージ計算ロジック仕様書

## 概要
プレイヤーが個別に難易度を選択し、戦略的な深みを持たせる設計。
HARD選択者はハイリスク・ハイリターン、EASY選択者は安全な手数戦略を取る。

---

## 難易度パラメータ

### EASY（手数戦略）
```typescript
{
  difficulty: 'EASY',
  charRange: [5, 10],        // 短文（例: "みかん", "わかやま"）
  baseDamage: 7,             // 基礎ダメージ
  maxCombo: 3,               // コンボ上限
  expectedTime: 5,           // 想定クリア時間（秒）
  theoreticalDPS: 1.4,       // 理論DPS
}
```
**戦略**: 短文を素早くクリアして手数で押す。コンボ上限が低いため爆発力は控えめ。

---

### NORMAL（バランス型）
```typescript
{
  difficulty: 'NORMAL',
  charRange: [10, 18],       // 中文（例: "和歌山ラーメン"）
  baseDamage: 12,            // 基礎ダメージ
  maxCombo: 5,               // コンボ上限
  expectedTime: 10,          // 想定クリア時間（秒）
  theoreticalDPS: 1.5,       // 理論DPS
}
```
**戦略**: バランス重視。安定性と効率の中間。

---

### HARD（一撃戦略）
```typescript
{
  difficulty: 'HARD',
  charRange: [18, 30],       // 長文（例: "紀州徳川家の城下町として栄えた"）
  baseDamage: 18,            // 基礎ダメージ
  maxCombo: 7,               // コンボ上限
  expectedTime: 15,          // 想定クリア時間（秒）
  theoreticalDPS: 1.67,      // 理論DPS（最高効率）
}
```
**戦略**: 長文で大ダメージ。コンボ維持で爆発的な火力。ミスすると致命的。

---

## ダメージ計算式

### 基本式（シンプル版）
```typescript
finalDamage = baseDamage × comboMultiplier
```

### コンボ倍率
```typescript
comboMultiplier = 1 + min(comboCount, maxCombo) × 0.1

例:
- コンボ0: 1.0x
- コンボ3: 1.3x
- コンボ5: 1.5x
- コンボ7: 1.7x
```

### ダメージ例
| 難易度 | 基礎dmg | コンボ0 | コンボMAX | 想定攻撃回数 |
|--------|---------|---------|-----------|--------------|
| EASY   | 7       | 7 dmg   | 9.1 dmg   | 12〜15回     |
| NORMAL | 12      | 12 dmg  | 18 dmg    | 7〜10回      |
| HARD   | 18      | 18 dmg  | 30.6 dmg  | 5〜7回       |

**HP 100の場合、1ラウンドで上記回数の攻撃が必要**

---

## コンボシステム

### コンボ発生条件
- お題を正確にクリア → コンボ+1
- ミス（入力ミス）→ コンボリセット（0に戻る）

### コンボ上限
- **EASY**: 最大3連続まで（それ以上は倍率増えない）
- **NORMAL**: 最大5連続
- **HARD**: 最大7連続

### コンボ表示
```
コンボ表示例:
🔥 3 COMBO!  (1.3x)
🔥 5 COMBO!  (1.5x)
🔥🔥 7 COMBO! MAX! (1.7x)
```

---

## ミス判定

### 入力方式
**リアルタイム1文字判定方式**

```
お題: "わかやま"
表示: [w][a][k][a][y][a][m][a] (全てグレー)
      ↑ カーソル位置
```

### 入力フロー
1. 現在位置の正しい文字を入力 → 緑色に変化 → カーソル進む
2. 現在位置の正しい文字以外を入力 → **ミス判定** → カーソル進まない → 文字も入力されない
3. 再度正しい文字を入力 → 緑色に変化 → カーソル進む

### ミスの定義
**現在カーソル位置の期待文字以外のキー入力**
- 間違った文字は入力バッファに入らない（無視される）
- カーソルは進まない（同じ文字を待ち続ける）
- バックスペース不要（そもそも入力されていないため）

### ミス時の処理
```typescript
onMiss: {
  comboReset: true,          // コンボを0にリセット
  missCountIncrement: true,  // ミス回数を記録
  soundEffect: 'miss.mp3',   // ミス効果音再生
  visualFeedback: true,      // 画面フラッシュ等（任意）
  cursorAdvance: false,      // カーソルは進まない
}
```

### ミス回数の記録
- 試合中のミス回数を記録（精度計算用）
- 試合結果に含める（例: "精度: 95% (5ミス)"）
- ランキング集計に使用可能（精度ランキング等）

### 効果音
- **ミス時**: エラー音（ブザー系）
- **正解時**: タイプ音（カチカチ系、任意）
- **お題クリア時**: 攻撃音（シュッ、ドカッ等）

---

## タイムアウト制度

**なし**
- プレイヤーは自分のペースで入力可能
- 時間制限なし（ただし、相手が先に攻撃すればダメージを受ける）

---

## お題管理（Supabase）

### wordsテーブル設計
```sql
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,              -- お題テキスト
  difficulty TEXT NOT NULL,        -- 'EASY' | 'NORMAL' | 'HARD'
  char_count INTEGER NOT NULL,     -- 文字数
  category TEXT,                   -- カテゴリ（例: "和歌山", "一般"）
  created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_words_difficulty ON words(difficulty);
CREATE INDEX idx_words_char_count ON words(char_count);
```

### お題選択ロジック
```typescript
// 難易度に応じてお題をランダム選択
async function selectWord(difficulty: Difficulty): Promise<Word> {
  const { charRange } = DIFFICULTY_CONFIG[difficulty];

  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('difficulty', difficulty)
    .gte('char_count', charRange[0])
    .lte('char_count', charRange[1])
    .order('RANDOM()')
    .limit(1)
    .single();

  return data;
}
```

---

## DPSバランス（リスク・リターン設計）

### 理論DPS比較
```
EASY:   baseDamage / expectedTime = 7 / 5   = 1.4 DPS
NORMAL: baseDamage / expectedTime = 12 / 10 = 1.5 DPS
HARD:   baseDamage / expectedTime = 18 / 15 = 1.67 DPS (約+12% vs NORMAL)
```

### コンボMAX時の実効DPS
```
EASY:   9.1 / 5   = 1.82 DPS
NORMAL: 18 / 10   = 1.8 DPS
HARD:   30.6 / 15 = 2.04 DPS (最高効率)
```

**結論**: HARDでコンボ維持できれば最も効率的だが、ミスすると大きくロス。
EASYは安定だが上限も低い。

---

## 実装時の考慮点

### フロントエンド（React）
- 難易度選択UI（READY前）
- リアルタイムタイピング入力（1文字ごとの判定）
- コンボ表示アニメーション
- ダメージ計算結果の即座反映
- ミス時の効果音・視覚フィードバック

### バックエンド（Durable Objects）
```typescript
interface PlayerState {
  playerId: string;
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
  hp: number;
  lives: number;
  combo: number;
  missCount: number;
  currentWord: Word;
}

class RoomDO {
  async handleAttack(playerId: string, wordCompleted: string, timeTaken: number, missCount: number) {
    const player = this.state.players[playerId];
    const config = DIFFICULTY_CONFIG[player.difficulty];

    // ダメージ計算
    const comboMultiplier = 1 + Math.min(player.combo, config.maxCombo) * 0.1;
    const damage = Math.floor(config.baseDamage * comboMultiplier);

    // 相手にダメージ適用
    const opponent = this.getOpponent(playerId);
    opponent.hp = Math.max(0, opponent.hp - damage);

    // コンボ更新
    player.combo += 1;

    // 次のお題を選択
    player.currentWord = await selectWord(player.difficulty);

    // 全クライアントにbroadcast
    this.broadcast({
      type: 'attack',
      playerId,
      damage,
      combo: player.combo,
      opponentHp: opponent.hp
    });
  }

  async handleMiss(playerId: string) {
    const player = this.state.players[playerId];

    // コンボリセット
    player.combo = 0;
    player.missCount += 1;

    // クライアントに通知
    this.broadcast({
      type: 'miss',
      playerId,
      missCount: player.missCount
    });
  }
}
```

### Supabase（試合結果保存）
```typescript
interface MatchResult {
  id: string;
  player1_name: string;
  player1_difficulty: 'EASY' | 'NORMAL' | 'HARD';
  player1_score: number;
  player1_miss_count: number;
  player2_name: string;
  player2_difficulty: 'EASY' | 'NORMAL' | 'HARD';
  player2_score: number;
  player2_miss_count: number;
  winner: string;
  rounds_played: number;
  created_at: string;
}
```

---

## 今後の拡張案

### オプション機能（現時点では実装しない）
- 速度ボーナス（WPM計測）
- 精度ペナルティ（ミス率による減算）
- 特殊お題（高難易度で高ダメージ）
- アイテムシステム（ダメージ倍率UP等）
- リプレイ機能（試合の再生）

---

## バージョン
- v1.0: 初期仕様（2025-10-06）
  - 個別難易度選択システム
  - リアルタイム1文字判定方式
  - コンボシステム（難易度別上限）
  - ミス回数記録機能
