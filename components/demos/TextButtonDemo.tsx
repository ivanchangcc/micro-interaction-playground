'use client';

import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function TextButtonDemo({ config }: DemoProps) {
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  if (isSpring) {
    return (
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: '#27272a' }}
        whileTap={{ scale: 0.96 }}
        transition={motionTransition}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
      >
        Click me
      </motion.button>
    );
  }

  return (
    <button
      type="button"
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-muted hover:scale-105 active:scale-95"
      style={{ transition: 'transform var(--duration) var(--easing), background-color var(--duration) var(--easing)', ...cssStyle }}
    >
      Click me
    </button>
  );
}
