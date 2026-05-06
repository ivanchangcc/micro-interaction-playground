'use client';

import { ReactNode } from 'react';

export function ConfigPanel({ children }: { children: ReactNode }) {
  return (
    <aside className="flex w-[320px] flex-col gap-6 overflow-y-auto border-l bg-background p-5">
      {children}
    </aside>
  );
}

export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}
