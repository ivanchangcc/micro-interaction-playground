'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SideBySideToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch id="sbs" checked={value} onCheckedChange={onChange} />
      <Label htmlFor="sbs" className="text-sm font-normal">
        Side-by-side
      </Label>
    </div>
  );
}
