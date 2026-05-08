'use client';

import { Slider as UISlider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { SLIDER_LIMITS } from '@/lib/animation/types';
import type { SliderOptions } from '@/lib/component-options/types';

type Props = {
  value: SliderOptions;
  onChange: (next: SliderOptions) => void;
};

export function SliderOptionsPanel({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label className="text-xs">Increment</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{value.increment}</span>
        </div>
        <UISlider
          value={[value.increment]}
          min={1} max={25} step={1}
          onValueChange={(arr) =>
            onChange({ ...value, increment: Array.isArray(arr) ? arr[0] : arr })}
        />
      </div>
      <div className="border-t pt-3" />
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Drag feel (spring)
      </div>
      <LabeledNum
        label="Stiffness"
        value={value.dragSpring.stiffness}
        min={SLIDER_LIMITS.stiffness.min} max={SLIDER_LIMITS.stiffness.max} step={1}
        onChange={(n) =>
          onChange({ ...value, dragSpring: { ...value.dragSpring, stiffness: n } })}
      />
      <LabeledNum
        label="Damping"
        value={value.dragSpring.damping}
        min={SLIDER_LIMITS.damping.min} max={SLIDER_LIMITS.damping.max} step={1}
        onChange={(n) =>
          onChange({ ...value, dragSpring: { ...value.dragSpring, damping: n } })}
      />
      <LabeledNum
        label="Mass"
        value={value.dragSpring.mass}
        min={SLIDER_LIMITS.mass.min} max={SLIDER_LIMITS.mass.max} step={0.1}
        onChange={(n) =>
          onChange({ ...value, dragSpring: { ...value.dragSpring, mass: n } })}
      />
    </div>
  );
}

function LabeledNum({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {Number(value.toFixed(2))}
        </span>
      </div>
      <UISlider
        value={[value]} min={min} max={max} step={step}
        onValueChange={(arr) => onChange(Array.isArray(arr) ? arr[0] : arr)}
      />
    </div>
  );
}
