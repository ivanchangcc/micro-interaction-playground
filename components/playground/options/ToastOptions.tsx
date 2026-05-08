'use client';

import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { ToastOptions, ToastDirection } from '@/lib/component-options/types';

const DIRECTIONS: { value: ToastDirection; label: string }[] = [
  { value: 'top-left',     label: 'Top left' },
  { value: 'top',          label: 'Top' },
  { value: 'top-right',    label: 'Top right' },
  { value: 'bottom-left',  label: 'Bottom left' },
  { value: 'bottom',       label: 'Bottom' },
  { value: 'bottom-right', label: 'Bottom right' },
];

type Props = {
  value: ToastOptions;
  onChange: (next: ToastOptions) => void;
};

export function ToastOptionsPanel({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">Direction</Label>
      <Select
        value={value.direction}
        onValueChange={(v) => onChange({ direction: v as ToastDirection })}
      >
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {DIRECTIONS.map(({ value: v, label }) => (
            <SelectItem key={v} value={v}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
