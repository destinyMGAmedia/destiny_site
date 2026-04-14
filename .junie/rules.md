# DMGA AI Rules & Guidelines

These rules are MANDATORY for all AI sessions working on the DMGA project.

## 1. Database Safety
- **DESTRUCTIVE PUSH**: Only use `prisma db push --accept-data-loss` if explicitly requested by the user in the current prompt. ALWAYS ask for confirmation and explain potential data loss first.
- **MIGRATION RESET**: Only use `prisma migrate reset` if explicitly requested and confirmed.
- If a database change is needed, verify if it is non-destructive first. Prefer safe updates.
- Always check if the current database state matches the schema before pushing.

## 2. Mandatory Testing
- For every new API route in `src/app/api/...`, you must create a corresponding test or verification script.
- For every new major UI feature/component in `src/components/...` or `src/app/...`, you must create a corresponding test or verification plan.
- Run `npm run validate:ai` to ensure compliance before finishing your task.

## 3. Tool Usage
- Read `AI_RULES.md` in the project root for more detailed rules.
- Follow the existing project structure and design patterns.
- Ensure all environment variables are documented.

## 4. Verification
- After any database or content change, run the relevant verification scripts to ensure no data was lost.
- Check the dashboard and public pages to ensure they still load correctly.
