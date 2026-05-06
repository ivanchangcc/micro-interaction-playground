'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function SliderDemo({ config }: DemoProps) {
  const [target, setTarget] = useState(40);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <input
        type="range"
        min={0}
        max={100}
        value={target}
        onChange={(e) => setTarget(Number(e.currentTarget.value))}
        className="w-full"
      />
      <div className="relative h-1 w-full rounded-full bg-zinc-200">
        {isSpring ? (
          <motion.div
            className="absolute -top-1.5 h-4 w-4 rounded-full bg-foreground"
            animate={{ left: `calc(${target}% - 8px)` }}
            transition={motionTransition}
          />
        ) : (
          <div
            className="absolute -top-1.5 h-4 w-4 rounded-full bg-foreground"
            style={{
              left: `calc(${target}% - 8px)`,
              transition: 'left var(--duration) var(--easing)',
              ...cssStyle,
            }}
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground">Drag the input above; the visual thumb catches up using the configured animation.</p>
    </div>
  );
}
