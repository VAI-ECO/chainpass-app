# VAI Validation API Documentation

## Overview

The VAI Validation API allows external platforms to validate existing VAI numbers and check platform-specific requirements. This API is used by platforms like Vairify to determine if a user's VAI number is valid and qualified for their platform.

## Endpoint

```
POST /functions/v1/check-vai-requirements
```

## Authentication

The API accepts requests with the Supabase anon key in the Authorization header:

```
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

## Request Format

### Headers

```
Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

### Body

```json
{
  "vai_number": "9I7T35L",
  "requesting_platform": "vairify"
}
```

### Parameters

- `vai_number` (required): The 7-character VAI number to validate
- `requesting_platform` (required): The platform name (e.g., "vairify", "avchexx")

## Response Formats

### Success - Fully Qualified

User has completed all requirements for the platform and payment is active.

```json
{
  "valid": true,
  "qualified_for_platform": true,
  "vai_number": "9I7T35L",
  "created_at": "2024-12-05T10:00:00Z",
  "payment_status": {
    "is_paid": true,
    "payment_date": "2024-12-05T11:00:00Z",
    "expires_at": "2025-12-05T10:00:00Z",
    "remaining_days": 180,
    "warning": null
  },
  "completed_platforms": ["vairify", "avchexx"],
  "missing_requirements": []
}
```

### Success - Missing Requirements

User's VAI is valid but missing some platform-specific requirements.

```json
{
  "valid": true,
  "qualified_for_platform": false,
  "vai_number": "9I7T35L",
  "created_at": "2024-12-05T10:00:00Z",
  "completed_platforms": ["avchexx"],
  "missing_requirements": [
    {
      "requirement": "le_declaration",
      "display_name": "Law Enforcement Declaration",
      "completion_url": "https://chainpass.com/complete/le-declaration?vai=9I7T35L&platform=vairify"
    },
    {
      "requirement": "signature_agreement",
      "display_name": "V.A.I. Signature Agreement",
      "completion_url": "https://chainpass.com/complete/signature?vai=9I7T35L&platform=vairify"
    }
  ],
  "payment_status": {
    "is_paid": true,
    "expires_at": "2025-12-05T10:00:00Z",
    "remaining_days": 180
  }
}
```

### Delayed Payment Warning

User's VAI is valid and qualified, but payment was delayed. Shows remaining time if paid now.

```json
{
  "valid": true,
  "qualified_for_platform": true,
  "vai_number": "9I7T35L",
  "payment_status": {
    "is_paid": false,
    "in_grace_period": false,
    "created_at": "2024-12-05T10:00:00Z",
    "current_date": "2025-06-05T10:00:00Z",
    "time_elapsed_days": 182,
    "warning": "If you pay now, you will have 6 months (183 days) remaining on your annual subscription. Timer started on December 5, 2024 when your VAI was created.",
    "remaining_if_paid_now": 183,
    "expires_at_if_paid_now": "2025-12-05T10:00:00Z"
  }
}
```

### Invalid VAI

VAI number not found in the system.

```json
{
  "valid": false,
  "message": "VAI number not found",
  "suggest_create_new": true,
  "create_url": "https://chainpass.com/create-vai?platform=vairify"
}
```

### Suspended/Banned VAI

VAI number exists but has been suspended or banned.

```json
{
  "valid": true,
  "qualified": false,
  "reason": "VAI suspended",
  "contact_support": true
}
```

## Error Responses

### 400 Bad Request

Missing required fields or invalid platform.

```json
{
  "valid": false,
  "message": "Missing required fields: vai_number and requesting_platform are required"
}
```

### 500 Internal Server Error

Server error occurred.

```json
{
  "valid": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

## Platform Requirements

Different platforms have different requirements:

### Vairify
- Payment verification: Required
- Identity verification: Required
- Law Enforcement Declaration: Required
- Signature Agreement: Required

### AVChexx
- Payment verification: Required
- Identity verification: Required
- Law Enforcement Declaration: Not required
- Signature Agreement: Not required

## Payment Status Logic

### Grace Period
- 48 hours from VAI creation
- Payment not required during grace period
- `in_grace_period: true` in response

### Active Payment
- Payment completed within 48 hours or anytime after
- `is_paid: true` with `payment_date` and `expires_at`
- `remaining_days` shows days until expiration

### Delayed Payment
- Payment not completed and grace period expired
- `warning` field contains message about remaining time
- `remaining_if_paid_now` shows days remaining if paid now
- Timer started at VAI creation, not payment date

## Example Usage

### cURL

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/check-vai-requirements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "vai_number": "9I7T35L",
    "requesting_platform": "vairify"
  }'
```

### JavaScript/TypeScript

```typescript
const response = await fetch('https://YOUR_PROJECT.supabase.co/functions/v1/check-vai-requirements', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`
  },
  body: JSON.stringify({
    vai_number: '9I7T35L',
    requesting_platform: 'vairify'
  })
});

const data = await response.json();
```

## Testing

Test VAI numbers for different scenarios:

- `9I7T35L`: Fully qualified (all requirements met, paid)
- `TEST001`: AVChexx only (no LE declaration, no signature)
- `TEST002`: Unpaid, created 6 months ago (test payment warning)
- `TEST003`: In 48-hour grace period

## Rate Limiting

Currently no rate limiting is enforced, but it's recommended to:
- Cache responses for a reasonable period (5-10 minutes)
- Implement client-side rate limiting
- Handle 429 responses gracefully

## Support

For issues or questions, contact ChainPass support or refer to the integration guide.









