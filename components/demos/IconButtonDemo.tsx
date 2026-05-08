'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function IconButtonDemo({ config }: DemoProps) {
  const [liked, setLiked] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <button
      type="button"
      onClick={() => setLiked((v) => !v)}
      aria-pressed={liked}
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
    </button>
  );
}
