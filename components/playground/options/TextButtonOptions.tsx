'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { TextButtonOptions } from '@/lib/component-options/types';

type Props = {
  value: TextButtonOptions;
  onChange: (next: TextButtonOptions) => void;
};

export function TextButtonOptionsPanel({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label className="text-xs">Hover scale</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{value.hoverScale.toFixed(2)}</span>
        </div>
        <Slider
          value={[value.hoverScale]}
          min={1.0} max={1.5} step={0.01}
          onValueChange={(arr) => onChange({ ...value, hoverScale: Array.isArray(arr) ? arr[0] : arr })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label className="text-xs">Press scale</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{value.pressScale.toFixed(2)}</span>
        </div>
        <Slider
          value={[value.pressScale]}
          min={0.5} max={1.0} step={0.01}
          onValueChange={(arr) => onChange({ ...value, pressScale: Array.isArray(arr) ? arr[0] : arr })}
        />
      </div>
    </div>
  );
}
