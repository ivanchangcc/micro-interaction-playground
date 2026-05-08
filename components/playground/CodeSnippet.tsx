'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, Check } from 'lucide-react';
import type { AnimationConfig } from '@/lib/animation/types';
import { configToCssTransition, NAMED_TO_MOTION } from '@/lib/animation/apply';

export function CodeSnippet({ config }: { config: AnimationConfig }) {
  const css =
    config.type === 'tween'
      ? `transition: ${configToCssTransition(config)};`
      : '/* spring — use Motion */';

  const motion =
    config.type === 'spring'
      ? `<motion.div\n  transition={{ type: 'spring', stiffness: ${config.stiffness}, damping: ${config.damping}, mass: ${config.mass} }}\n/>`
      : `<motion.div\n  transition={{ type: 'tween', duration: ${(config.duration / 1000).toFixed(2)}, ease: ${formatEase(config.easing)} }}\n/>`;

  return (
    <Tabs defaultValue="css">
      <TabsList className="h-7">
        <TabsTrigger value="css" className="text-xs">CSS</TabsTrigger>
        <TabsTrigger value="motion" className="text-xs">Motion</TabsTrigger>
      </TabsList>
      <TabsContent value="css">
        <SnippetBlock code={css} />
      </TabsContent>
      <TabsContent value="motion">
        <SnippetBlock code={motion} />
      </TabsContent>
    </Tabs>
  );
}

function formatEase(easing: { cubicBezier: readonly number[] } | string): string {
  return typeof easing === 'string'
    ? `'${ease(easing)}'`
    : `[${Array.from(easing.cubicBezier).join(', ')}]`;
}

function ease(name: string): string {
  return (NAMED_TO_MOTION[name] ?? 'easeInOut') as string;
}

function SnippetBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded border bg-muted/40 p-2 text-[11px] leading-snug">
        <code>{code}</code>
      </pre>
      <Button size="icon" variant="secondary" className="absolute right-1 top-1 h-6 w-6 bg-muted hover:bg-muted/80" onClick={copy}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
}
