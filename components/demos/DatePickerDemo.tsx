'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DatePickerDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const [monthIdx, setMonthIdx] = useState(4);
  const [direction, setDirection] = useState(0);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  function move(delta: number) {
    setDirection(delta);
    setMonthIdx((m) => (m + delta + 12) % 12);
  }

  return (
    <div className="relative">
      <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
        <Calendar className="mr-2 h-3.5 w-3.5" />
        {MONTHS[monthIdx]} 2026
      </Button>
      {open && (
        <div
          className="absolute left-0 top-full z-10 mt-2 w-[260px] origin-top overflow-hidden rounded-md border bg-white p-3 shadow"
          style={isSpring ? undefined : { transition: 'all var(--duration) var(--easing)', ...cssStyle }}
        >
          <div className="mb-2 flex items-center justify-between">
            <button onClick={() => move(-1)} className="rounded p-1 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
            <div className="relative h-5 w-24 overflow-hidden text-center text-sm font-medium">
              {isSpring ? (
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={monthIdx}
                    custom={direction}
                    initial={{ x: direction * 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -direction * 30, opacity: 0 }}
                    transition={motionTransition}
                    className="absolute inset-0"
                  >
                    {MONTHS[monthIdx]} 2026
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0">{MONTHS[monthIdx]} 2026</div>
              )}
            </div>
            <button onClick={() => move(1)} className="rounded p-1 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="rounded p-1 hover:bg-muted">{i + 1}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
