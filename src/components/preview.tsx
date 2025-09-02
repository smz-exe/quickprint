'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generatePdfThumbnail, type ThumbnailResult } from '@/lib/pdf';
import { Loader2 } from 'lucide-react';

interface PreviewProps {
  file: File | null;
}

export function Preview({ file }: PreviewProps) {
  const [thumbnail, setThumbnail] = useState<ThumbnailResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setThumbnail(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const generateThumbnail = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await generatePdfThumbnail(file);
        if (!cancelled) {
          setThumbnail(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to generate preview');
          console.error('Thumbnail generation error:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    generateThumbnail();

    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>
          First page of your PDF
          {thumbnail?.isCropped && (
            <Badge variant="secondary" className="ml-2">
              Cropped preview
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center min-h-[200px]">
          {loading && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Generating preview...</p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">Error: {error}</p>}

          {thumbnail && !loading && !error && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnail.dataUrl}
                alt="PDF preview"
                className="rounded-md shadow-md"
                style={{
                  width: thumbnail.displayWidth,
                  height: thumbnail.displayHeight,
                  maxWidth: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {!file && !loading && !error && (
            <p className="text-sm text-muted-foreground">No PDF selected</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
