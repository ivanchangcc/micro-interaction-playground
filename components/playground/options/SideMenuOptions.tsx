'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type {
  SideMenuOptions, SideMenuKind, SideMenuSide,
} from '@/lib/component-options/types';
import type { AnimationConfig } from '@/lib/animation/types';

const KINDS: { value: SideMenuKind; label: string }[] = [
  { value: 'slide',    label: 'Slide' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'scale',    label: 'Scale' },
  { value: 'push',     label: 'Push' },
];

type Props = {
  value: SideMenuOptions;
  onChange: (next: SideMenuOptions) => void;
  config: AnimationConfig;
};

export function SideMenuOptionsPanel({ value, onChange, config }: Props) {
  const isSpring = config.type === 'spring';
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Side</Label>
        <Select
          value={value.side}
          onValueChange={(v) => onChange({ ...value, side: v as SideMenuSide })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Animation</Label>
        <Select
          value={value.kind}
          onValueChange={(v) => onChange({ ...value, kind: v as SideMenuKind })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {KINDS.map(({ value: v, label }) => (
              <SelectItem key={v} value={v}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Bounce</Label>
        {isSpring ? (
          <Switch
            checked={value.bounce}
            onCheckedChange={(b) => onChange({ ...value, bounce: b })}
          />
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
      <div className="flex items-center justify-between">
        <Label className="text-xs">Layered</Label>
        <Switch
          checked={value.layered}
          onCheckedChange={(b) => onChange({ ...value, layered: b })}
        />
      </div>
    </div>
  );
}
