'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseCallbackParams } from '@/lib/url';
import { updateJobResult } from '@/lib/storage';
import { getPendingTx, setPendingTx } from '@/lib/tx';
import { Loader2 } from 'lucide-react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = () => {
      const params = parseCallbackParams(searchParams);

      // Update job result if we have a txid
      if (params.txid) {
        updateJobResult(params.txid, {
          status: params.status,
          code: params.code,
          message: params.message,
          at: new Date().toISOString(),
        });
      }

      // Clear pending state
      if (getPendingTx() === params.txid) {
        setPendingTx(null);
      }

      // Redirect back to main page with status for toast
      const redirectParams = new URLSearchParams({
        printStatus: params.status,
        ...(params.code && { code: params.code.toString() }),
        ...(params.message && { message: params.message }),
      });

      router.push(`/?${redirectParams.toString()}`);
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Processing print result...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
