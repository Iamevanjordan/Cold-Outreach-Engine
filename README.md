# Cold Outreach Engine (C.O.E.)

A lightweight, Google Apps Script–based outreach automation system designed to manage multi-step cold email sequences directly from Google Sheets with safety, transparency, and control.

C.O.E. prioritizes **correctness, deliverability, and operator awareness** over brute-force sending. It is intentionally opinionated toward small teams, solo operators, and early-stage workflows that need reliability more than scale-at-all-costs.

---

## Why C.O.E. Exists

Most cold outreach tools abstract away what’s actually happening under the hood, making it hard to reason about deliverability, sequencing logic, or failure states.

C.O.E. takes the opposite approach:

* Your data lives in **Google Sheets**
* Your logic lives in **Apps Script**
* Your sends happen through **your own Gmail account**

Nothing hidden. Nothing proprietary. Full visibility.

---

## Core Capabilities

* Multi-step drip sequences (configurable)
* Daily send caps with safety warnings
* Row-level eligibility checks before sending
* Automatic sequence progression and completion
* Reply-aware stopping logic
* Gmail label application for sent outreach
* Human-readable logs for auditing and debugging

---

## System Architecture

The project is intentionally modular and split across four files:

```
code.gs        → Main orchestration & send loop
labeler.gs    → Gmail label creation and application
constants.gs  → All user-editable configuration
utilities.gs  → Shared helper and logging functions
```

### Design Philosophy

* **Configuration over code edits**: users only touch `constants.gs`
* **Fail safe, not fast**: clear exit conditions, explicit caps, logged warnings
* **Spreadsheet-first state**: the sheet is the single source of truth

---

## How It Works (High-Level Flow)

1. Reads all rows from a configured Google Sheet
2. Normalizes and validates required headers
3. Initializes missing statuses as `NEW`
4. Iterates row-by-row, applying strict eligibility checks
5. Sends the correct email template for the current sequence step
6. Updates status, timestamps, and next-contact dates
7. Applies a Gmail label to the sent thread
8. Stops automatically when:

   * Daily cap is reached
   * Lead replies
   * Sequence is complete
   * An error occurs

---

## Required Spreadsheet Columns

C.O.E. is flexible with naming, but requires equivalents of:

* `contact_email`
* `status`
* `ready_to_send` (expects `Y`)
* `sequence_step`

Optional (but supported):

* `first_name`
* `last_contact_date`
* `next_contact_date`
* `reply_status`
* `error_message`

Header matching is **case-insensitive** and supports common aliases.

---

## Configuration (constants.gs)

All user-facing configuration lives in **one file**:

```js
const DAILY_CAP = 2;
const MAX_SEQUENCE_STEPS = 3;
const DRIP_INTERVAL_DAYS = 1;
```

Email copy is defined as an array of templates:

```js
const EMAIL_TEMPLATES = [
  { subject: "Hey {{firstName}}", body: "..." },
  { subject: "Following up {{firstName}}", body: "..." }
];
```

This structure allows non-technical users to modify behavior safely.

---

## Safety & Deliverability Considerations

* Hard daily caps prevent accidental over-sending
* Warning logs appear if caps exceed conservative thresholds
* Sequence stops immediately on reply
* Gmail-native sending avoids third-party relay risk

This system is intentionally conservative by default.

---

## Example Use Cases

* Solo founders doing early outbound
* Small agencies managing controlled outreach
* Operators who want transparency over automation
* Teams testing messaging before moving to heavier tooling

---

## What This Is *Not*

* A mass-blast email tool
* A replacement for ESPs at large scale
* A UI-driven SaaS product

C.O.E. is a **systems-first utility**, not a growth hack.

---

## License

MIT — use, modify, and adapt freely.

---

## Notes for Interviewers

This project emphasizes:

* Clear state management
* Defensive programming
* Operator trust and visibility
* Practical automation over abstraction

Happy to walk through design decisions, tradeoffs, and future extensions live :)
