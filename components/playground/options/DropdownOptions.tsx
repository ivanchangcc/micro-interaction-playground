'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { DropdownOptions } from '@/lib/component-options/types';
import type { AnimationConfig } from '@/lib/animation/types';

type Props = {
  value: DropdownOptions;
  onChange: (next: DropdownOptions) => void;
  config: AnimationConfig;
};

export function DropdownOptionsPanel({ value, onChange, config }: Props) {
  const isSpring = config.type === 'spring';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Bounce</Label>
        {isSpring ? (
          <Switch checked={value.bounce} onCheckedChange={(b) => onChange({ ...value, bounce: b })} />
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Switch checked={false} disabled />
              </TooltipTrigger>
              <TooltipContent>Bounce requires spring animation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
