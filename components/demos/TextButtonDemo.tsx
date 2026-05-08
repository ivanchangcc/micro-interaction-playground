'use client';

import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import type { DemoProps } from './index';

const TextButtonDemo = forwardRef<DemoTriggerHandle, DemoProps>(function TextButtonDemo({ config }, ref) {
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  useDemoTrigger(ref, {
    kind: 'single',
    trigger: () => {},
  });

  if (isSpring) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#27272a' }}
          whileTap={{ scale: 0.96 }}
          transition={motionTransition}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Click me
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <button
        type="button"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-muted hover:scale-105 active:scale-95"
        style={{ transition: 'transform var(--duration) var(--easing), background-color var(--duration) var(--easing)', ...cssStyle }}
      >
        Click me
      </button>
    </div>
  );
});

export default TextButtonDemo;
