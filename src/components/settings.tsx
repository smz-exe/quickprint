'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export interface PrintSettings {
  fitToWidth: boolean;
  rotation: 0 | 270;
  timeoutMs: number;
  errorDialog: boolean;
}

interface SettingsProps {
  settings: PrintSettings;
  onSettingsChange: (settings: PrintSettings) => void;
  disabled?: boolean;
}

export function Settings({ settings, onSettingsChange, disabled }: SettingsProps) {
  const handleChange = (key: keyof PrintSettings, value: string | number | boolean) => {
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
          <Label htmlFor="rotation">Rotation</Label>
          <Select
            value={settings.rotation.toString()}
            onValueChange={(value) => handleChange('rotation', Number(value))}
            disabled={disabled}
          >
            <SelectTrigger id="rotation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0°</SelectItem>
              <SelectItem value="270">270°</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeout">Timeout (ms)</Label>
          <Input
            id="timeout"
            type="number"
            value={settings.timeoutMs}
            onChange={(e) => handleChange('timeoutMs', Number(e.target.value))}
            min="1000"
            max="60000"
            step="1000"
            disabled={disabled}
          />
          <p className="text-sm text-muted-foreground">Maximum time to wait for print completion</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="errorDialog">Error Dialog</Label>
            <p className="text-sm text-muted-foreground">Show error dialog on print failure</p>
          </div>
          <Switch
            id="errorDialog"
            checked={settings.errorDialog}
            onCheckedChange={(checked) => handleChange('errorDialog', checked)}
            disabled={disabled}
            aria-label="Toggle error dialog"
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
      </CardContent>
    </Card>
  );
}
