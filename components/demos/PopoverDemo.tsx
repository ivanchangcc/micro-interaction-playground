'use client';

import { useState } from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { usePaneContainer } from '@/lib/pane-context';
import type { DemoProps } from './index';

export default function PopoverDemo({ config }: DemoProps) {
  const [open, setOpen] = useState(false);
  const { isSpring, cssStyle } = useAnimationStyle(config);
  const paneContainer = usePaneContainer();

  // Duration/easing for tween mode, expressed as CSS custom props
  const durationMs =
    !isSpring && 'duration' in config ? `${config.duration}ms` : '200ms';
  const easing =
    !isSpring && 'easing' in config
      ? typeof config.easing === 'string'
        ? config.easing
        : `cubic-bezier(${(config.easing as { cubicBezier: readonly number[] }).cubicBezier.join(',')})`
      : 'ease';

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        render={
          <Button size="sm">
            {open ? 'Close popover' : 'Open popover'}
          </Button>
        }
      />
      <PopoverPrimitive.Portal container={paneContainer ?? undefined}>
        <PopoverPrimitive.Positioner
          side="bottom"
          sideOffset={8}
          className="isolate z-50"
        >
          <PopoverPrimitive.Popup
            style={
              isSpring
                ? undefined
                : ({
                    '--duration': durationMs,
                    '--easing': easing,
                    ...cssStyle,
                  } as React.CSSProperties)
            }
            className="w-56 origin-top rounded-md border bg-white p-3 text-sm shadow-md
              data-[starting-style]:opacity-0 data-[starting-style]:scale-95
              data-[ending-style]:opacity-0 data-[ending-style]:scale-95
              transition-[opacity,transform] duration-[var(--duration,200ms)] ease-[var(--easing,ease)]"
          >
            <p className="font-medium">Popover content</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Watch the scale + opacity origin point.
            </p>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
