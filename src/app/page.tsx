import { Suspense } from 'react';
import { QuickPrintApp } from '@/components/quick-print-app';

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuickPrintApp />
    </Suspense>
  );
}
