interface PrintParams {
  base64Data: string;
  fitToWidth: boolean;
  txid: string;
}

/**
 * Build the SII URL Print Agent scheme URL
 */
export function buildPrintUrl(params: PrintParams): string {
  const origin = window.location.origin;
  const successCallback = `${origin}/print/callback?status=success&txid=${params.txid}`;
  const failCallback = `${origin}/print/callback?status=fail&txid=${params.txid}`;

  // Build URL manually following Sample.html format exactly
  const url =
    'siiprintagent://1.0/print?' +
    'CallbackSuccess=' +
    encodeURIComponent(successCallback) +
    '&' +
    'CallbackFail=' +
    encodeURIComponent(failCallback) +
    '&' +
    'Format=pdf&' +
    'Data=' +
    encodeURIComponent(params.base64Data) +
    '&' +
    'SelectOnError=yes&' +
    'CutType=full&' +
    'CutFeed=yes&' +
    'FitToWidth=' +
    (params.fitToWidth ? 'yes' : 'no') +
    '&' +
    'PaperWidth=58';

  return url;
}

/**
 * Parse callback parameters from URL
 */
export interface CallbackParams {
  status: 'success' | 'fail';
  txid?: string;
  code?: number;
  message?: string;
}

export function parseCallbackParams(searchParams: URLSearchParams): CallbackParams {
  // Handle both our custom format and SII sample format
  const status = searchParams.get('status') ?? (searchParams.get('Code') ? 'fail' : 'success');

  const code = searchParams.get('Code') ? Number(searchParams.get('Code')) : undefined;

  return {
    status: status as 'success' | 'fail',
    txid: searchParams.get('txid') ?? undefined,
    code,
    message: searchParams.get('Message') ?? searchParams.get('message') ?? undefined,
  };
}
