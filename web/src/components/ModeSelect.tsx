import { motion } from 'framer-motion';

type Props = {
  onSelectSolo: () => void;
  onSelectMatch: () => void;
};

export function ModeSelect({ onSelectSolo, onSelectMatch }: Props) {
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

        <div className="grid md:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}
