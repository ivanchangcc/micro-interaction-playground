'use client';

import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function IconButtonDemo({ config }: DemoProps) {
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  if (isSpring) {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={motionTransition}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow ring-1 ring-border"
      >
        <Heart className="h-5 w-5" />
      </motion.button>
    );
  }

  return (
    <button
      type="button"
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow ring-1 ring-border hover:scale-110 active:scale-90"
      style={{ transition: 'transform var(--duration) var(--easing)', ...cssStyle }}
    >
      <Heart className="h-5 w-5" />
    </button>
  );
}
