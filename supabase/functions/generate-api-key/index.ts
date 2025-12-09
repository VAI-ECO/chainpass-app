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

    // Verify admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error('Unauthorized: Admin access required');
    }

    const { business_partner_id } = await req.json();

    if (!business_partner_id) {
      throw new Error('Business partner ID is required');
    }

    // Generate a secure API key
    const apiKey = crypto.randomUUID() + '-' + crypto.randomUUID();

    // Create an auth user for the business partner
    const tempPassword = crypto.randomUUID();
    const { data: partnerRecord } = await supabase
      .from('business_partners')
      .select('contact_email, business_name')
      .eq('id', business_partner_id)
      .single();

    if (partnerRecord) {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: partnerRecord.contact_email,
        password: tempPassword,
        email_confirm: true,
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
      }

      // Update the business partner with the API key, approved status, and user_id
      const { data: updatedPartner, error: updateError } = await supabase
        .from('business_partners')
        .update({
          api_key: apiKey,
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          user_id: authUser?.user?.id,
        })
        .eq('id', business_partner_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating business partner:', updateError);
        throw updateError;
      }

      console.log(`API key generated for business partner: ${business_partner_id}`);

      // Send approval email in background
      const emailData = {
        business_name: updatedPartner.business_name,
        contact_name: updatedPartner.contact_name,
        contact_email: updatedPartner.contact_email,
        api_key: apiKey,
        callback_url: updatedPartner.callback_url,
        return_url: updatedPartner.return_url,
        temp_password: tempPassword,
      };

      // Send email notification without waiting (background task)
      fetch(`${supabaseUrl}/functions/v1/send-partner-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          type: 'approval',
          data: emailData,
        }),
      }).catch(error => {
        console.error('Failed to send approval email:', error);
      });

      return new Response(
        JSON.stringify({
          success: true,
          api_key: apiKey,
          business_partner: updatedPartner,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      throw new Error('Failed to fetch business partner record');
    }
  } catch (error) {
    console.error('Error in generate-api-key function:', error);
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
