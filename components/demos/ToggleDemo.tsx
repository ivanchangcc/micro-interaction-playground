'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function ToggleDemo({ config }: DemoProps) {
  const [on, setOn] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
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
          animate={{ x: on ? 24 : 4 }}
          transition={motionTransition}
        />
      ) : (
        <span
          className="absolute top-1 block h-6 w-6 rounded-full bg-white shadow"
          style={{
            transform: `translateX(${on ? 24 : 4}px)`,
            transition: 'transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        />
      )}
    </button>
  );
}
