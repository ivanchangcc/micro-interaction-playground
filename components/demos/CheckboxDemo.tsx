'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import type { DemoProps } from './index';

const CheckboxDemo = forwardRef<DemoTriggerHandle, DemoProps>(function CheckboxDemo({ config }, ref) {
  const [checked, setChecked] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  useDemoTrigger(ref, () => ({
    kind: 'single',
    trigger: () => setChecked((v) => !v),
  }), []);

  return (
    <div className="flex h-full w-full items-center justify-center">
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => setChecked((v) => !v)}
      className="flex h-7 w-7 items-center justify-center rounded border-2"
      style={{
        backgroundColor: checked ? '#18181b' : 'transparent',
        borderColor: checked ? '#18181b' : '#a1a1aa',
        ...(isSpring ? {} : { transition: 'background-color var(--duration) var(--easing), border-color var(--duration) var(--easing)', ...cssStyle }),
      }}
    >
      {isSpring ? (
        <motion.span
          initial={false}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={motionTransition}
          className="text-white"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </motion.span>
      ) : (
        <span
          className="text-white"
          style={{
            transform: `scale(${checked ? 1 : 0})`,
            opacity: checked ? 1 : 0,
            transition: 'transform var(--duration) var(--easing), opacity var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}
    </button>
    </div>
  );
});

export default CheckboxDemo;
