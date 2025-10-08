/**
 * 難易度選択画面コンポーネント
 */

import { motion } from 'framer-motion';
import type { Difficulty } from 'shared';
import { DIFFICULTY_CONFIG } from 'shared';
import { useGameStore } from '@/store/gameStore';

type Props = {
  onBack?: () => void;
};

type SelectableDifficulty = Exclude<Difficulty, 'SCORE'>;

export function DifficultySelect({ onBack }: Props) {
  const { setDifficulty, startGame } = useGameStore();

  const handleSelect = (difficulty: Difficulty) => {
    setDifficulty(difficulty);
    startGame();
  };

  const difficulties: SelectableDifficulty[] = ['EASY', 'NORMAL', 'HARD'];

  const difficultyInfo: Record<SelectableDifficulty, {
    emoji: string;
    title: string;
    subtitle: string;
    description: string;
    details: string;
    color: string;
    hoverColor: string;
  }> = {
    EASY: {
      emoji: '🟢',
      title: 'EASY',
      subtitle: '手数重視',
      description: '短文で素早く攻撃',
      details: `${DIFFICULTY_CONFIG.EASY.charRange[0]}-${DIFFICULTY_CONFIG.EASY.charRange[1]}文字 / ダメージ: ${DIFFICULTY_CONFIG.EASY.baseDamage} / コンボ上限: ${DIFFICULTY_CONFIG.EASY.maxCombo}`,
      color: 'from-green-400 to-green-600',
      hoverColor: 'hover:from-green-500 hover:to-green-700',
    },
    NORMAL: {
      emoji: '🟡',
      title: 'NORMAL',
      subtitle: 'バランス型',
      description: '安定した戦い方',
      details: `${DIFFICULTY_CONFIG.NORMAL.charRange[0]}-${DIFFICULTY_CONFIG.NORMAL.charRange[1]}文字 / ダメージ: ${DIFFICULTY_CONFIG.NORMAL.baseDamage} / コンボ上限: ${DIFFICULTY_CONFIG.NORMAL.maxCombo}`,
      color: 'from-yellow-400 to-yellow-600',
      hoverColor: 'hover:from-yellow-500 hover:to-yellow-700',
    },
    HARD: {
      emoji: '🔴',
      title: 'HARD',
      subtitle: '一撃必殺',
      description: '長文で大ダメージ',
      details: `${DIFFICULTY_CONFIG.HARD.charRange[0]}-${DIFFICULTY_CONFIG.HARD.charRange[1]}文字 / ダメージ: ${DIFFICULTY_CONFIG.HARD.baseDamage} / コンボ上限: ${DIFFICULTY_CONFIG.HARD.maxCombo}`,
      color: 'from-red-400 to-red-600',
      hoverColor: 'hover:from-red-500 hover:to-red-700',
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {onBack && (
          <div className="mb-6">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm rounded-lg bg-white text-primary-600 shadow hover:bg-primary-100"
            >
              ← モード選択へ
            </button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold text-primary-800 mb-4">
            Type Fighter
          </h1>
          <p className="text-xl text-primary-700">
            あなたの戦略を選べ！
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {difficulties.map((difficulty, index) => {
            const info = difficultyInfo[difficulty];
            return (
              <motion.button
                key={difficulty}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(difficulty)}
                className={`
                  bg-gradient-to-br ${info.color} ${info.hoverColor}
                  text-white rounded-2xl p-8 shadow-2xl
                  transition-all duration-300
                  hover:shadow-3xl
                `}
              >
                <div className="text-6xl mb-4">{info.emoji}</div>
                <h2 className="text-3xl font-bold mb-2">{info.title}</h2>
                <p className="text-lg font-semibold mb-3 opacity-90">
                  {info.subtitle}
                </p>
                <p className="text-sm mb-4 opacity-80">
                  {info.description}
                </p>
                <div className="text-xs opacity-70 leading-relaxed">
                  {info.details}
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-primary-700"
        >
          <p className="text-sm">
            💡 Tip: 難易度によって戦略が変わります。手数で攻めるか、一撃で仕留めるか？
          </p>
        </motion.div>
      </div>
    </div>
  );
}
