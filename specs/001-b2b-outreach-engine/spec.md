# Feature Specification: Autonomous B2B Lead Generation & Outreach Engine

**Feature Branch**: `001-b2b-outreach-engine`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "Build an Autonomous B2B Lead Generation & Outreach Engine with a web-based User Dashboard using Next.js, Node.js, Prisma, PostgreSQL, Tailwind, and LangChain/OpenAI."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Target Domain Ingestion & Pipeline Tracking (Priority: P1)

As an outreach operator, I want to upload target company domain lists via CSV or manual entry and visualize each lead moving through defined lifecycle stages on a Kanban board, so that I maintain complete visibility over lead progression.

**Why this priority**: Ingesting leads and tracking their status is the foundational prerequisite for all automated enrichment and sending workflows.

**Independent Test**: Can be tested by uploading a sample CSV with 5 target domains and verifying that all 5 appear in the `Sourced` column of the Lead Pipeline Kanban board with proper status metadata.

**Acceptance Scenarios**:

1. **Given** an outreach operator on the Lead Pipeline page, **When** they upload a CSV containing valid company domain names, **Then** the system creates corresponding lead entries in `Sourced` status and displays them on the Kanban board.
2. **Given** leads present in the pipeline, **When** a lead transitions through scraping, AI drafting, approval, and sending, **Then** its card automatically moves across the Kanban columns (`Sourced` → `Scraped` → `AI Drafted` → `Approved` → `Sent` → `Replied`).
3. **Given** an invalid or empty domain entry in the uploaded file, **When** ingestion runs, **Then** the system flags the invalid entry with a descriptive error without interrupting valid leads.

---

### User Story 2 - Automated Scraping & Flaw-Based AI Pitch Generation (Priority: P1)

As a business developer, I want the system to scrape target website homepages, identify design and technical flaws, and automatically draft hyper-personalized cold outreach emails pitching UI/UX and web development services, so that every outreach email contains compelling, evidence-backed recommendations.

**Why this priority**: Automated flaw discovery and hyper-personalized email drafting differentiate generic spam from high-converting B2B outreach.

**Independent Test**: Can be tested by executing the enrichment pipeline on a target domain and verifying that extracted text leads to a structured flaw analysis (e.g. mobile responsiveness issues, outdated UI) and a generated plain-text pitch referencing those exact flaws.

**Acceptance Scenarios**:

1. **Given** a lead in `Sourced` status, **When** the scraping worker executes, **Then** website text content is extracted and stored alongside identified technical/UI weaknesses.
2. **Given** scraped site content and identified flaws, **When** the AI drafting phase executes, **Then** a personalized plain-text cold email pitch is created and saved in `AI Drafted` status.
3. **Given** a website that blocks scrapers or times out, **When** scraping fails, **Then** the system marks the lead with a scraping failure error and retries according to queue backoff policies without crashing.

---

### User Story 3 - Human Draft Review & Approval Interface (Priority: P1)

As an outreach manager, I want to review, edit, approve, or reject AI-generated email drafts before they enter the sending queue, so that no automated email is dispatched without explicit human verification.

**Why this priority**: Protects brand reputation and complies with project governance requiring human-in-the-loop validation for automated content.

**Independent Test**: Can be tested by selecting an AI-drafted email, editing the body text, clicking "Approve", and verifying that the lead status updates to `Approved` and enters the queue ready for dispatch.

**Acceptance Scenarios**:

1. **Given** AI-generated drafts in the Approval view, **When** the manager reviews a draft, **Then** they can see the target domain, extracted website flaws, and editable plain-text email content side-by-side.
2. **Given** a modified draft, **When** the manager clicks "Approve", **Then** the draft updates to `Approved` status and becomes eligible for queue dispatch.
3. **Given** an unsatisfactory draft, **When** the manager clicks "Reject", **Then** the draft is marked as `Rejected` and removed from the active sending queue.

---

### User Story 4 - Multi-Inbox Rate-Limited Plain-Text Email Dispatch (Priority: P1)

As an operations lead, I want the engine to send approved emails strictly as plain-text, load-balanced across multiple sender inboxes, with hard daily rate limits per inbox, so that sender domain reputation is strictly protected.

**Why this priority**: Exceeding inbox limits or sending HTML/tracking pixels jeopardizes domain deliverability and risks inbox blacklisting.

**Independent Test**: Can be tested by connecting 2 sender inboxes with a daily limit of 40 emails each, approving 100 emails, and verifying that no single inbox receives more than 40 dispatches per 24-hour window and all outgoing messages are formatted purely in plain text.

**Acceptance Scenarios**:

1. **Given** approved email drafts and connected active inboxes, **When** the dispatch worker executes, **Then** emails are load-balanced across active inboxes while respecting each inbox's 40 email/day ceiling.
2. **Given** an inbox that has reached its daily limit, **When** further emails are ready for dispatch, **Then** the system routes emails to remaining active inboxes or defers sending until the next 24-hour window.
3. **Given** outgoing email payloads, **When** sent to recipients, **Then** the payload contains strictly plain text without HTML wrappers, inline CSS, or images.

---

### User Story 5 - Command Center Analytics & Inbox Configuration (Priority: P2)

As an executive, I want a central dashboard displaying top-level metrics (emails sent, websites scraped, open rates, reply rates) and settings to manage SMTP credentials and service context, so that I can monitor campaign performance and manage sender infrastructure.

**Why this priority**: Enables high-level performance tracking and centralized operational management.

**Independent Test**: Can be tested by navigating to Command Center and Settings to update service positioning context and SMTP inbox credentials, confirming persistence and metric calculation accuracy.

**Acceptance Scenarios**:

1. **Given** the Command Center view, **When** campaign activity occurs, **Then** aggregate numbers for total domains scraped, drafts created, emails sent, and responses received update accurately.
2. **Given** the Settings view, **When** an operator inputs new SMTP credentials and tests connection, **Then** the system validates credentials and saves the inbox as active.
3. **Given** updated service positioning text in Settings, **When** new AI drafts are generated, **Then** the AI prompt incorporates the updated service context into subsequent pitches.

---

### Edge Cases

- **Target Website Scraping Failure:** If a target domain is unreachable, returns 403/500 errors, or uses heavy anti-bot protection, the system MUST log a specific scraping failure status and prevent AI generation on empty content.
- **Inbox Rate Limit Exhaustion:** If all connected sender inboxes reach their daily threshold, the sending worker MUST pause dispatch cleanly and queue remaining approved drafts for the next reset period.
- **SMTP Credential Invalidation:** If an SMTP provider rejects credentials mid-dispatch, the engine MUST mark that specific inbox as `PAUSED` or `RATE_LIMITED` and fallback to remaining active inboxes without losing queued emails.
- **Duplicate Lead Ingestion:** If a domain already exists in an active campaign, the ingestion module MUST flag the duplicate and allow operators to choose whether to overwrite or skip.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support domain and prospect ingestion via CSV file upload and manual single-domain entry.
- **FR-002**: System MUST process scraping out-of-band, extracting website body text, navigation elements, and visual/technical weaknesses.
- **FR-003**: System MUST utilize LLM reasoning to evaluate scraped website content and produce a structured list of specific design/technical flaws.
- **FR-004**: System MUST generate hyper-personalized cold outreach pitches strictly based on identified website flaws and configured service offerings.
- **FR-005**: System MUST enforce human-in-the-loop approval by holding all AI-generated drafts in an approval queue until explicitly approved or edited by an operator.
- **FR-006**: System MUST enforce strict plain-text formatting for all outgoing email dispatches (no HTML tags, tracking pixels, or formatted images).
- **FR-007**: System MUST support connecting and managing multiple sender inboxes with individual SMTP/sending credentials.
- **FR-008**: System MUST enforce a configurable hard rate limit per inbox (default: 40 emails/day) and automatically rotate dispatches across available active inboxes.
- **FR-009**: System MUST present a Lead Pipeline view structured as a Kanban board with column states: `Sourced`, `Scraped`, `AI Drafted`, `Approved`, `Sent`, and `Replied`.
- **FR-010**: System MUST present a Command Center view displaying operational metrics: total domains scraped, emails drafted, emails sent, and reply counts.
- **FR-011**: System MUST provide a Campaign & Inbox Settings interface to configure sender inboxes, daily sending limits, and company service positioning context.
- **FR-012**: System MUST implement background task processing (using job queues) for scraping, AI generation, and email dispatch to ensure UI responsiveness.
- **FR-013**: System MUST strictly adhere to the obsidian dark-mode industrial UI design standard (`#09090b` obsidian dark backgrounds, liquid silver accents, stark red status indicators).

### Key Entities *(include if feature involves data)*

- **Campaign:** Represents an outreach initiative with defined service positioning context and target leads.
- **Lead:** Represents a target company domain, scraped website content, identified technical/UI flaws, and pipeline lifecycle status.
- **Inbox:** Represents a sender email account with SMTP credentials, status tracking, and daily sending counters.
- **Email:** Represents an outreach draft with plain-text subject and body, approval status, target lead link, assigned sender inbox, and dispatch timestamps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of outgoing emails are sent in plain-text format without HTML or image artifacts.
- **SC-002**: No connected inbox exceeds its assigned daily sending quota (default: 40 emails per 24-hour period).
- **SC-003**: Operators can review, edit, and approve an AI email draft in under 30 seconds via the approval interface.
- **SC-004**: System successfully ingests, scrapes, and generates AI pitches for a batch of 50 target domains with an automated pipeline success rate > 90%.
- **SC-005**: User interface page loads and state transitions occur in under 1 second on standard connection speeds.

## Assumptions

- Target websites ingested into the system are publicly accessible via HTTP/HTTPS.
- Operators possess valid SMTP server credentials (or API credentials like Resend) for connected sending inboxes.
- Redis server is available for managing background job queues (BullMQ/Inngest).
- LLM API keys (OpenAI / Gemini) are configured with sufficient rate limits for text generation.
