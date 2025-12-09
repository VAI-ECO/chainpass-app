import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get the business partner record for this user
    const { data: partnerData, error: partnerError } = await supabase
      .from('business_partners')
      .select('id, business_name, contact_email')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .single();

    if (partnerError || !partnerData) {
      throw new Error('Business partner not found or not approved');
    }

    // Generate a new API key
    const newApiKey = crypto.randomUUID() + '-' + crypto.randomUUID();

    // Update the business partner with the new API key
    const { data: updatedPartner, error: updateError } = await supabase
      .from('business_partners')
      .update({ api_key: newApiKey })
      .eq('id', partnerData.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating API key:', updateError);
      throw updateError;
    }

    console.log(`API key regenerated for business partner: ${partnerData.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        api_key: newApiKey,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in regenerate-api-key function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
