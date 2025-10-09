import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  count: number | null;
};

export function Countdown({ count }: Props) {
  if (count === null || count < 0) return null;

  return (
    <AnimatePresence mode="wait">
      {count > 0 && (
        <motion.div
          key={count}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-9xl font-bold text-white drop-shadow-2xl"
          >
            {count}
          </motion.div>
        </motion.div>
      )}
      {count === 0 && (
        <motion.div
          key="start"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-9xl font-bold text-primary-400 drop-shadow-2xl"
          >
            START!
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
