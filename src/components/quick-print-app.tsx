'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { HelpCircle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Uploader } from '@/components/uploader';
import { Preview } from '@/components/preview';
import { Settings, type PrintSettings } from '@/components/settings';
import { History } from '@/components/history';
import { buildPrintUrl } from '@/lib/url';
import { generateTxId, setPendingTx, isPending } from '@/lib/tx';
import { getHistory, addToHistory, type PrintJob } from '@/lib/storage';
import { isWithinSizeLimit, BASE64_SIZE_LIMIT, formatBytes } from '@/lib/size';
import { encodeFileToBase64 } from '@/lib/base64-encoder';

export function QuickPrintApp() {
  const searchParams = useSearchParams();

  const [file, setFile] = useState<File | null>(null);
  const [base64Data, setBase64Data] = useState<string>('');
  const [base64Size, setBase64Size] = useState<number>(0);
  const [encoding, setEncoding] = useState(false);
  const [encodingProgress, setEncodingProgress] = useState(0);
  const [history, setHistory] = useState<PrintJob[]>([]);
  const [settings, setSettings] = useState<PrintSettings>({
    fitToWidth: true,
    rotation: 0,
    timeoutMs: 15000,
    errorDialog: true,
  });

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Handle callback parameters
  useEffect(() => {
    const status = searchParams.get('printStatus');
    const code = searchParams.get('code');

    if (status === 'success') {
      toast.success('Printed successfully');
    } else if (status === 'fail') {
      const errorMessage = code ? `Print failed (code: ${code})` : 'Print failed';
      toast.error(errorMessage);
    }

    // Refresh history after callback
    if (status) {
      setHistory(getHistory());
    }
  }, [searchParams]);

  const handleFileSelect = useCallback((selectedFile: File, estimatedBase64Size: number) => {
    setFile(selectedFile);
    setBase64Size(estimatedBase64Size);
    setBase64Data('');

    // Check size limit early
    if (!isWithinSizeLimit(estimatedBase64Size)) {
      toast.error(
        `File is too large to print via URL scheme. Maximum size is ${formatBytes(BASE64_SIZE_LIMIT)}. ` +
          'Please use a smaller PDF or simplify the layout.',
        { duration: 5000 }
      );
      return;
    }

    // Start encoding
    setEncoding(true);
    setEncodingProgress(0);

    // Use async encoder instead of worker
    encodeFileToBase64(selectedFile, (update) => {
      if (update.error) {
        toast.error(`Encoding failed: ${update.error}`);
        setEncoding(false);
        return;
      }

      if (update.progress !== undefined) {
        setEncodingProgress(update.progress);
      }

      if (update.complete && update.base64) {
        setBase64Data(update.base64);
        setBase64Size(update.base64.length);
        setEncoding(false);

        // Double-check actual size
        if (!isWithinSizeLimit(update.base64.length)) {
          toast.error(
            `Encoded file exceeds URL scheme limit. Maximum size is ${formatBytes(BASE64_SIZE_LIMIT)}.`,
            { duration: 5000 }
          );
          setBase64Data('');
        }
      }
    });
  }, []);

  const handlePrint = useCallback(() => {
    if (!file || !base64Data || isPending()) return;

    const txid = generateTxId();
    setPendingTx(txid);

    // Add to history
    const job: PrintJob = {
      txid,
      filename: file.name,
      createdAt: new Date().toISOString(),
      binaryBytes: file.size,
      base64Bytes: base64Data.length,
      fitToWidth: settings.fitToWidth,
      rotation: settings.rotation,
      timeoutMs: settings.timeoutMs,
    };
    addToHistory(job);
    setHistory(getHistory());

    // Build and navigate to URL scheme
    try {
      const printUrl = buildPrintUrl({
        base64Data: base64Data,
        fitToWidth: settings.fitToWidth,
        txid,
      });

      window.location.href = printUrl;
    } catch (error) {
      setPendingTx(null);
      toast.error('Failed to open SII URL Print Agent. Please ensure the app is installed.');
      console.error('Print URL error:', error);
    }
  }, [file, base64Data, settings]);

  const handleRetry = useCallback(
    (job: PrintJob) => {
      if (!base64Data || job.filename !== file?.name) {
        toast.error('Please re-upload the file to retry');
        return;
      }

      // Use existing settings from the job
      const retrySettings: PrintSettings = {
        fitToWidth: job.fitToWidth,
        rotation: job.rotation,
        timeoutMs: job.timeoutMs,
        errorDialog: settings.errorDialog,
      };

      setSettings(retrySettings);
      handlePrint();
    },
    [base64Data, file, settings.errorDialog, handlePrint]
  );

  const handleClear = useCallback(() => {
    setFile(null);
    setBase64Data('');
    setBase64Size(0);
    setEncodingProgress(0);
    setPendingTx(null);
  }, []);

  const canPrint = file && base64Data && !encoding && isWithinSizeLimit(base64Size) && !isPending();

  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4 mx-auto">
            <h1 className="text-2xl font-semibold">QuickPrint</h1>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Help">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to use QuickPrint</DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                  <div className="space-y-4">
                    <p>
                      QuickPrint allows you to print PDF files to SII thermal printers via the SII
                      URL Print Agent app.
                    </p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Ensure your iPhone/iPad is paired with your SII printer via Bluetooth</li>
                      <li>Install the SII URL Print Agent app from the App Store</li>
                      <li>Upload a PDF file (max ~560KB binary size)</li>
                      <li>Adjust print settings as needed</li>
                      <li>Tap "Print PDF" to send the job to your printer</li>
                    </ol>
                    <p className="text-sm text-muted-foreground">
                      Note: The URL scheme has a size limit of approximately 750KB for Base64 data.
                      Larger files cannot be printed using this method.
                    </p>
                  </div>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="container px-4 py-8 mx-auto">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Uploader onFileSelect={handleFileSelect} disabled={encoding || isPending()} />

              <Preview file={file} />

              {encoding && (
                <div className="rounded-lg border bg-card p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Encoding PDF...</span>
                      <span>{encodingProgress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${encodingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {base64Size > 0 && !isWithinSizeLimit(base64Size) && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">
                    File is too large to print. Maximum Base64 size is{' '}
                    {formatBytes(BASE64_SIZE_LIMIT)}. Current size: {formatBytes(base64Size)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Settings
                settings={settings}
                onSettingsChange={setSettings}
                disabled={encoding || isPending()}
              />

              <div className="flex gap-4">
                <Button size="lg" onClick={handlePrint} disabled={!canPrint} className="flex-1">
                  <Printer className="mr-2 h-5 w-5" />
                  Print PDF
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleClear}
                  disabled={!file || encoding || isPending()}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <History jobs={history} onRetry={handleRetry} disabled={encoding || isPending()} />
          </div>
        </main>
      </div>
    </>
  );
}
