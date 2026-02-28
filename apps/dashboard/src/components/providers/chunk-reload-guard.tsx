'use client';

import { useEffect } from 'react';

const RECOVERY_KEY = 'agentmd:chunk-reload-recovered';

function isChunkLoadFailure(reason: unknown): boolean {
  if (!reason) return false;
  const message =
    reason instanceof Error
      ? reason.message
      : typeof reason === 'string'
        ? reason
        : typeof reason === 'object' && 'message' in reason
          ? String((reason as { message?: unknown }).message ?? '')
          : '';

  const lowered = message.toLowerCase();
  return (
    lowered.includes('chunkloaderror') ||
    lowered.includes('loading chunk') ||
    lowered.includes('failed to fetch dynamically imported module')
  );
}

export function ChunkReloadGuard() {
  useEffect(() => {
    const recover = () => {
      const alreadyRecovered = sessionStorage.getItem(RECOVERY_KEY) === '1';
      if (alreadyRecovered) return;
      sessionStorage.setItem(RECOVERY_KEY, '1');
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      if (isChunkLoadFailure(event.error ?? event.message)) {
        recover();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadFailure(event.reason)) {
        recover();
      }
    };

    const clearFlag = () => sessionStorage.removeItem(RECOVERY_KEY);
    const timeout = window.setTimeout(clearFlag, 3000);

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}
