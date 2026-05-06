'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Share2 } from 'lucide-react';

export function ShareButton() {
  async function handleShare() {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard.');
    } catch {
      toast.error('Could not copy link.');
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
