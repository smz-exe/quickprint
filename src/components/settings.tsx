'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export interface PrintSettings {
  fitToWidth: boolean;
}

interface SettingsProps {
  settings: PrintSettings;
  onSettingsChange: (settings: PrintSettings) => void;
  disabled?: boolean;
}

export function Settings({ settings, onSettingsChange, disabled }: SettingsProps) {
  const handleChange = (key: keyof PrintSettings, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Print Settings</CardTitle>
        <CardDescription>Configure print options for your thermal printer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="fitToWidth">Fit to Width</Label>
            <p className="text-sm text-muted-foreground">Scale PDF to fit paper width</p>
          </div>
          <Switch
            id="fitToWidth"
            checked={settings.fitToWidth}
            onCheckedChange={(checked) => handleChange('fitToWidth', checked)}
            disabled={disabled}
            aria-label="Toggle fit to width"
          />
        </div>

        <div className="space-y-2">
          <Label>Paper Width</Label>
          <div className="flex items-center h-10 px-3 py-2 text-sm rounded-md border bg-muted">
            58 mm (fixed)
          </div>
          <p className="text-sm text-muted-foreground">
            Compatible with SII MP-B20 thermal printer
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            <strong>Note:</strong> The timeout duration is set to 5 minutes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
