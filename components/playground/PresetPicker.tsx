'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle } from 'lucide-react';
import { getPresets, type Preset } from '@/lib/animation/presets';
import type { ComponentId } from '@/components/demos/registry';
import type { AnimationConfig } from '@/lib/animation/types';

const CUSTOM = '__custom__';

export function PresetPicker({
  componentId,
  config,
  onChange,
}: {
  componentId: ComponentId;
  config: AnimationConfig;
  onChange: (next: AnimationConfig) => void;
}) {
  const presets = getPresets(componentId);
  const matching = findMatchingPreset(presets, config);
  const value = matching?.id ?? CUSTOM;
  const isBad = matching?.bad === true;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={(id) => {
          if (id === CUSTOM) return;
          const found = presets.find((p) => p.id === id);
          if (found) onChange(found.config);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presets.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="flex items-center gap-2">
                {p.bad && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                {p.name}
              </span>
            </SelectItem>
          ))}
          {!matching && <SelectItem value={CUSTOM}>Custom</SelectItem>}
        </SelectContent>
      </Select>
      {isBad && matching?.badReason && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[240px]">{matching.badReason}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

function findMatchingPreset(presets: Preset[], config: AnimationConfig): Preset | undefined {
  return presets.find((p) => deepEqual(p.config, config));
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
