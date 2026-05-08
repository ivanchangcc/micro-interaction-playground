'use client';

import { forwardRef, useState } from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { Button } from '@/components/ui/button';
import { useAnimationStyle } from '@/hooks/useAnimationStyle';
import { useDemoTrigger, type DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import { usePaneContainer } from '@/lib/pane-context';
import type { DemoProps } from './index';
import type { PopoverPosition } from '@/lib/component-options/types';

const POSITION_TO_PLACEMENT: Record<
  PopoverPosition,
  { side: 'top' | 'bottom' | 'left' | 'right'; align: 'start' | 'center' | 'end' }
> = {
  'top-left':     { side: 'top',    align: 'start' },
  'top':          { side: 'top',    align: 'center' },
  'top-right':    { side: 'top',    align: 'end' },
  'left':         { side: 'left',   align: 'center' },
  'right':        { side: 'right',  align: 'center' },
  'bottom-left':  { side: 'bottom', align: 'start' },
  'bottom':       { side: 'bottom', align: 'center' },
  'bottom-right': { side: 'bottom', align: 'end' },
};

const PopoverDemo = forwardRef<DemoTriggerHandle, DemoProps>(function PopoverDemo({ config, options }, ref) {
  const [open, setOpen] = useState(false);
  const { isSpring, cssStyle } = useAnimationStyle(config);
  const paneContainer = usePaneContainer();

  const position = options?.popover?.position ?? 'bottom';
  const placement = POSITION_TO_PLACEMENT[position];

  useDemoTrigger(ref, () => ({
    kind: 'single',
    trigger: () => setOpen((v) => !v),
  }), []);

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
    <div className="flex h-full w-full items-center justify-center">
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
          side={placement.side}
          align={placement.align}
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
            className="w-56 rounded-md border bg-white p-3 text-sm shadow-md
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
    </div>
  );
});

export default PopoverDemo;
