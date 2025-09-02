'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBytes, estimateBase64Size } from '@/lib/size';
import { cn } from '@/lib/utils';

interface UploaderProps {
  onFileSelect: (file: File, base64Size: number) => void;
  disabled?: boolean;
}

export function Uploader({ onFileSelect, disabled }: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [base64Size, setBase64Size] = useState<number>(0);

  const handleFile = useCallback(
    (selectedFile: File) => {
      if (selectedFile.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }

      const estimatedBase64 = estimateBase64Size(selectedFile.size);
      setFile(selectedFile);
      setBase64Size(estimatedBase64);
      onFileSelect(selectedFile, estimatedBase64);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload PDF</CardTitle>
        <CardDescription>Drop your PDF file here or click to browse</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled}
            aria-label="Upload PDF file"
          />

          {file ? (
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Binary size: {formatBytes(file.size)}
              </p>
              <p className="text-xs text-muted-foreground">
                Estimated Base64 size: {formatBytes(base64Size)}
              </p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-center text-muted-foreground">
                Drag and drop your PDF file here,
                <br />
                or click to select
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
