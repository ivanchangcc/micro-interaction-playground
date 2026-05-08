'use client';

import type { ReactNode } from 'react';
import { PaneScaler } from '@/components/playground/PaneScaler';
import { getLogicalSize, type ComponentId } from '@/components/demos/registry';

export function DemoFrame({
  componentId,
  children,
}: {
  componentId: ComponentId;
  children: ReactNode;
}) {
  const size = getLogicalSize(componentId);
  return (
    <PaneScaler width={size.width} height={size.height}>
      {children}
    </PaneScaler>
  );
}
