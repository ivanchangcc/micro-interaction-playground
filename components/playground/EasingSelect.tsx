'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EasingValue } from '@/lib/animation/types';

const NAMED = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'] as const;

export function EasingSelect({
  value,
  onChange,
}: {
  value: EasingValue;
  onChange: (next: EasingValue | 'custom') => void;
}) {
  const current = typeof value === 'string' ? value : 'custom';
  return (
    <Select
      value={current}
      onValueChange={(v) => {
        if (v === 'custom') onChange('custom');
        else onChange(v as EasingValue);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {NAMED.map((n) => (
          <SelectItem key={n} value={n}>{n}</SelectItem>
        ))}
        <SelectItem value="custom">Custom…</SelectItem>
      </SelectContent>
    </Select>
  );
}
