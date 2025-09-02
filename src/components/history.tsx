'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { formatBytes } from '@/lib/size';
import type { PrintJob } from '@/lib/storage';

interface HistoryProps {
  jobs: PrintJob[];
  onRetry: (job: PrintJob) => void;
  disabled?: boolean;
}

export function History({ jobs, onRetry, disabled }: HistoryProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedJobs = [...jobs].reverse(); // Show newest first

  return (
    <Card>
      <CardHeader>
        <CardTitle>Print History</CardTitle>
        <CardDescription>Recent print jobs (max 20 entries)</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No print history yet</p>
        ) : (
          <div className="space-y-2">
            {sortedJobs.map((job) => (
              <div
                key={job.txid}
                className="flex items-center justify-between p-3 rounded-md border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{job.filename}</p>
                    {job.result && (
                      <Badge
                        variant={job.result.status === 'success' ? 'default' : 'destructive'}
                        className="shrink-0"
                      >
                        {job.result.status === 'success' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {job.result.status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-xs text-muted-foreground">{formatDate(job.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(job.base64Bytes)}</p>
                    {job.result?.code && (
                      <p className="text-xs text-muted-foreground">Error code: {job.result.code}</p>
                    )}
                  </div>
                </div>

                {job.result?.status === 'fail' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRetry(job)}
                    disabled={disabled}
                    className="ml-2 shrink-0"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
