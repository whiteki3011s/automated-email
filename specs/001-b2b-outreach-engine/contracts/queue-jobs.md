# Queue Job Payload Contracts: Autonomous B2B Lead Generation & Outreach Engine

**Feature**: [`specs/001-b2b-outreach-engine/spec.md`](file:///Users/abhaysharma/all_codes/outreach/specs/001-b2b-outreach-engine/spec.md)
**Date**: 2026-10-03

## BullMQ Job Contracts

### 1. Queue: `scrape-lead-queue`
Worker extracts target website HTML/Markdown content and identifies visual/technical flaws.

* **Job Name**: `scrape-lead`
* **Payload**:
  ```json
  {
    "leadId": "lead_cuid_123",
    "domain": "example.com"
  }
  ```
* **Completion Event Output**:
  ```json
  {
    "leadId": "lead_cuid_123",
    "status": "SCRAPED",
    "flawsFoundCount": 3
  }
  ```

---

### 2. Queue: `ai-draft-queue`
Worker ingests scraped website text and identified flaws, then invokes LangChain GPT-4o to generate a plain-text cold pitch.

* **Job Name**: `generate-ai-draft`
* **Payload**:
  ```json
  {
    "leadId": "lead_cuid_123",
    "campaignId": "campaign_cuid_456"
  }
  ```
* **Completion Event Output**:
  ```json
  {
    "leadId": "lead_cuid_123",
    "emailId": "email_cuid_789",
    "status": "AI_DRAFTED"
  }
  ```

---

### 3. Queue: `dispatch-email-queue`
Worker load-balances approved emails across active sender inboxes, checks daily rate limits, and sends plain-text emails via Nodemailer/Resend.

* **Job Name**: `dispatch-email`
* **Limiter Configuration**: `max: 40, duration: 86400000` (per inbox key)
* **Payload**:
  ```json
  {
    "emailId": "email_cuid_789",
    "leadId": "lead_cuid_123"
  }
  ```
* **Completion Event Output**:
  ```json
  {
    "emailId": "email_cuid_789",
    "inboxId": "inbox_cuid_001",
    "status": "SENT",
    "sentAt": "2026-10-03T18:00:00.000Z"
  }
  ```
