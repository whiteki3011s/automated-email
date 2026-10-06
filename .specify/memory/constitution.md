<!--
Sync Impact Report:
- Version Change: 1.1.0 -> 1.2.0 (Minor Version Bump - High-Need SMB Targeting & MNC Exclusion Criteria)
- Added Sections:
  - Principle IV: Targeted Prospect Sourcing & Need-Based Qualification (Added MNC exclusion rules, SMB focus, social media + web scraping, and verifiable service need filters)
- Modified Principles:
  - Principle I: Architectural Integrity & Pipeline Isolation (Updated targeting phase to reflect SMB web/social scraping and MNC exclusion)
- Removed Sections: None
- Deferred Items: Feature specs and implementation plans for auto-scraping filters, MNC exclusion heuristics, social media scraper adapters, and order handoff workflows (deferred to /speckit-specify).
-->

# Autonomous B2B Lead Generation & Outreach Engine Constitution

## Core Principles

### I. Architectural Integrity & Pipeline Isolation
The system MUST decouple user dashboard interactions from background automation. Outreach operations MUST be structured into five distinct, asynchronous phases:
1. **Targeting & Automated Scraping:** Discover and scrape 100–200 high-intent client prospects daily across targeted web and social platforms (Instagram, LinkedIn, X/Twitter, Google Maps, SerpAPI, Firecrawl) while strictly excluding MNCs and large enterprise corporations.
2. **Scraping & Enrichment:** Extract target site/profile content, tech stacks, and verifiable flaw observations out-of-band using headless/scraping workers.
3. **AI Hyper-Personalization:** Pass enriched profile and site data to LLMs via LangChain to generate tailored pitches for cold emails and multi-channel DMs based on identified service gaps.
4. **Sending & Messaging Infrastructure:** Queue and dispatch multi-channel outreach across distributed email inboxes and messaging platform integrations.
5. **Response Classification & Routing:** Monitor incoming replies, automatically parse intent (interested, objection, unsubscribe), and route confirmed orders directly to the operator.

All pipeline processes MUST run inside a resilient background job engine (BullMQ or Inngest) with exponential retries, failure isolation, and transparent status tracking.

### II. Deliverability, Inbox & Account Protection (NON-NEGOTIABLE)
System sustainability and account safety take precedence over raw sending volume.
- The engine MUST strictly enforce inbox rate limits (maximum 40 emails per day per connected inbox).
- Outreach MUST load-balance outbound messages across multiple sender domains, SMTP credentials, and platform accounts.
- Cold emails MUST be formatted strictly as plain text (no HTML bodies, embedded images, or tracking pixels) to ensure optimal deliverability.
- Social DMs and messaging outreach MUST observe platform-specific throttling, daily quota caps, and warm-up schedules to prevent account flags or suspensions.

### III. Grounded AI Personalization & Multi-Channel Pitching
AI-generated outreach MUST NOT fabricate unverified details about target clients.
- Pitch prompts MUST ingest extracted prospect data and synthesize specific, evidence-backed observations (e.g., UI/UX flaws, technical bottlenecks, missing integrations, or unoptimized digital presence).
- Value propositions MUST directly connect observed prospect pain points to offered service capabilities.
- Prompts MUST produce natural, high-converting plain-text emails and channel-appropriate short direct messages free of spammy marketing jargon.

### IV. Targeted Prospect Sourcing & Need-Based Qualification (NON-NEGOTIABLE)
The engine MUST target high-potential, underserved businesses while strictly filtering out unsuitable prospects.
- **Enterprise & MNC Exclusion:** The sourcing filter MUST automatically detect and exclude Multinational Corporations (MNCs), enterprise conglomerates, and large established corporations with fully staffed in-house teams.
- **SMB & Growth Business Focus:** Sourcing MUST prioritize small-to-medium businesses (SMBs), rising brands ("businesses on the rise"), local service providers, and growing startups scraped from social media (Instagram, LinkedIn, X/Twitter) and web directories.
- **Verifiable Need Requirement:** A prospect MUST demonstrate actionable service gaps (e.g., outdated or broken website, missing mobile optimization, poor conversion UI, absent digital presence) before passing qualification into the enrichment and pitching queues.
- **Daily Throughput Target:** The system MUST reliably source, qualify, and enrich 100–200 high-need prospects per day using automated background cron workers with mandatory deduplication.

### V. High-Contrast Industrial Dark-Mode UI Standard
The User Dashboard MUST present a high-end operating system experience for monitoring automated operations:
- **Aesthetic:** Obsidian dark-mode palette (`#09090b` obsidian dark backgrounds with deep black panels).
- **Accents:** Liquid silver highlights and stark accent red indicators for alerts and high-priority status items.
- **Components:** Glassmorphic OS-style container panels, ultra-crisp typography, and smooth micro-interactions (using Framer Motion or GSAP).
- **Navigation:** Multi-column dashboard layout designed to feel like an industrial command center.

### VI. End-to-End Autonomous Business Pipeline & Zero-Friction Handoff
The system MUST automate all front-of-house business operations—from prospecting and scraping to pitch generation, sending, and reply triage—so the human operator's sole responsibility is client order fulfillment.
- Auto-pilot mode MUST support hands-off execution once targeting criteria and template guardrails are set by the operator.
- An optional Human-in-the-Loop review toggle MUST allow manual approval of generated drafts when desired without breaking full auto-pilot capability.
- Qualified leads or custom order requests MUST generate structured order tickets and instant alerts so the operator can immediately begin fulfillment.

## Tech Stack & Architectural Standards

### Stack Constraints
- **Frontend & Framework:** Next.js (App Router), React, Tailwind CSS, Framer Motion / GSAP.
- **Backend & Database:** Node.js, Prisma ORM with PostgreSQL.
- **AI & Automation:** LangChain with OpenAI (GPT-4o) / Gemini (1.5 Pro), BullMQ / Inngest.
- **Scraping & Multi-Channel APIs:** Firecrawl / Apify / SerpAPI, Social Media Graph/Scraper Adapters, Resend / Nodemailer SMTP, and modular DM messaging adapters.

## Development Workflow & Quality Gates

1. **Database Safety:** All schema changes MUST be authored via Prisma migrations in `prisma/schema.prisma` before implementation.
2. **Queue Resilience:** Background job handlers MUST implement exponential backoff, dead-letter logging, and concurrency control to adhere to platform rate limits.
3. **Deliverability Validation:** Plain-text sanitation filters MUST sanitize generated emails and DMs to prevent formatting leaks prior to dispatch.
4. **Automated Order Triggering:** Inbound reply handlers MUST maintain audit trails for intent classification and trigger order creation upon positive response verification.

## Governance

- This Constitution governs all architectural choices, data structures, automation pipelines, and UI decisions across the project.
- Amendments to principles require version updates following semantic versioning rules:
  - **MAJOR:** Removal or fundamental restructuring of core principles (e.g. deliverability rules, autonomous execution model, or safety guardrails).
  - **MINOR:** Addition of new operational principles, messaging channel support, or tech stack capabilities.
  - **PATCH:** Wording clarifications, typo fixes, or minor guidance updates.

**Version**: 1.2.0 | **Ratified**: 2026-10-03 | **Last Amended**: 2026-10-06
