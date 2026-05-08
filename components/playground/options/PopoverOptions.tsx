'use client';

import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { PopoverOptions, PopoverPosition } from '@/lib/component-options/types';

const POSITIONS: { value: PopoverPosition; label: string }[] = [
  { value: 'top-left',     label: 'Top left' },
  { value: 'top',          label: 'Top' },
  { value: 'top-right',    label: 'Top right' },
  { value: 'left',         label: 'Left' },
  { value: 'right',        label: 'Right' },
  { value: 'bottom-left',  label: 'Bottom left' },
  { value: 'bottom',       label: 'Bottom' },
  { value: 'bottom-right', label: 'Bottom right' },
];

type Props = {
  value: PopoverOptions;
  onChange: (next: PopoverOptions) => void;
};

export function PopoverOptionsPanel({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">Position</Label>
      <Select
        value={value.position}
        onValueChange={(v) => onChange({ position: v as PopoverPosition })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {POSITIONS.map(({ value: v, label }) => (
            <SelectItem key={v} value={v}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
