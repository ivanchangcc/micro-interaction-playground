'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EasingSelect } from './EasingSelect';
import { CubicBezierEditor } from './CubicBezierEditor';
import type { AnimationConfig, EasingValue } from '@/lib/animation/types';
import { SLIDER_LIMITS } from '@/lib/animation/types';
import { DEFAULT_TWEEN, DEFAULT_SPRING } from '@/lib/animation/defaults';

type Props = {
  config: AnimationConfig;
  onChange: (next: AnimationConfig) => void;
};

export function AnimationControls({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
        <Button
          variant={config.type === 'tween' ? 'default' : 'ghost'}
          size="sm"
          className="h-7"
          onClick={() => onChange(config.type === 'tween' ? config : DEFAULT_TWEEN)}
        >
          Tween
        </Button>
        <Button
          variant={config.type === 'spring' ? 'default' : 'ghost'}
          size="sm"
          className="h-7"
          onClick={() => onChange(config.type === 'spring' ? config : DEFAULT_SPRING)}
        >
          Spring
        </Button>
      </div>

      {config.type === 'tween' ? (
        <TweenFields config={config} onChange={onChange} />
      ) : (
        <SpringFields config={config} onChange={onChange} />
      )}
    </div>
  );
}

function TweenFields({
  config,
  onChange,
}: {
  config: Extract<AnimationConfig, { type: 'tween' }>;
  onChange: (next: AnimationConfig) => void;
}) {
  function setEasing(next: EasingValue | 'custom') {
    if (next === 'custom') {
      onChange({ ...config, easing: { cubicBezier: [0.4, 0, 0.2, 1] } });
    } else {
      onChange({ ...config, easing: next });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <LabeledSlider
        label="Duration"
        value={config.duration}
        unit="ms"
        min={SLIDER_LIMITS.duration.min}
        max={SLIDER_LIMITS.duration.max}
        step={10}
        onChange={(v) => onChange({ ...config, duration: v })}
      />
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Easing</Label>
        <EasingSelect value={config.easing} onChange={setEasing} />
      </div>
      {typeof config.easing !== 'string' && (
        <CubicBezierEditor
          value={config.easing.cubicBezier}
          onChange={(cb) => onChange({ ...config, easing: { cubicBezier: cb } })}
        />
      )}
    </div>
  );
}

function SpringFields({
  config,
  onChange,
}: {
  config: Extract<AnimationConfig, { type: 'spring' }>;
  onChange: (next: AnimationConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <LabeledSlider
        label="Stiffness"
        value={config.stiffness}
        min={SLIDER_LIMITS.stiffness.min}
        max={SLIDER_LIMITS.stiffness.max}
        step={1}
        onChange={(v) => onChange({ ...config, stiffness: v })}
      />
      <LabeledSlider
        label="Damping"
        value={config.damping}
        min={SLIDER_LIMITS.damping.min}
        max={SLIDER_LIMITS.damping.max}
        step={1}
        onChange={(v) => onChange({ ...config, damping: v })}
      />
      <LabeledSlider
        label="Mass"
        value={config.mass}
        min={SLIDER_LIMITS.mass.min}
        max={SLIDER_LIMITS.mass.max}
        step={0.1}
        onChange={(v) => onChange({ ...config, mass: v })}
      />
    </div>
  );
}

function LabeledSlider({
  label, value, unit = '', min, max, step, onChange,
}: {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {Number(value.toFixed(2))}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(arr) => onChange(Array.isArray(arr) ? arr[0] : arr)}
      />
    </div>
  );
}
