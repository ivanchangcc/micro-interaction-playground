'use client';

import { ReactNode } from 'react';

export function ConfigPanel({ children }: { children: ReactNode }) {
  return (
    <aside className="flex w-[320px] flex-col gap-6 overflow-y-auto border-l bg-background p-5">
      {children}
    </aside>
  );
}

export function PanelSection({
  title,
  info,
  children,
}: {
  title: string;
  info?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{title}</span>
        {info}
      </h3>
      {children}
    </section>
  );
}
