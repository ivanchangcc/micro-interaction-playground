'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CubicBezier } from '@/lib/animation/types';

export function CubicBezierEditor({
  value,
  onChange,
}: {
  value: CubicBezier;
  onChange: (next: CubicBezier) => void;
}) {
  function setAt(i: number, raw: string) {
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    // X1 (i=0) and X2 (i=2) must be in [0,1] per CSS spec; Y values may exceed for overshoot
    const clamped = (i === 0 || i === 2) ? Math.min(1, Math.max(0, n)) : n;
    const next = [...value] as [number, number, number, number];
    next[i] = clamped;
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs">Cubic-bezier</Label>
      <div className="flex items-center gap-3">
        <BezierPreview points={value} />
        <div className="grid flex-1 grid-cols-2 gap-2">
          {value.map((n, i) => (
            <Input
              key={i}
              type="number"
              step="0.01"
              value={n}
              onChange={(e) => setAt(i, e.currentTarget.value)}
              className="h-8 text-xs"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BezierPreview({ points }: { points: CubicBezier }) {
  const [x1, y1, x2, y2] = points;
  const W = 80;
  const H = 80;
  const sx = (n: number) => n * W;
  const sy = (n: number) => H - n * H;
  return (
    <svg width={W} height={H} className="rounded border bg-muted/40">
      <line x1={0} y1={H} x2={W} y2={0} stroke="currentColor" strokeOpacity={0.1} />
      <path
        d={`M 0 ${H} C ${sx(x1)} ${sy(y1)}, ${sx(x2)} ${sy(y2)}, ${W} 0`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      />
    </svg>
  );
}
