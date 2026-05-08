'use client';

import { useRef } from 'react';
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
import { TRIGGER_SHAPES, getOptionsKey } from '@/components/demos/registry';
import { DropdownOptionsPanel } from './options/DropdownOptions';
import { IconButtonOptionsPanel } from './options/IconButtonOptions';
import { TextButtonOptionsPanel } from './options/TextButtonOptions';
import { PopoverOptionsPanel } from './options/PopoverOptions';
import { SliderOptionsPanel } from './options/SliderOptions';
import { ToastOptionsPanel } from './options/ToastOptions';
import type { AnimationConfig } from '@/lib/animation/types';
import type { ComponentOptions } from '@/lib/component-options/types';
import { DEFAULT_DROPDOWN, DEFAULT_ICON_BUTTON, DEFAULT_TEXT_BUTTON, DEFAULT_POPOVER, DEFAULT_SLIDER, DEFAULT_TOAST } from '@/lib/component-options/defaults';
import type { DemoTriggerHandle } from '@/hooks/useDemoTrigger';
import { DEFAULT_TWEEN } from '@/lib/animation/defaults';

export function PlaygroundShell() {
  const { state, setState } = useUrlState();
  const refA = useRef<DemoTriggerHandle>(null);
  const refB = useRef<DemoTriggerHandle>(null);

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

  const triggerShape = TRIGGER_SHAPES[state.componentId];
  const footerTrigger = triggerShape === 'single'
    ? {
        kind: 'single' as const,
        label: 'Trigger both',
        onTrigger: () => {
          if (refA.current?.kind === 'single') refA.current.trigger();
          if (refB.current?.kind === 'single') refB.current.trigger();
        },
      }
    : {
        kind: 'dual' as const,
        primaryLabel: 'Add chip',
        secondaryLabel: 'Remove chip',
        onPrimary: () => {
          if (refA.current?.kind === 'dual') refA.current.primary();
          if (refB.current?.kind === 'dual') refB.current.primary();
        },
        onSecondary: () => {
          if (refA.current?.kind === 'dual') refA.current.secondary();
          if (refB.current?.kind === 'dual') refB.current.secondary();
        },
      };

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
            paneA={
              <DemoFrame componentId={state.componentId}>
                <Demo ref={refA} config={state.configA} options={state.componentOptionsA} />
              </DemoFrame>
            }
            paneB={
              <DemoFrame componentId={state.componentId}>
                <Demo ref={refB} config={configB} options={state.componentOptionsB ?? {}} />
              </DemoFrame>
            }
            footerTrigger={state.sideBySide ? footerTrigger : undefined}
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
                    options={state.componentOptionsA}
                    onOptionsChange={(next) => setState((s) => ({ ...s, componentOptionsA: next }))}
                  />
                </TabsContent>
                <TabsContent value="b" className="mt-4">
                  <PanelTabContents
                    componentId={state.componentId}
                    config={configB}
                    onChange={setConfigB}
                    options={state.componentOptionsB ?? {}}
                    onOptionsChange={(next) => setState((s) => ({ ...s, componentOptionsB: next }))}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <PanelTabContents
                componentId={state.componentId}
                config={state.configA}
                onChange={setConfigA}
                options={state.componentOptionsA}
                onOptionsChange={(next) => setState((s) => ({ ...s, componentOptionsA: next }))}
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
  options,
  onOptionsChange,
}: {
  componentId: import('@/components/demos/registry').ComponentId;
  config: AnimationConfig;
  onChange: (next: AnimationConfig) => void;
  options: Partial<ComponentOptions>;
  onOptionsChange: (next: Partial<ComponentOptions>) => void;
}) {
  const optionsKey = getOptionsKey(componentId);
  const optionsPanel = (() => {
    if (optionsKey === 'dropdown') {
      return (
        <DropdownOptionsPanel
          value={options.dropdown ?? DEFAULT_DROPDOWN}
          onChange={(next) => onOptionsChange({ ...options, dropdown: next })}
          config={config}
        />
      );
    }
    if (optionsKey === 'iconButton') {
      return (
        <IconButtonOptionsPanel
          value={options.iconButton ?? DEFAULT_ICON_BUTTON}
          onChange={(next) => onOptionsChange({ ...options, iconButton: next })}
        />
      );
    }
    if (optionsKey === 'textButton') {
      return (
        <TextButtonOptionsPanel
          value={options.textButton ?? DEFAULT_TEXT_BUTTON}
          onChange={(next) => onOptionsChange({ ...options, textButton: next })}
        />
      );
    }
    if (optionsKey === 'popover') {
      return (
        <PopoverOptionsPanel
          value={options.popover ?? DEFAULT_POPOVER}
          onChange={(next) => onOptionsChange({ ...options, popover: next })}
        />
      );
    }
    if (optionsKey === 'slider') {
      return (
        <SliderOptionsPanel
          value={options.slider ?? DEFAULT_SLIDER}
          onChange={(next) => onOptionsChange({ ...options, slider: next })}
        />
      );
    }
    if (optionsKey === 'toast') {
      return (
        <ToastOptionsPanel
          value={options.toast ?? DEFAULT_TOAST}
          onChange={(next) => onOptionsChange({ ...options, toast: next })}
        />
      );
    }
    return null;
  })();

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
      {optionsPanel && (
        <PanelSection title="Component options">{optionsPanel}</PanelSection>
      )}
      <PanelSection title="Code">
        <CodeSnippet config={config} />
      </PanelSection>
    </div>
  );
}
