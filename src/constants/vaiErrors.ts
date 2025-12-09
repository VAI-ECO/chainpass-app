/**
 * VAI Error Constants
 * 
 * User-friendly error messages for VAI validation errors
 */

export interface VAIError {
  title: string;
  message: string;
  action: string;
  retryable?: boolean;
}

export const VAI_ERRORS: Record<string, VAIError> = {
  not_found: {
    title: 'V.A.I. Number Not Found',
    message: 'We couldn\'t find that V.A.I. number. Please check your entry or create a new V.A.I.',
    action: 'Try Again',
    retryable: true,
  },
  suspended: {
    title: 'V.A.I. Suspended',
    message: 'This V.A.I. number has been suspended. Please contact support for assistance.',
    action: 'Contact Support',
    retryable: false,
  },
  banned: {
    title: 'V.A.I. Banned',
    message: 'This V.A.I. number has been banned. Please contact support for assistance.',
    action: 'Contact Support',
    retryable: false,
  },
  network_error: {
    title: 'Connection Error',
    message: 'Unable to verify V.A.I. number. Please check your internet connection and try again.',
    action: 'Retry',
    retryable: true,
  },
  timeout: {
    title: 'Request Timeout',
    message: 'The verification request took too long. Please try again.',
    action: 'Retry',
    retryable: true,
  },
  rate_limit: {
    title: 'Too Many Requests',
    message: 'Too many verification attempts. Please wait a moment and try again.',
    action: 'Retry Later',
    retryable: true,
  },
  server_error: {
    title: 'Server Error',
    message: 'An error occurred on our end. Please try again in a few moments.',
    action: 'Retry',
    retryable: true,
  },
  invalid_format: {
    title: 'Invalid V.A.I. Format',
    message: 'V.A.I. numbers must be exactly 7 characters (letters and numbers only).',
    action: 'Check Format',
    retryable: true,
  },
  unknown_error: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    action: 'Retry',
    retryable: true,
  },
};

/**
 * Get error information by code
 */
export function getVAIError(errorCode: string): VAIError {
  return VAI_ERRORS[errorCode] || VAI_ERRORS.unknown_error;
}

/**
 * Get error information from error object
 */
export function getVAIErrorFromError(error: any): VAIError {
  if (error?.code) {
    return getVAIError(error.code);
  }
  
  if (error?.message) {
    // Try to match error message to known errors
    const message = error.message.toLowerCase();
    if (message.includes('not found')) return VAI_ERRORS.not_found;
    if (message.includes('suspended')) return VAI_ERRORS.suspended;
    if (message.includes('banned')) return VAI_ERRORS.banned;
    if (message.includes('network') || message.includes('fetch')) return VAI_ERRORS.network_error;
    if (message.includes('timeout')) return VAI_ERRORS.timeout;
  }
  
  return VAI_ERRORS.unknown_error;
}









