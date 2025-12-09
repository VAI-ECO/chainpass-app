/**
 * Account Service
 * 
 * Service for creating Vairify accounts with existing VAI numbers
 */

import { supabase } from "@/integrations/supabase/client";

export interface AccountCreationData {
  email: string;
  password: string;
  vaiNumber: string;
  referralCode?: string;
  couponCode?: string;
  userType?: string;
}

export interface AccountCreationResult {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * Create Vairify account with existing VAI number
 */
export async function createVairifyAccountWithExistingVAI(
  data: AccountCreationData
): Promise<AccountCreationResult> {
  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding/profile`,
        data: {
          vai_number: data.vaiNumber,
          existing_vai_used: true,
          vai_source: "existing", // Will be updated based on platform detection
        },
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return {
        success: false,
        error: authError.message || "Failed to create account",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "User creation failed - no user returned",
      };
    }

    // 2. Create profile with VAI number and metadata
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: data.email,
      vai_number: data.vaiNumber,
      existing_vai_used: true,
      vai_source: "existing", // Can be updated later based on platform detection
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Try to clean up auth user if profile creation fails
      // Note: This might not work if email confirmation is required
      return {
        success: false,
        error: profileError.message || "Failed to create profile",
      };
    }

    // 3. Track referral if applicable
    if (data.referralCode) {
      try {
        await trackReferralSignup(data.referralCode, data.vaiNumber, authData.user.id);
      } catch (referralError) {
        // Log but don't fail account creation if referral tracking fails
        console.error("Referral tracking error:", referralError);
      }
    }

    // 4. Track coupon usage if applicable
    if (data.couponCode) {
      try {
        // Call edge function to record coupon usage
        const { error: couponError } = await supabase.functions.invoke("record-coupon-usage", {
          body: {
            coupon_code: data.couponCode,
            vai_number: data.vaiNumber,
            user_id: authData.user.id,
          },
        });

        if (couponError) {
          console.error("Coupon tracking error:", couponError);
        }
      } catch (couponError) {
        console.error("Coupon tracking error:", couponError);
      }
    }

    return {
      success: true,
      userId: authData.user.id,
    };
  } catch (error: any) {
    console.error("Account creation error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Track referral signup
 */
async function trackReferralSignup(
  referralCode: string,
  vaiNumber: string,
  userId: string
): Promise<void> {
  // This would typically call an edge function or update a referrals table
  // For now, we'll just log it
  console.log("Tracking referral:", { referralCode, vaiNumber, userId });

  // TODO: Implement referral tracking logic
  // Example:
  // await supabase.functions.invoke('track-referral', {
  //   body: { referralCode, vaiNumber, userId }
  // });
}

/**
 * Create signup session for new VAI flow
 */
export async function createSignupSession(
  email: string,
  password: string,
  referralCode?: string,
  couponCode?: string
): Promise<{ id: string }> {
  // Store signup data in sessionStorage for later use
  const sessionId = `signup_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  sessionStorage.setItem(
    `signup_session_${sessionId}`,
    JSON.stringify({
      email,
      password,
      referralCode,
      couponCode,
      timestamp: Date.now(),
    })
  );

  return { id: sessionId };
}

/**
 * Get signup session data
 */
export function getSignupSession(sessionId: string): {
  email: string;
  password: string;
  referralCode?: string;
  couponCode?: string;
} | null {
  const sessionData = sessionStorage.getItem(`signup_session_${sessionId}`);
  if (!sessionData) return null;

  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

/**
 * Clear signup session
 */
export function clearSignupSession(sessionId: string): void {
  sessionStorage.removeItem(`signup_session_${sessionId}`);
}









