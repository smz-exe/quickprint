interface PrintParams {
  base64Data: string;
  fitToWidth: boolean;
  rotation: 0 | 270;
  timeoutMs: number;
  errorDialog: boolean;
  txid: string;
}

/**
 * Build the SII URL Print Agent scheme URL
 */
export function buildPrintUrl(params: PrintParams): string {
  const origin = window.location.origin;
  const successCallback = `${origin}/print/callback?status=success&txid=${params.txid}`;
  const failCallback = `${origin}/print/callback?status=fail&txid=${params.txid}`;

  const urlParams = new URLSearchParams({
    Format: 'pdf',
    Data: params.base64Data, // Already encoded
    PaperWidth: '58',
    FitToWidth: params.fitToWidth ? 'yes' : 'no',
    Rotation: params.rotation.toString(),
    Timeout: params.timeoutMs.toString(),
    ErrorDialog: params.errorDialog ? 'yes' : 'no',
    CallbackSuccess: successCallback,
    CallbackFail: failCallback,
  });

  return `siiprintagent://1.0/print?${urlParams.toString()}`;
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
