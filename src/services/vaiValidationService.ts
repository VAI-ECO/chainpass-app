/**
 * VAI Validation Service
 * 
 * Service for validating VAI numbers via ChainPass API
 * Used by Vairify signup flow to check existing VAI numbers
 */

export interface VAIValidationRequest {
  vai_number: string;
  requesting_platform: string;
}

export interface PaymentStatus {
  is_paid: boolean;
  payment_date?: string;
  expires_at?: string;
  remaining_days?: number;
  warning?: string | null;
  in_grace_period?: boolean;
  grace_period_ends?: string;
  created_at?: string;
  current_date?: string;
  time_elapsed_days?: number;
  remaining_if_paid_now?: number;
  expires_at_if_paid_now?: string;
}

export interface MissingRequirement {
  requirement: string;
  display_name: string;
  completion_url: string;
}

export interface VAIValidationResponse {
  valid: boolean;
  qualified_for_platform?: boolean;
  vai_number?: string;
  created_at?: string;
  completed_platforms?: string[];
  missing_requirements?: MissingRequirement[];
  payment_status?: PaymentStatus;
  message?: string;
  suggest_create_new?: boolean;
  create_url?: string;
  reason?: string;
  contact_support?: boolean;
  error?: string;
}

export class VAIValidationService {
  private baseUrl: string;

  constructor() {
    // Use ChainPass API URL from environment or default to Supabase functions
    this.baseUrl = import.meta.env.VITE_CHAINPASS_API_URL || 
                   import.meta.env.VITE_SUPABASE_URL || 
                   'https://pbxpkfotysozdmdophhg.supabase.co';
  }

  /**
   * Check VAI requirements for a platform
   */
  async checkVAIRequirements(
    vaiNumber: string,
    platform: string = 'vairify'
  ): Promise<VAIValidationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/check-vai-requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''}`,
        },
        body: JSON.stringify({
          vai_number: vaiNumber.toUpperCase(),
          requesting_platform: platform,
        }),
      });

      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 429) {
          throw {
            code: 'RATE_LIMIT',
            message: 'Too many requests. Please try again later.',
          };
        }
        
        if (response.status >= 500) {
          throw {
            code: 'SERVER_ERROR',
            message: 'Server error. Please try again later.',
          };
        }

        const errorData = await response.json().catch(() => ({}));
        throw {
          code: 'API_ERROR',
          message: errorData.message || `API returned ${response.status}`,
        };
      }

      const data: VAIValidationResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error('VAI validation error:', error);

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to ChainPass. Please check your internet connection.',
        };
      }

      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw {
          code: 'TIMEOUT',
          message: 'Request timed out. Please try again.',
        };
      }

      // Re-throw known errors
      if (error.code) {
        throw error;
      }

      // Unknown error
      throw {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Validate VAI number format
   */
  static validateVAIFormat(vaiNumber: string): boolean {
    // VAI numbers are 7-character alphanumeric (uppercase)
    const vaiRegex = /^[A-Z0-9]{7}$/;
    return vaiRegex.test(vaiNumber.toUpperCase());
  }

  /**
   * Format VAI number (uppercase, remove spaces)
   */
  static formatVAI(vaiNumber: string): string {
    return vaiNumber.toUpperCase().replace(/\s/g, '');
  }
}

// Export singleton instance
export const vaiValidationService = new VAIValidationService();









