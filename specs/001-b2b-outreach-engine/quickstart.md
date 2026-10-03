# Quickstart & End-to-End Validation Guide: Autonomous B2B Lead Generation Engine

**Feature**: [`specs/001-b2b-outreach-engine/spec.md`](file:///Users/abhaysharma/all_codes/outreach/specs/001-b2b-outreach-engine/spec.md)
**Plan**: [`specs/001-b2b-outreach-engine/plan.md`](file:///Users/abhaysharma/all_codes/outreach/specs/001-b2b-outreach-engine/plan.md)
**Date**: 2026-10-03

## Environment & Prerequisites Setup

### 1. Environment Variables (`.env`)
Create a `.env` file in the project root with the following variables:
```bash
# Database & Cache
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/outreach_db?schema=public"
REDIS_URL="redis://localhost:6379"

# AI Reasoning (OpenAI / Gemini via LangChain)
OPENAI_API_KEY="sk-..."

# Scraping API (Optional, falls back to Cheerio)
FIRECRAWL_API_KEY="fc-..."

# Default App Port
PORT=3000
```

### 2. Install Dependencies & Seed Database
```bash
# Install NPM packages
npm install

# Push Prisma schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

---

## Runnable Validation Scenarios

### Scenario 1: Target Domain Ingestion & Pipeline Population
1. Start the Next.js development server: `npm run dev`
2. Open the Lead Pipeline view at `http://localhost:3000/pipeline`.
3. Ingest sample target domains via API or CSV upload:
   ```bash
   curl -X POST http://localhost:3000/api/ingest \
     -H "Content-Type: application/json" \
     -d '{"campaignId": "test_campaign", "domains": ["example.com", "stripe.com"]}'
   ```
4. **Expected Outcome**: Lead cards for `example.com` and `stripe.com` appear under the `Sourced` column on the Kanban board.

---

### Scenario 2: Scraping & AI Hyper-Personalization Execution
1. Trigger pipeline processing via API:
   ```bash
   curl -X POST http://localhost:3000/api/pipeline/trigger \
     -H "Content-Type: application/json" \
     -d '{"campaignId": "test_campaign", "phase": "ALL"}'
   ```
2. **Expected Outcome**:
   - The scraping worker extracts site content and identifies flaws. Lead status advances `Sourced` -> `Scraped`.
   - The AI worker generates a plain-text cold pitch using identified flaws. Lead status advances `Scraped` -> `AI_DRAFTED`.

---

### Scenario 3: Human Approval & Plain-Text Dispatch Validation
1. Navigate to the Approval Interface at `http://localhost:3000/approval`.
2. Inspect the generated email draft for `example.com`. Review side-by-side site flaw notes.
3. Click **"Approve"**.
4. **Expected Outcome**:
   - The email record updates to `QUEUED`.
   - The sending worker dispatches the email using an active sender inbox.
   - The outgoing email body is strictly plain-text without HTML tags or image tracking elements.
   - Lead status transitions to `SENT`.
   - The inbox's daily sending counter increments towards its max limit of 40.
