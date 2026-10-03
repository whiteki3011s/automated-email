# API Route Contracts: Autonomous B2B Lead Generation & Outreach Engine

**Feature**: [`specs/001-b2b-outreach-engine/spec.md`](file:///Users/abhaysharma/all_codes/outreach/specs/001-b2b-outreach-engine/spec.md)
**Date**: 2026-10-03

## REST Endpoints

### 1. Ingest Target Domains
* **Method**: `POST`
* **Path**: `/api/ingest`
* **Content-Type**: `application/json` or `multipart/form-data`
* **Request Body (JSON)**:
  ```json
  {
    "campaignId": "cuid_string",
    "domains": ["example1.com", "example2.com"]
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "ingestedCount": 2,
    "leads": [
      { "id": "lead_1", "domain": "example1.com", "status": "SOURCED" },
      { "id": "lead_2", "domain": "example2.com", "status": "SOURCED" }
    ]
  }
  ```

---

### 2. Fetch Lead Pipeline Data (Kanban View)
* **Method**: `GET`
* **Path**: `/api/leads?campaignId=cuid_string`
* **Response (200 OK)**:
  ```json
  {
    "SOURCED": [ { "id": "l1", "domain": "acme.com", "companyName": "Acme Inc" } ],
    "SCRAPED": [ { "id": "l2", "domain": "globex.com", "flawsFound": ["Slow load", "Mobile layout overflow"] } ],
    "AI_DRAFTED": [ { "id": "l3", "domain": "stark.com", "emails": [{ "id": "e1", "subject": "Quick UI note for stark.com" }] } ],
    "APPROVED": [ ... ],
    "SENT": [ ... ],
    "REPLIED": [ ... ]
  }
  ```

---

### 3. Review & Approve/Reject Email Draft
* **Method**: `PATCH`
* **Path**: `/api/drafts/[id]`
* **Request Body**:
  ```json
  {
    "action": "APPROVE", // or "REJECT", "UPDATE"
    "subject": "Updated subject line",
    "bodyText": "Updated plain text body content..."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "email": {
      "id": "e1",
      "status": "QUEUED",
      "subject": "Updated subject line",
      "bodyText": "Updated plain text body content..."
    }
  }
  ```

---

### 4. Trigger Pipeline Processing
* **Method**: `POST`
* **Path**: `/api/pipeline/trigger`
* **Request Body**:
  ```json
  {
    "campaignId": "cuid_string",
    "phase": "ALL" // "SCRAPE", "AI_DRAFT", "DISPATCH"
  }
  ```
* **Response (202 Accepted)**:
  ```json
  {
    "success": true,
    "message": "Pipeline jobs queued successfully",
    "jobIds": ["scrape_cuid_1", "ai_cuid_2"]
  }
  ```

---

### 5. Inbox Configuration & Connection Test
* **Method**: `POST`
* **Path**: `/api/settings/inbox`
* **Request Body**:
  ```json
  {
    "senderName": "Abhay Sharma",
    "fromEmail": "abhay@domain.com",
    "smtpHost": "smtp.domain.com",
    "smtpPort": 587,
    "smtpUser": "abhay@domain.com",
    "smtpPass": "password123",
    "dailyLimit": 40
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "inboxId": "inbox_cuid_123",
    "status": "ACTIVE"
  }
  ```
