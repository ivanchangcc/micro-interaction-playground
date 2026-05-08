'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import { DEFAULT_ICON_BUTTON } from '@/lib/component-options/defaults';
import type { DemoProps } from './index';

const IconButtonDemo = forwardRef<DemoTriggerHandle, DemoProps>(function IconButtonDemo({ config, options }, ref) {
  const [liked, setLiked] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);
  const { hoverScale, pressScale } = options.iconButton ?? DEFAULT_ICON_BUTTON;

  useDemoTrigger(ref, () => ({
    kind: 'single',
    trigger: () => setLiked((v) => !v),
  }), []);

  const hoverTapTransition = isSpring
    ? motionTransition
    : { duration: 0.12, ease: 'easeOut' };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <motion.button
        type="button"
        onClick={() => setLiked((v) => !v)}
        aria-pressed={liked}
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: pressScale }}
        transition={hoverTapTransition}
        className="grid h-12 w-12 place-items-center rounded-full hover:bg-muted"
      >
        {isSpring ? (
          <motion.span
            animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
            transition={motionTransition}
            className="inline-flex"
          >
            <Heart
              className="h-6 w-6"
              fill={liked ? '#ef4444' : 'transparent'}
              color={liked ? '#ef4444' : 'currentColor'}
            />
          </motion.span>
        ) : (
          <span className="inline-flex">
            <Heart
              className="h-6 w-6"
              fill={liked ? '#ef4444' : 'transparent'}
              color={liked ? '#ef4444' : 'currentColor'}
              style={{
                transition: 'fill var(--duration) var(--easing), color var(--duration) var(--easing)',
                ...cssStyle,
              }}
            />
          </span>
        )}
      </motion.button>
    </div>
  );
});

export default IconButtonDemo;
