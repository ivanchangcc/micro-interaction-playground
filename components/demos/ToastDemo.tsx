'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function ToastDemo({ config, triggerKey }: DemoProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  function show() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 2400);
  }

  return (
    <div className="relative h-[880px] w-[390px] overflow-hidden rounded-[20px] border-2 bg-zinc-50">
      <div className="absolute inset-x-0 top-0 h-7 bg-zinc-100 text-center text-[10px] leading-7 text-muted-foreground">
        Phone preview
      </div>
      <div className="flex h-full items-center justify-center">
        <Button size="sm" onClick={show}>Show toast</Button>
      </div>
      {isSpring ? (
        <AnimatePresence>
          {visible && (
            <motion.div
              key={triggerKey}
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 200 }}
              transition={motionTransition}
              className="absolute right-3 top-10 w-[200px] rounded-md bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg"
            >
              Saved successfully.
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div
          key={triggerKey}
          className="absolute right-3 top-10 w-[200px] rounded-md bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{
            opacity: visible ? 1 : 0,
            transform: `translateX(${visible ? 0 : 200}px)`,
            transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          Saved successfully.
        </div>
      )}
    </div>
  );
}
