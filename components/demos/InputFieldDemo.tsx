'use client';

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import type { DemoProps } from './index';

export default function InputFieldDemo({ config }: DemoProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const { isSpring, motionTransition, cssStyle } = useAnimationStyle(config);
  const floated = focused || value.length > 0;

  return (
    <div className="w-full max-w-xs">
      <div className="relative">
        <input
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="block w-full rounded-md border-2 bg-white px-3 pb-2 pt-5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{
            borderColor: focused ? '#18181b' : '#e4e4e7',
            ...(isSpring ? {} : { transition: 'border-color var(--duration) var(--easing)', ...cssStyle }),
          }}
        />
        {isSpring ? (
          <motion.label
            onClick={() => ref.current?.focus()}
            initial={false}
            animate={floated ? { y: -14, scale: 0.8, color: '#18181b' } : { y: 0, scale: 1, color: '#71717a' }}
            transition={motionTransition}
            className="absolute left-3 top-1/2 -translate-y-1/2 origin-top-left text-sm cursor-text"
          >
            Email
          </motion.label>
        ) : (
          <label
            onClick={() => ref.current?.focus()}
            className="absolute left-3 top-1/2 origin-top-left text-sm cursor-text"
            style={{
              transform: floated ? 'translateY(calc(-50% - 14px)) scale(0.8)' : 'translateY(-50%) scale(1)',
              color: floated ? '#18181b' : '#71717a',
              transition: 'transform var(--duration) var(--easing), color var(--duration) var(--easing)',
              ...cssStyle,
            }}
          >
            Email
          </label>
        )}
      </div>
    </div>
  );
}
