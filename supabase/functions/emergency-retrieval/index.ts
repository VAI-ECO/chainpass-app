import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transactionNumber, leoCredentials } = await req.json()
    
    if (!transactionNumber) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Transaction number is required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    if (!leoCredentials || !leoCredentials.badgeNumber || !leoCredentials.jurisdiction) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Valid LEO credentials required (badgeNumber and jurisdiction)' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log LEO retrieval attempt
    console.log('LEO retrieval attempt:', {
      badgeNumber: leoCredentials.badgeNumber,
      jurisdiction: leoCredentials.jurisdiction,
      transactionNumber: transactionNumber,
      timestamp: new Date().toISOString()
    })

    // Retrieve verification record by transaction number (ComplyCube verification ID)
    const { data: verificationRecord, error: verificationError } = await supabase
      .from('verification_records')
      .select(`
        id,
        complycube_verification_id,
        created_at,
        verification_status,
        biometric_confirmed
      `)
      .eq('complycube_verification_id', transactionNumber)
      .single()

    if (verificationError || !verificationRecord) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Transaction number not found or expired' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 404 
        }
      )
    }

    // Get VAI number associated with this verification record
    const { data: vaiAssignment, error: vaiError } = await supabase
      .from('vai_assignments')
      .select('vai_code, id, created_at')
      .eq('verification_record_id', verificationRecord.id)
      .single()

    if (vaiError || !vaiAssignment) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'VAI number not found for this transaction' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 404 
        }
      )
    }

    // Log the retrieval for audit trail
    const { error: auditError } = await supabase
      .from('leo_retrieval_audit')
      .insert({
        transaction_number: transactionNumber,
        leo_badge_number: leoCredentials.badgeNumber,
        leo_jurisdiction: leoCredentials.jurisdiction,
        retrieved_at: new Date().toISOString()
      })

    if (auditError) {
      console.error('Failed to log LEO retrieval audit:', auditError)
      // Don't fail the request if audit logging fails, but log it
    }

    // Return available data
    // Note: Full identity information (name, phone, etc.) would need to be retrieved
    // from ComplyCube API using the transaction number
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          vaiId: vaiAssignment.vai_code,
          transactionNumber: transactionNumber,
          verificationRecordId: verificationRecord.id,
          registeredAt: verificationRecord.created_at,
          verificationStatus: verificationRecord.verification_status,
          biometricConfirmed: verificationRecord.biometric_confirmed,
          // Note: Emergency contact info (name, phone) would need to be retrieved
          // from ComplyCube API using the transaction number
          note: 'Full identity information available via ComplyCube API using transaction number'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Emergency retrieval error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})



