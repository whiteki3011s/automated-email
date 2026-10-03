<!--
Sync Impact Report:
- Version Change: 0.0.0 -> 1.0.0 (Initial Ratification)
- Added Sections:
  - Core Principles (I. Architectural Integrity & Pipeline Isolation, II. Inbox Deliverability & Domain Protection, III. Grounded AI Personalization, IV. High-Contrast Industrial Dark-Mode UI Standard, V. Human-in-the-Loop & State Transparency)
  - Tech Stack & Architectural Standards
  - Development Workflow & Quality Gates
  - Governance
- Modified Principles: N/A (Initial ratification)
- Deferred Items: Proposing Prisma schema, npm dependencies list, initial project directory layout, API route generation, component design.
-->

# Autonomous B2B Lead Generation & Outreach Engine Constitution

## Core Principles

### I. Architectural Integrity & Pipeline Isolation
The system MUST decouple user dashboard interactions from background automation. Outreach operations MUST be structured into four distinct, asynchronous phases:
1. **Ingestion & Targeting:** Ingest domain inputs via CSV uploads or API integrations (SerpAPI, Apollo).
2. **Scraping & Enrichment:** Extract website content and evaluate technical/design flaws out-of-band using headless/scraping services (Firecrawl, Apify).
3. **AI Hyper-Personalization:** Pass site content to LLMs via LangChain to generate personalized cold email pitches based strictly on identified flaws.
4. **Sending Infrastructure:** Queue and dispatch emails via dedicated SMTP/Resend workers.

All pipeline processes MUST run inside a dedicated queue or cron engine (BullMQ or Inngest) with retries, failure isolation, and clear status tracking.

### II. Inbox Deliverability & Domain Protection (NON-NEGOTIABLE)
Sender reputation and deliverability take precedence over outreach volume.
- The engine MUST strictly enforce rate limits (maximum 40 emails per day per connected inbox).
- Outreach MUST load-balance sending across multiple sender domains and SMTP credentials.
- All outgoing emails MUST be formatted strictly as plain text (no HTML body, embedded images, or tracking pixels) to minimize spam filter detection.

### III. Grounded AI Personalization & Pitching
AI-generated outreach MUST NOT invent unverified facts about target domains.
- Pitch prompts MUST ingest extracted site content and synthesize specific, evidence-backed UI/UX and web development flaw observations.
- Value propositions MUST clearly link observed site weaknesses to offered web design and development capabilities.
- Prompts MUST produce clean, conversational, plain-text emails free of generic marketing jargon.

### IV. High-Contrast Industrial Dark-Mode UI Standard
The User Dashboard MUST present a high-end operating system experience for managing lead pipelines:
- **Aesthetic:** Obsidian dark-mode palette (`#09090b` / obsidian dark backgrounds with deep black panels).
- **Accents:** Liquid silver highlights and stark accent red indicators for status/action highlights.
- **Components:** Glassmorphic OS-style container panels, ultra-crisp typography, and smooth micro-interactions (using Framer Motion or GSAP).
- **Navigation:** Multi-column/sidebar layout designed to feel like a modern industrial command center.

### V. Human-in-the-Loop & State Transparency
Lead state progression MUST be explicit and deterministic (`Sourced` -> `Scraped` -> `AI Drafted` -> `Sent` -> `Replied`).
- The system MUST provide an explicit manual approval interface where operators can review, edit, or reject AI-generated drafts prior to queueing for dispatch.
- Every state transition MUST be logged with timestamps and associated audit trails.

## Tech Stack & Architectural Standards

### Stack Constraints
- **Frontend & Framework:** Next.js (App Router), React, Tailwind CSS, Framer Motion / GSAP.
- **Backend & Database:** Node.js, Prisma ORM with PostgreSQL.
- **AI & Automation:** LangChain with OpenAI (GPT-4o) / Gemini (1.5 Pro), BullMQ / Inngest.
- **Scraping & Email APIs:** Firecrawl / Apify, Resend / Nodemailer SMTP.

## Development Workflow & Quality Gates

1. **Database Safety:** All schema changes MUST be authored via Prisma migrations in `prisma/schema.prisma` before implementation.
2. **Queue Resilience:** Background job handlers MUST implement exponential backoff, dead-letter logging, and concurrency control to adhere to inbox limits.
3. **Deliverability Validation:** Plain-text sanitation filters MUST sanitize generated emails to prevent accidental HTML snippet inclusion before sending.

## Governance

- This Constitution governs all architectural choices, data structures, and UI decisions across the project.
- Amendments to principles require version updates following semantic versioning rules:
  - **MAJOR:** Removal or fundamental restructuring of core principles (e.g. deliverability rules or human-in-the-loop requirement).
  - **MINOR:** Addition of new operational principles or tech stack additions.
  - **PATCH:** Wording clarifications, typo fixes, or minor guidance updates.

**Version**: 1.0.0 | **Ratified**: 2026-10-03 | **Last Amended**: 2026-10-03
