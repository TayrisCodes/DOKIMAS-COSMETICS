'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkInstallability, showInstallPrompt, isStandalone, BeforeInstallPromptEvent } from '@/lib/pwa';

export default function PwaInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (isStandalone() || dismissed) {
      return;
    }

    // Check if user has dismissed before
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      return;
    }

    // Listen for install prompt
    const cleanup = checkInstallability((canInstall, prompt) => {
      if (canInstall && prompt) {
        setDeferredPrompt(prompt);
        // Show prompt after a short delay
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    });

    return cleanup;
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    const accepted = await showInstallPrompt(deferredPrompt);

    if (accepted) {
      console.log('PWA install accepted');
    }

    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="rounded-lg border bg-white p-4 shadow-lg dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900">
              <Download className="h-6 w-6 text-pink-600 dark:text-pink-300" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Install Dokimas App
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Install our app for a better shopping experience. Quick access, offline browsing, and instant notifications!
            </p>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                Install
              </Button>
              <Button onClick={handleDismiss} size="sm" variant="ghost">
                Not now
              </Button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

