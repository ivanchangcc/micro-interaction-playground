'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

const STEPS = ['Account', 'Profile', 'Done'];

export default function StepperDemo({ config }: DemoProps) {
  const [step, setStep] = useState(0);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="flex w-full items-center">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-medium"
                  style={{
                    backgroundColor: done || current ? '#18181b' : 'white',
                    borderColor: done || current ? '#18181b' : '#a1a1aa',
                    color: done || current ? 'white' : '#71717a',
                    ...(isSpring ? {} : { transition: 'background-color var(--duration) var(--easing), border-color var(--duration) var(--easing), color var(--duration) var(--easing)', ...cssStyle }),
                  }}
                >
                  {done ? (isSpring ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={motionTransition}><Check className="h-3.5 w-3.5" /></motion.span> : <Check className="h-3.5 w-3.5" />) : i + 1}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="mx-2 h-px flex-1 bg-border" />}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        <Button size="sm" disabled={step === STEPS.length - 1} onClick={() => setStep((s) => s + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
