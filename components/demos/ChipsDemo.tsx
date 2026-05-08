'use client';

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import type { DemoProps } from './index';

const SEED = ['design', 'animation', 'react', 'product', 'frontend'];

const ChipsDemo = forwardRef<DemoTriggerHandle, DemoProps>(function ChipsDemo({ config }, ref) {
  const [chips, setChips] = useState<string[]>(SEED);
  const [pool, setPool] = useState<string[]>(['css', 'spring', 'ux', 'tailwind']);
  const { motionTransition } = useAnimationStyle(config);

  function remove(label: string) {
    setChips((cs) => cs.filter((c) => c !== label));
    setPool((p) => (p.includes(label) ? p : [...p, label]));
  }
  function add(label: string) {
    setChips((cs) => (cs.includes(label) ? cs : [...cs, label]));
    setPool((p) => p.filter((c) => c !== label));
  }

  useDemoTrigger(ref, () => ({
    kind: 'dual',
    primaryLabel: 'Add chip',
    primary: () => {
      setPool((currentPool) => {
        if (currentPool.length === 0) return currentPool;
        const label = currentPool[0];
        setChips((cs) => (cs.includes(label) ? cs : [...cs, label]));
        return currentPool.slice(1);
      });
    },
    secondaryLabel: 'Remove chip',
    secondary: () => {
      setChips((currentChips) => {
        if (currentChips.length === 0) return currentChips;
        const label = currentChips[currentChips.length - 1];
        setPool((p) => (p.includes(label) ? p : [...p, label]));
        return currentChips.slice(0, -1);
      });
    },
  }), []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {chips.map((label) => (
            <motion.button
              key={label}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={motionTransition}
              onClick={() => remove(label)}
              className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs"
            >
              {label}
              <X className="h-3 w-3" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Add</span>
        <div className="flex flex-wrap gap-2">
          {pool.map((label) => (
            <Button
              key={label}
              size="sm"
              variant="outline"
              className="h-7 rounded-full text-xs"
              onClick={() => add(label)}
            >
              <Plus className="mr-1 h-3 w-3" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ChipsDemo;
