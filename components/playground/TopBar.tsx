'use client';

import { ComponentPicker } from './ComponentPicker';
import { SideBySideToggle } from './SideBySideToggle';
import { ShareButton } from './ShareButton';
import type { ComponentId } from '@/components/demos/registry';

type Props = {
  componentId: ComponentId;
  onComponentChange: (id: ComponentId) => void;
  sideBySide: boolean;
  onSideBySideChange: (next: boolean) => void;
};

export function TopBar(props: Props) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <div className="text-sm font-semibold">Micro-interaction Playground</div>
      <div className="flex-1" />
      <ComponentPicker value={props.componentId} onChange={props.onComponentChange} />
      <SideBySideToggle value={props.sideBySide} onChange={props.onSideBySideChange} />
      <ShareButton />
    </header>
  );
}
