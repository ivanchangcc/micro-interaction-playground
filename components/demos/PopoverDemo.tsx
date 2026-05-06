'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function PopoverDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="relative">
      <Button size="sm" onClick={() => setOpen((v) => !v)}>
        {open ? 'Close popover' : 'Open popover'}
      </Button>
      {isSpring ? (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={motionTransition}
              className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 origin-top rounded-md border bg-white p-3 text-sm shadow-md"
            >
              <p className="font-medium">Popover content</p>
              <p className="mt-1 text-xs text-muted-foreground">Watch the scale + opacity origin point.</p>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div
          className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 origin-top rounded-md border bg-white p-3 text-sm shadow-md"
          style={{
            opacity: open ? 1 : 0,
            transform: `translateX(-50%) scale(${open ? 1 : 0.9}) translateY(${open ? 0 : -4}px)`,
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
            ...cssStyle,
          }}
        >
          <p className="font-medium">Popover content</p>
          <p className="mt-1 text-xs text-muted-foreground">Watch the scale + opacity origin point.</p>
        </div>
      )}
    </div>
  );
}
