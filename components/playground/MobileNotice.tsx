export function MobileNotice() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-8 text-center md:hidden">
      <h1 className="text-lg font-semibold">Best viewed on desktop</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The playground panel needs more room than a phone screen has. Open this page on a wider display to play with animations.
      </p>
    </div>
  );
}
