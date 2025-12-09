# Vairify Integration Guide

## Overview

This guide explains how to integrate existing VAI number validation into the Vairify signup flow. Users who have VAI numbers from other ChainPass-verified platforms (like AVChexx) can use their existing number on Vairify.

## Flow Diagram

```
User Signup
    │
    ├─→ Has Existing VAI?
    │   │
    │   ├─→ No → Normal ChainPass Flow
    │   │         (Create new VAI)
    │   │
    │   └─→ Yes → Validate VAI
    │             │
    │             ├─→ Invalid → Show Error
    │             │
    │             ├─→ Suspended → Show Error
    │             │
    │             ├─→ Missing Requirements → Redirect to ChainPass
    │             │                          (Complete requirements)
    │             │                          → Return to /onboarding/complete
    │             │
    │             └─→ Fully Qualified
    │                   │
    │                   ├─→ Payment Warning? → Show Modal
    │                   │                      → User Confirms
    │                   │
    │                   └─→ Create Account → Profile Setup
```

## Implementation Steps

### 1. Signup Form Updates

Add existing VAI checkbox and input field to the signup form:

```tsx
<div className="existing-vai-section">
  <Checkbox
    checked={hasExistingVAI}
    onCheckedChange={setHasExistingVAI}
  />
  <Label>I have an existing V.A.I. number from another platform</Label>
  
  {hasExistingVAI && (
    <Input
      value={existingVAI}
      onChange={(e) => setExistingVAI(e.target.value.toUpperCase())}
      pattern="[A-Z0-9]{7}"
      maxLength={7}
    />
  )}
</div>
```

### 2. VAI Validation on Submit

When user submits the signup form:

```typescript
if (hasExistingVAI && existingVAI) {
  // Call ChainPass API
  const vaiData = await vaiValidationService.checkVAIRequirements(
    existingVAI,
    'vairify'
  );
  
  // Handle response (see routing logic below)
}
```

### 3. Routing Logic

#### Invalid VAI
```typescript
if (!vaiData.valid) {
  // Show error message
  toast.error('VAI number not found');
  return;
}
```

#### Suspended/Banned
```typescript
if (vaiData.reason) {
  // Show error with contact support option
  toast.error('VAI suspended. Contact support.');
  return;
}
```

#### Missing Requirements
```typescript
if (!vaiData.qualified_for_platform) {
  // Redirect to ChainPass completion flow
  const returnUrl = encodeURIComponent('https://vairify.com/onboarding/complete');
  const requirements = vaiData.missing_requirements
    .map(r => r.requirement)
    .join(',');
  
  window.location.href = 
    `https://chainpass.com/complete-requirements?vai=${existingVAI}&platform=vairify&requirements=${requirements}&return_url=${returnUrl}`;
  return;
}
```

#### Fully Qualified
```typescript
if (vaiData.qualified_for_platform) {
  // Check payment warning
  if (vaiData.payment_status?.warning) {
    // Show payment warning modal
    setShowPaymentWarning(true);
    setPaymentWarningData(vaiData.payment_status);
    return;
  }
  
  // Create account directly
  await createVairifyAccountWithExistingVAI({
    email,
    password,
    vaiNumber: existingVAI,
    referralCode,
    couponCode
  });
  
  navigate('/onboarding/profile');
}
```

### 4. Payment Warning Modal

When payment was delayed, show warning modal:

```tsx
<PaymentWarningModal
  isOpen={showPaymentWarning}
  paymentStatus={paymentWarningData}
  onConfirm={handlePaymentWarningConfirm}
  onCancel={() => setShowPaymentWarning(false)}
/>
```

The modal explains:
- VAI creation date
- Time elapsed since creation
- Remaining time if paid now
- Why timer started at creation (ChainPass pays ComplyCube upfront)

### 5. Coupon Payment Enforcement

If user entered a coupon code, payment is required immediately:

```typescript
if (couponCode && !vaiData.payment_status?.is_paid) {
  // Show coupon payment modal
  setShowCouponPayment(true);
  return;
}
```

### 6. Onboarding Complete Handler

Handle return from ChainPass after completing requirements:

```typescript
// Route: /onboarding/complete
const vai = searchParams.get('vai');
const success = searchParams.get('success');
const sessionId = searchParams.get('session_id');

if (success === 'true' && vai) {
  // Verify VAI is now qualified
  const vaiData = await vaiValidationService.checkVAIRequirements(vai, 'vairify');
  
  if (vaiData.qualified_for_platform) {
    // Get signup session data
    const sessionData = getSignupSession(sessionId);
    
    // Create account
    await createVairifyAccountWithExistingVAI({
      email: sessionData.email,
      password: sessionData.password,
      vaiNumber: vai,
      referralCode: sessionData.referralCode,
      couponCode: sessionData.couponCode
    });
    
    navigate('/onboarding/profile');
  }
}
```

## Database Schema

### Profiles Table Updates

```sql
ALTER TABLE profiles
ADD COLUMN existing_vai_used BOOLEAN DEFAULT FALSE,
ADD COLUMN vai_source VARCHAR(50),
ADD COLUMN vai_number TEXT;
```

### Platform Completions

The `vai_platform_completions` table tracks which requirements each VAI has completed for each platform.

## Testing Scenarios

### 1. New User, No Existing VAI
- User doesn't check "existing VAI" checkbox
- Normal ChainPass flow initiated
- User creates new VAI

### 2. Existing AVChexx VAI
- User checks "existing VAI" and enters AVChexx VAI
- API returns: missing LE declaration + signature
- User redirected to ChainPass to complete
- Returns to `/onboarding/complete`
- Account created with existing VAI

### 3. Existing Fully Qualified VAI
- User checks "existing VAI" and enters qualified VAI
- API returns: fully qualified
- Account created immediately
- User goes to profile setup

### 4. Existing VAI, Unpaid, 6 Months Old
- User checks "existing VAI" and enters unpaid VAI
- API returns: fully qualified but payment warning
- Payment warning modal shown
- User confirms → Account created
- User cancels → Can use free features only

### 5. Existing VAI with Coupon
- User enters coupon code and existing VAI
- If VAI not paid → Coupon payment modal shown
- User must pay immediately to use coupon
- Redirected to ChainPass payment flow

### 6. Invalid VAI Number
- User enters invalid VAI
- API returns: not found
- Error message shown
- User can try again or create new VAI

## Error Handling

All errors are handled with user-friendly messages:

- **Not Found**: "V.A.I. number not found. Please check your entry or create a new V.A.I."
- **Suspended**: "This V.A.I. number has been suspended. Please contact support."
- **Network Error**: "Unable to verify V.A.I. number. Please check your internet connection."
- **Invalid Format**: "V.A.I. numbers must be exactly 7 characters (letters and numbers only)."

## Security Considerations

1. **VAI Format Validation**: Always validate format client-side before API call
2. **Session Storage**: Signup session data stored in sessionStorage (cleared after use)
3. **API Key**: Use Supabase anon key (public, but rate-limited)
4. **HTTPS**: All API calls must use HTTPS
5. **Error Messages**: Don't expose sensitive information in error messages

## Development Tools

In development mode, test tools are available:

```tsx
{import.meta.env.DEV && (
  <DevVaiTestTools
    onSelectVAI={(vai) => {
      setHasExistingVAI(true);
      setExistingVAI(vai);
    }}
  />
)}
```

Test VAI numbers:
- `9I7T35L`: Fully Qualified
- `TEST001`: Missing Requirements
- `TEST002`: Payment Warning
- `TEST003`: Grace Period

## Support

For integration issues or questions:
1. Check API documentation: `docs/VAI-VALIDATION-API.md`
2. Review error messages in `src/constants/vaiErrors.ts`
3. Contact ChainPass support









