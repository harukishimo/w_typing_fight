import type { ReactNode } from 'react';
import { GAME_CONSTANTS } from 'shared';

type HpGaugeProps = {
  label: string;
  hp: number;
  maxHp?: number;
  tone?: 'self' | 'opponent';
  footer?: ReactNode;
};

export function HpGauge({
  label,
  hp,
  maxHp = GAME_CONSTANTS.INITIAL_HP,
  tone = 'self',
  footer,
}: HpGaugeProps) {
  const clampedHp = Math.max(0, Math.min(maxHp, hp));
  const ratio = maxHp === 0 ? 0 : clampedHp / maxHp;
  const width = `${ratio * 100}%`;

  const gradientClass =
    tone === 'self'
      ? 'bg-gradient-to-r from-primary-400 to-primary-600'
      : 'bg-gradient-to-r from-rose-400 to-rose-600';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold text-primary-500">
        <span>{label}</span>
        <span className="text-[10px] uppercase tracking-wide">HP</span>
      </div>
      <div className="h-3 w-full rounded-full bg-primary-100 overflow-hidden">
        <div
          className={`${gradientClass} h-full transition-all duration-500 ease-out`}
          style={{ width }}
        />
      </div>
      {footer ? <div className="text-[10px] text-primary-400">{footer}</div> : null}
    </div>
  );
}
