'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { TopBar } from './TopBar';
import { Canvas } from './Canvas';
import { ConfigPanel, PanelSection } from './ConfigPanel';
import { AnimationControls } from './AnimationControls';
import { PresetPicker } from './PresetPicker';
import { CodeSnippet } from './CodeSnippet';
import { MobileNotice } from './MobileNotice';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUrlState } from '@/hooks/useUrlState';
import { DemoFrame } from '@/components/demos/DemoFrame';
import { DEMOS } from '@/components/demos';
import type { AnimationConfig } from '@/lib/animation/types';
import { DEFAULT_TWEEN } from '@/lib/animation/defaults';

export function PlaygroundShell() {
  const { state, setState } = useUrlState();
  const [triggerKey, setTriggerKey] = useState(0);

  function setConfigA(next: AnimationConfig) {
    setState((s) => ({ ...s, configA: next }));
  }
  function setConfigB(next: AnimationConfig) {
    setState((s) => ({ ...s, configB: next }));
  }
  function swapConfigs() {
    setState((s) => ({ ...s, configA: s.configB ?? DEFAULT_TWEEN, configB: s.configA }));
  }

  const configB = state.configB ?? DEFAULT_TWEEN;
  const Demo = DEMOS[state.componentId];

  return (
    <>
      <MobileNotice />
      <div className="hidden h-screen flex-col md:flex">
        <TopBar
          componentId={state.componentId}
          onComponentChange={(id) => setState((s) => ({ ...s, componentId: id }))}
          sideBySide={state.sideBySide}
          onSideBySideChange={(next) =>
            setState((s) => ({ ...s, sideBySide: next, configB: s.configB ?? DEFAULT_TWEEN }))
          }
        />
        <div className="flex flex-1 overflow-hidden">
          <Canvas
            sideBySide={state.sideBySide}
            paneA={<DemoFrame key={triggerKey}><Demo config={state.configA} triggerKey={triggerKey} /></DemoFrame>}
            paneB={<DemoFrame key={triggerKey}><Demo config={configB} triggerKey={triggerKey} /></DemoFrame>}
            onReplay={() => setTriggerKey((k) => k + 1)}
            onSwap={swapConfigs}
          />
          <ConfigPanel>
            {state.sideBySide ? (
              <Tabs defaultValue="a">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="a">A</TabsTrigger>
                  <TabsTrigger value="b">B</TabsTrigger>
                </TabsList>
                <TabsContent value="a" className="mt-4">
                  <PanelTabContents
                    componentId={state.componentId}
                    config={state.configA}
                    onChange={setConfigA}
                  />
                </TabsContent>
                <TabsContent value="b" className="mt-4">
                  <PanelTabContents
                    componentId={state.componentId}
                    config={configB}
                    onChange={setConfigB}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <PanelTabContents
                componentId={state.componentId}
                config={state.configA}
                onChange={setConfigA}
              />
            )}
          </ConfigPanel>
        </div>
      </div>
    </>
  );
}

function PanelTabContents({
  componentId,
  config,
  onChange,
}: {
  componentId: import('@/components/demos/registry').ComponentId;
  config: AnimationConfig;
  onChange: (next: AnimationConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PanelSection title="Preset">
        <PresetPicker componentId={componentId} config={config} onChange={onChange} />
      </PanelSection>
      <PanelSection
        title="Animation"
        info={
          <TooltipProvider delay={200}>
            <Tooltip>
              <TooltipTrigger
                type="button"
                aria-label="What's the difference between tween and spring?"
                className="inline-flex"
              >
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px] text-xs leading-relaxed">
                <p className="font-semibold">Tween</p>
                <p>Set a duration (how long it takes) and an easing curve (the rhythm). Same every time. Use this when you want predictable, designed motion.</p>
                <p className="mt-2 font-semibold">Spring</p>
                <p>Physics-based. Set stiffness (snappy), damping (overshoot), and mass (heaviness). Duration emerges from the physics. Use this when you want motion that feels natural and responsive.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      >
        <AnimationControls config={config} onChange={onChange} />
      </PanelSection>
      <PanelSection title="Code">
        <CodeSnippet config={config} />
      </PanelSection>
    </div>
  );
}
