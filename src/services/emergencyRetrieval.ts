export interface LEOCredentials {
  badgeNumber: string
  jurisdiction: string
}

export interface EmergencyRetrievalResponse {
  success: boolean
  data?: {
    vaiId: string
    transactionNumber: string
    verificationRecordId: string
    registeredAt: string
    verificationStatus: string
    biometricConfirmed: boolean
    note?: string
  }
  error?: string
}

/**
 * Retrieve emergency contact information for a transaction number
 * Requires valid LEO credentials (badge number and jurisdiction)
 * 
 * @param transactionNumber - The ComplyCube transaction/verification ID
 * @param leoCredentials - LEO badge number and jurisdiction
 * @returns Emergency retrieval response with VAI and transaction details
 */
export const retrieveEmergencyContact = async (
  transactionNumber: string,
  leoCredentials: LEOCredentials
): Promise<EmergencyRetrievalResponse> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing')
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/emergency-retrieval`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          transactionNumber,
          leoCredentials
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`
      }
    }

    return data as EmergencyRetrievalResponse
  } catch (error) {
    console.error('Emergency retrieval error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    }
  }
}



