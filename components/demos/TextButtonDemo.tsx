'use client';

import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import { DEFAULT_TEXT_BUTTON } from '@/lib/component-options/defaults';
import type { DemoProps } from './index';

const TextButtonDemo = forwardRef<DemoTriggerHandle, DemoProps>(function TextButtonDemo({ config, options }, ref) {
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);
  const { hoverScale, pressScale } = options.textButton ?? DEFAULT_TEXT_BUTTON;

  useDemoTrigger(ref, () => ({
    kind: 'single',
    trigger: () => {},
  }), []);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <motion.button
        type="button"
        whileHover={{ scale: hoverScale, backgroundColor: '#27272a' }}
        whileTap={{ scale: pressScale }}
        transition={isSpring ? motionTransition : { duration: 0.15, ease: 'easeOut' }}
        style={isSpring ? undefined : cssStyle}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
      >
        Click me
      </motion.button>
    </div>
  );
});

export default TextButtonDemo;
