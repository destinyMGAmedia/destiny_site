# DMGA Project: AI Tool Rule Book & Safeguards

This document defines mandatory rules for AI tools (Junie, Claude, etc.) and developers working on the DMGA project. These rules are designed to prevent data loss and ensure system stability.

## 1. Database Operations (CRITICAL)
- **RESTRICTED DESTRUCTIVE PUSH**: Only use `npx prisma db push --accept-data-loss` if the user explicitly types it in the current prompt. Before executing, the AI tool MUST summarize the potential data loss and ask for final confirmation from the user.
- **RESTRICTED MIGRATION RESET**: Only use `npx prisma migrate reset` or any command that deletes existing database records if explicitly requested by the user and after receiving a clear confirmation.
- **SAFE UPDATES PREFERRED**: Default to non-destructive updates (e.g., adding a new optional field, adding a new table) using standard `prisma db push`. If a change requires data transformation, use a migration script or a custom seed/update script instead.
- **BACKUP BEFORE SYNC**: Before performing any operation that might affect database structure, verify the current state and ensure there is a recovery plan.

## 2. Mandatory Testing (STRICT)
- **BACKEND ENDPOINTS**: Every new API route added to the project (under `src/app/api/...`) MUST have a corresponding test file (e.g., a `.test.js` file or a verification script in `scripts/tests/`).
- **FRONTEND FEATURES**: Every new major UI component or feature (under `src/components/...` or `src/app/...`) MUST have associated tests or a clear verification checklist.
- **REGRESSION CHECKS**: Before submitting any change, run all existing verification scripts to ensure no existing functionality (like Ark Centers, Growth Tracks, or Devotionals) is broken.

## 3. Deployment & Environment
- **VERCEL SYNC**: Ensure all environment variables required for new features are documented and can be added to Vercel without manual errors.
- **PRISMA GENERATION**: Always run `npx prisma generate` after schema changes to ensure the client is in sync.

## 4. AI Tool Interaction
- **READ RULES FIRST**: AI tools must read this file at the start of every session.
- **VALIDATE BEFORE SUBMIT**: AI tools must run `node ai-hook.js` (if available) to verify compliance with these rules before submitting a solution.

---
*Failure to follow these rules, especially those leading to database data loss, is considered a critical error.*
