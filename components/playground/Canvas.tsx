'use client';

import { Button } from '@/components/ui/button';
import { Play, ArrowLeftRight, Plus, Minus } from 'lucide-react';
import { ReactNode, useRef, useState, useEffect } from 'react';
import { PaneContext } from '@/lib/pane-context';

type FooterTrigger =
  | { kind: 'single'; onTrigger: () => void; label: string }
  | { kind: 'dual'; onPrimary: () => void; primaryLabel: string; onSecondary: () => void; secondaryLabel: string };

type Props = {
  paneA: ReactNode;
  paneB?: ReactNode;
  sideBySide: boolean;
  footerTrigger?: FooterTrigger;
  onSwap?: () => void;
};

export function Canvas({ paneA, paneB, sideBySide, footerTrigger, onSwap }: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 overflow-hidden">
        {sideBySide ? (
          <>
            <Pane label="A">{paneA}</Pane>
            <div className="w-px bg-border" />
            <Pane label="B">{paneB}</Pane>
          </>
        ) : (
          <Pane>{paneA}</Pane>
        )}
      </div>
      {sideBySide && footerTrigger && (
        <div className="flex h-12 items-center justify-center gap-2 border-t bg-background">
          {footerTrigger.kind === 'single' ? (
            <Button size="sm" onClick={footerTrigger.onTrigger}>
              <Play className="mr-2 h-3.5 w-3.5" />
              {footerTrigger.label}
            </Button>
          ) : (
            <>
              <Button size="sm" onClick={footerTrigger.onPrimary}>
                <Plus className="mr-2 h-3.5 w-3.5" />
                {footerTrigger.primaryLabel}
              </Button>
              <Button size="sm" variant="outline" onClick={footerTrigger.onSecondary}>
                <Minus className="mr-2 h-3.5 w-3.5" />
                {footerTrigger.secondaryLabel}
              </Button>
            </>
          )}
          {onSwap && (
            <Button size="sm" variant="outline" onClick={onSwap}>
              <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
              Swap
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Pane({ label, children }: { label?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(ref.current);
  }, []);

  return (
    <div ref={ref} className="relative flex flex-1 items-center justify-center bg-muted/40 p-8">
      {label && (
        <div className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      )}
      <PaneContext.Provider value={container}>
        {children}
      </PaneContext.Provider>
    </div>
  );
}
