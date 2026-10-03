# Implementation Plan: Autonomous B2B Lead Generation & Outreach Engine

**Branch**: `001-b2b-outreach-engine` | **Date**: 2026-10-03 | **Spec**: [`specs/001-b2b-outreach-engine/spec.md`](file:///Users/abhaysharma/all_codes/outreach/specs/001-b2b-outreach-engine/spec.md)

**Input**: Feature specification from `/specs/001-b2b-outreach-engine/spec.md`

## Summary

Build an autonomous B2B lead generation and email outreach engine with an industrial dark-mode user dashboard. The engine runs a 4-stage pipeline (Ingestion, Scraping/Enrichment, AI Personalization, Rate-Limited Plain-Text Dispatch) using Next.js (App Router), Prisma with PostgreSQL, BullMQ job queues with Redis, LangChain (GPT-4o), and Nodemailer/Resend SMTP transports.

## Technical Context

**Language/Version**: TypeScript / Node.js v20+
**Primary Dependencies**: Next.js 14+ (App Router), React 18, Tailwind CSS, Framer Motion, Prisma ORM, BullMQ, ioredis, LangChain (`@langchain/openai`), Nodemailer, Resend SDK.
**Storage**: PostgreSQL database (managed via Prisma ORM) + Redis (for BullMQ queues & rate limit state).
**Testing**: Playwright / Jest / Vitest for API and queue contracts.
**Target Platform**: Node.js server environment / Web browser.
**Project Type**: Full-stack Next.js Web Application with Background Queue Workers.
**Performance Goals**: Dashboard page load < 1s; asynchronous background pipeline processing 50 leads in < 5 minutes.
**Constraints**: Hard daily sending limit of 40 emails/day per connected inbox; 100% plain-text email body enforcement; obsidian dark-mode design system (`#09090b`).
**Scale/Scope**: Multi-campaign management, up to 10 active sender inboxes, thousands of processed lead domain records.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Plan Status |
|-----------|-------------|-------------|
| **I. Architectural Integrity** | Decoupled 4-stage pipeline running out-of-band via BullMQ queues | **PASS** — BullMQ workers handle scraping, AI drafting, and email dispatch asynchronously. |
| **II. Inbox Protection** | Hard rate limit (max 40/day per inbox), multi-inbox rotation, 100% plain text | **PASS** — Redis atomic rate counters per inbox, plain-text email sanitizer. |
| **III. Grounded AI Personalization** | AI pitches based strictly on scraped site flaw analysis | **PASS** — 2-pass LangChain pipeline (site flaw extraction -> pitch generation). |
| **IV. Industrial Dark UI** | Obsidian dark layout (`#09090b`), liquid silver accents, stark red indicators | **PASS** — Tailored Tailwind theme and glassmorphic UI components. |
| **V. Human-in-the-Loop** | Explicit draft review and manual approval before queue dispatch | **PASS** — Approval queue UI requiring explicit user approval (`Approved` status). |

## Project Structure

### Documentation (this feature)

```text
specs/001-b2b-outreach-engine/
├── plan.md              # Implementation plan
├── research.md          # Technology decisions & rationale
├── data-model.md        # Prisma models, field definitions & state machine
├── quickstart.md        # End-to-end setup and validation guide
└── contracts/           # API and Queue payload contracts
    ├── api-routes.md
    └── queue-jobs.md
```

### Source Code (repository root)

```text
outreach/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                       # Command Center Dashboard
│   │   ├── pipeline/
│   │   │   └── page.tsx                   # Lead Pipeline Kanban Board
│   │   ├── approval/
│   │   │   └── page.tsx                   # Draft Review & Approval Interface
│   │   ├── settings/
│   │   │   └── page.tsx                   # Campaign & Inbox Settings
│   │   └── api/
│   │       ├── ingest/route.ts            # CSV / Manual Domain Ingestion API
│   │       ├── leads/route.ts             # Lead state updates & list API
│   │       ├── drafts/[id]/route.ts       # AI draft approval & edit API
│   │       ├── pipeline/trigger/route.ts  # Trigger pipeline workers API
│   │       └── settings/inbox/route.ts    # Inbox & SMTP credentials API
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── ui/                            # Obsidian Industrial Glassmorphic UI
│   │   │   ├── GlassPanel.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   └── StatCard.tsx
│   │   ├── dashboard/
│   │   │   ├── MetricsOverview.tsx
│   │   │   └── ActivityFeed.tsx
│   │   ├── pipeline/
│   │   │   ├── KanbanBoard.tsx
│   │   │   └── LeadCard.tsx
│   │   └── approval/
│   │       └── DraftEditor.tsx
│   ├── lib/
│   │   ├── prisma.ts                      # Prisma Client Instance
│   │   ├── queue/                         # BullMQ setup & queue instances
│   │   │   ├── client.ts
│   │   │   ├── scrapingWorker.ts
│   │   │   ├── aiWorker.ts
│   │   │   └── sendingWorker.ts
│   │   ├── scraping/                      # Firecrawl & HTML Scraper logic
│   │   │   └── scraper.ts
│   │   ├── ai/                            # LangChain + LLM flaw generator
│   │   │   ├── prompts.ts
│   │   │   └── generator.ts
│   │   └── mailer/                        # Plain text SMTP & Rate-limiter
│   │       └── sender.ts
│   └── styles/
│       └── globals.css                    # Industrial Obsidian & Liquid Silver styles
├── package.json
└── tailwind.config.js
```

**Structure Decision**: Standard Next.js Full-Stack App structure with co-located API routes, components, and modular background queue worker files under `src/lib/queue`.

## Complexity Tracking

*No constitution violations present. All architectural decisions strictly conform to project constitution v1.0.0.*
