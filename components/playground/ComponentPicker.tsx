'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  COMPONENT_IDS,
  getComponentLabel,
  type ComponentId,
} from '@/components/demos/registry';

export function ComponentPicker({
  value,
  onChange,
}: {
  value: ComponentId;
  onChange: (id: ComponentId) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ComponentId)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COMPONENT_IDS.map((id) => (
          <SelectItem key={id} value={id}>
            {getComponentLabel(id)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
