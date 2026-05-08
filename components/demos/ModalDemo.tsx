'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function ModalDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      {isSpring ? (
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={motionTransition}
                className="absolute inset-0 bg-black/40"
                onClick={() => setOpen(false)}
              />
              <motion.div
                key="dialog"
                initial={{ opacity: 0, scale: 0.94, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={motionTransition}
                className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-xl"
              >
                <h3 className="text-sm font-semibold">Modal title</h3>
                <p className="mt-1 text-xs text-muted-foreground">Body text. Click outside to close.</p>
                <div className="mt-4 flex justify-end">
                  <Button size="sm" onClick={() => setOpen(false)}>Close</Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-black"
            style={{
              opacity: open ? 0.4 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transition: 'opacity var(--duration) var(--easing)',
              ...cssStyle,
            }}
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-xl"
            style={{
              opacity: open ? 1 : 0,
              transform: `translate(-50%, -50%) scale(${open ? 1 : 0.94}) translateY(${open ? 0 : 8}px)`,
              pointerEvents: open ? 'auto' : 'none',
              transition: 'opacity var(--duration) var(--easing), transform var(--duration) var(--easing)',
              ...cssStyle,
            }}
          >
            <h3 className="text-sm font-semibold">Modal title</h3>
            <p className="mt-1 text-xs text-muted-foreground">Body text. Click outside to close.</p>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={() => setOpen(false)}>Close</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
