'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import type { DemoProps } from './index';

const ToggleDemo = forwardRef<DemoTriggerHandle, DemoProps>(function ToggleDemo({ config }, ref) {
  const [on, setOn] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  useDemoTrigger(ref, {
    kind: 'single',
    trigger: () => setOn((v) => !v),
  });

  return (
    <div className="flex h-full w-full items-center justify-center">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className="relative h-8 w-14 rounded-full"
        style={{
          backgroundColor: on ? '#18181b' : '#d4d4d8',
          ...(isSpring ? {} : { transition: 'background-color var(--duration) var(--easing)', ...cssStyle }),
        }}
      >
        {isSpring ? (
          <motion.span
            className="absolute top-1 block h-6 w-6 rounded-full bg-white shadow"
            animate={{ x: on ? 28 : 4 }}
            transition={motionTransition}
          />
        ) : (
          <span
            className="absolute top-1 block h-6 w-6 rounded-full bg-white shadow"
            style={{
              transform: `translateX(${on ? 28 : 4}px)`,
              transition: 'transform var(--duration) var(--easing)',
              ...cssStyle,
            }}
          />
        )}
      </button>
    </div>
  );
});

export default ToggleDemo;
