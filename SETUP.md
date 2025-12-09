# ChainPass Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# ChainPass API Configuration (Optional - defaults to Supabase URL/Key)
VITE_CHAINPASS_API_URL=https://your-project-ref.supabase.co
VITE_CHAINPASS_API_KEY=your_supabase_anon_key
```

**Note:** If `VITE_CHAINPASS_API_URL` and `VITE_CHAINPASS_API_KEY` are not provided, the compliance service will automatically use the Supabase URL and anon key.

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Troubleshooting

### Build Errors

If you encounter Rollup build errors:

1. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check environment variables:**
   - Ensure `.env` file exists
   - Verify all required variables are set
   - Check that values don't have extra spaces or quotes

3. **TypeScript errors:**
   ```bash
   npm run build
   ```
   This will show TypeScript compilation errors if any exist.

### Common Issues

- **"Cannot find module" errors:** Run `npm install` to ensure all dependencies are installed
- **Environment variable errors:** Check that `.env` file exists and has correct variable names (must start with `VITE_`)
- **Import errors:** Verify all file paths use the `@/` alias correctly (defined in `vite.config.ts`)

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `pages/` - Page components
  - `services/` - API services (including `chainpassComplianceService.ts`)
  - `hooks/` - React hooks (including `useVAICompliance.ts`)
  - `integrations/` - External integrations (Supabase, etc.)
- `supabase/` - Supabase configuration
  - `migrations/` - Database migrations
  - `functions/` - Edge functions
- `public/` - Static assets

## New Files Added

### Platform Compliance API

- `supabase/migrations/20250120000001_platform_compliance.sql` - Database migration
- `supabase/functions/vai-compliance-check/index.ts` - Edge function
- `src/services/chainpassComplianceService.ts` - Service class
- `src/hooks/useVAICompliance.ts` - React hook
- `docs/PLATFORM-COMPLIANCE-API.md` - API documentation

## Next Steps

1. Apply database migration in Supabase
2. Deploy edge function: `supabase functions deploy vai-compliance-check`
3. Configure environment variables
4. Test the compliance API


