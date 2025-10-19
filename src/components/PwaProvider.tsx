'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa';
import PwaInstallPrompt from './PwaInstallPrompt';

/**
 * PWA Provider Component
 * Registers service worker and shows install prompt
 */
export default function PwaProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    // Register service worker on mount
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  return (
    <>
      {children}
      <PwaInstallPrompt />
    </>
  );
}

