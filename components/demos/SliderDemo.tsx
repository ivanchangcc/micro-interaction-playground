'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import type { DemoProps } from './index';

const SliderDemo = forwardRef<DemoTriggerHandle, DemoProps>(function SliderDemo({ config }, ref) {
  const [target, setTarget] = useState(40);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  useDemoTrigger(ref, {
    kind: 'single',
    trigger: () => {},
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <input
        type="range"
        min={0}
        max={100}
        value={target}
        onChange={(e) => setTarget(Number(e.currentTarget.value))}
        className="w-full [accent-color:#18181b]"
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
});

export default SliderDemo;
