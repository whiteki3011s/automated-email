# Research & Decisions: Autonomous B2B Lead Generation & Outreach Engine

**Feature**: [`specs/001-b2b-outreach-engine/spec.md`](file:///Users/abhaysharma/all_codes/outreach/specs/001-b2b-outreach-engine/spec.md)
**Date**: 2026-10-03

## Research Topics & Decisions

### 1. Job Queue & Worker Architecture (BullMQ vs. Inngest)
* **Decision**: BullMQ backed by Redis (`ioredis`).
* **Rationale**: BullMQ provides precise control over job rate limits (`limiter: { max: 40, duration: 86400000 }`), delayed retries, concurrency constraints per worker, and explicit queue state management. This directly supports the constitution requirement for strict 40 emails/day per inbox limits.
* **Alternatives Considered**: Inngest (cloud dependent, less local offline queue control for custom SMTP rate-limiting).

### 2. Scraping & Flaw Extraction Pipeline (Firecrawl API + Cheerio Fallback)
* **Decision**: Firecrawl Node.js SDK (`@mendable/firecrawl-js`) as primary web scraper, with Cheerio as a fallback parser.
* **Rationale**: Firecrawl cleanly handles JS rendering, strips clutter, and returns clean Markdown/Text content for LLM ingestion. Cheerio handles fast DOM extraction for static HTML sites when API keys are not provided.
* **Alternatives Considered**: Puppeteer/Playwright (high RAM overhead, difficult to maintain in lightweight worker processes).

### 3. AI Hyper-Personalization Engine (LangChain + GPT-4o)
* **Decision**: LangChain (`@langchain/openai`, `@langchain/core`) utilizing `ChatOpenAI` (GPT-4o) with structured output JSON parsing (`withStructuredOutput` or `zodSchema`).
* **Rationale**: Two-pass LLM pipeline:
  1. **Pass 1 (Analysis):** Analyzes raw website markdown text to output a JSON array of specific technical and design flaws (e.g. outdated typography, lack of mobile CTAs, slow LCP hints).
  2. **Pass 2 (Generation):** Ingests identified flaws + company service positioning context to draft a concise plain-text email pitching UI/UX and web development services.
* **Alternatives Considered**: Direct fetch calls to OpenAI API (lacks LangChain's standardized prompt templates and structured output parsers).

### 4. Sending Infrastructure & Rate Limiting (Multi-Inbox SMTP / Resend)
* **Decision**: Nodemailer with custom SMTP transport load balancer + Resend API integration support.
* **Rationale**: Nodemailer allows connecting any standard SMTP provider (Google Workspace, Outlook, Custom Mail Servers). A Redis atomic counter (`INBOX:ID:SENT_COUNT`) tracks daily sends.
* **Deliverability Guarantee**: Output is sanitized with a plain-text enforcement layer that strips all HTML formatting, inline styles, and image tags prior to dispatch.

### 5. Frontend UI Design System (Obsidian Industrial Dark Mode)
* **Decision**: Next.js App Router (React 18/19), Tailwind CSS, Framer Motion, and Lucide React icons.
* **Rationale**: CSS custom variables for obsidian dark tokens (`#09090b` main surface, `#121215` panel surface, `#e2e8f0` liquid silver typography, `#ef4444` stark accent red). Framer Motion handles glassmorphic panel animations and Kanban drag-and-drop transitions smoothly.
* **Alternatives Considered**: Tailwind UI / Shadcn standard defaults (generic appearance, replaced with custom industrial dark design tokens).
