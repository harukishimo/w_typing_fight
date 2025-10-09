import { motion } from 'framer-motion';
import { DIFFICULTY_CONFIG } from 'shared';
import { LeaderboardPanel } from './LeaderboardPanel';
import { ScoreAttackLeaderboard } from './ScoreAttackLeaderboard';

type Props = {
  onSelectSolo: () => void;
  onSelectMatch: () => void;
  onSelectScoreAttack: () => void;
};

export function ModeSelect({ onSelectSolo, onSelectMatch, onSelectScoreAttack }: Props) {
  const strategyCards = [
    {
      key: 'EASY',
      emoji: '🟢',
      title: 'EASY / 手数型',
      gradient: 'from-green-400/20 via-white to-green-100/60',
      border: 'border-green-300/60',
      pros: ['短文中心でコンボを繋ぎやすい', '高速タイピングのウォームアップに最適'],
      cons: ['1発あたりのダメージは控えめ', '長文耐性を付けたい場合は物足りない'],
      details: `${DIFFICULTY_CONFIG.EASY.charRange[0]}-${DIFFICULTY_CONFIG.EASY.charRange[1]}文字 / ダメージ ${DIFFICULTY_CONFIG.EASY.baseDamage}`,
    },
    {
      key: 'NORMAL',
      emoji: '🟡',
      title: 'NORMAL / バランス型',
      gradient: 'from-yellow-300/25 via-white to-yellow-100/60',
      border: 'border-yellow-300/60',
      pros: ['攻守のバランスが良く安定感がある', '状況に応じて戦略を切り替えやすい'],
      cons: ['突出した強みがなく器用貧乏になりがち', '判断が遅れると先手を取られる'],
      details: `${DIFFICULTY_CONFIG.NORMAL.charRange[0]}-${DIFFICULTY_CONFIG.NORMAL.charRange[1]}文字 / ダメージ ${DIFFICULTY_CONFIG.NORMAL.baseDamage}`,
    },
    {
      key: 'HARD',
      emoji: '🔴',
      title: 'HARD / 一撃必殺型',
      gradient: 'from-rose-400/20 via-white to-rose-100/60',
      border: 'border-rose-300/60',
      pros: ['一撃のダメージが大きく逆転力がある', '長文タイピング力を一気に鍛えられる'],
      cons: ['入力時間が長くミスのリスクが高い', '失敗すると隙が生まれ反撃されやすい'],
      details: `${DIFFICULTY_CONFIG.HARD.charRange[0]}-${DIFFICULTY_CONFIG.HARD.charRange[1]}文字 / ダメージ ${DIFFICULTY_CONFIG.HARD.baseDamage}`,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-3xl w-full text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold text-primary-800 mb-4">Type Fighter</h1>
          <p className="text-lg text-primary-700">
            モードを選んでバトルを開始しよう！
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSelectSolo}
            className="bg-white text-primary-700 rounded-2xl p-10 shadow-xl border border-primary-200 transition"
          >
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold mb-2">ソロ練習</h2>
            <p className="text-sm text-primary-500">
              難易度を選んで一人でスコアを伸ばそう。
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSelectScoreAttack}
            className="bg-gradient-to-br from-amber-300 to-amber-500 text-white rounded-2xl p-10 shadow-xl transition"
          >
            <div className="text-6xl mb-4">⏱️</div>
            <h2 className="text-3xl font-bold mb-2">スコアアタック</h2>
            <p className="text-sm text-white/80">
              60秒間で高スコアを狙い、ランキングに名を刻もう。
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSelectMatch}
            className="bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-2xl p-10 shadow-xl transition"
          >
            <div className="text-6xl mb-4">⚔️</div>
            <h2 className="text-3xl font-bold mb-2">オンライン対戦</h2>
            <p className="text-sm text-white/80">
              ルームコードで相手とマッチしてバトル！
            </p>
          </motion.button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ScoreAttackLeaderboard />
          <LeaderboardPanel />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold text-primary-700">戦略カード</h2>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {strategyCards.map((card, index) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} p-5 shadow-lg backdrop-blur`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{card.emoji}</span>
                  <div className="font-semibold text-primary-800 leading-tight">{card.title}</div>
                </div>
                <div className="text-xs font-medium text-primary-500 mb-3">{card.details}</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mb-1">
                      <span>✅</span>
                      <span>メリット</span>
                    </div>
                    <ul className="text-xs text-primary-600 space-y-1 pl-4 list-disc">
                      {card.pros.map((pros, prosIndex) => (
                        <li key={`${card.key}-pro-${prosIndex}`}>{pros}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                      <span>⚠️</span>
                      <span>デメリット</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                      {card.cons.map((cons, consIndex) => (
                        <li key={`${card.key}-con-${consIndex}`}>{cons}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
