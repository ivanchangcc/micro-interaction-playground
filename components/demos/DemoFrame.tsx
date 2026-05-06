'use client';

import type { ReactNode } from 'react';

export function DemoFrame({ children }: { children: ReactNode }) {
  return <div className="flex w-full max-w-md items-center justify-center">{children}</div>;
}
