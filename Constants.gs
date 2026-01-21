/**
 * GLOBAL CONSTANTS - v2.0
 * Users only edit this file.
 */

// 🔹 Spreadsheet Config
const SHEET_ID   = "ENTER_SHEET_ID_HERE";
const SHEET_NAME = "SHEET_NAME";

// 🔹 Sending Behavior
const DAILY_CAP        = 2;    // Max emails sent per day
const SEND_DELAY_MS    = 2000; // Delay between sends in ms
const MAX_SEQUENCE_STEPS = 3;  // How many emails max per lead
const DRIP_INTERVAL_DAYS = 1;  // Days between drip emails

// 🔹 Email Templates (multi-step drip sequence)
// Add or remove objects in this array to control how many steps exist.
// Use \n\n for new paragraphs. {{firstName}} auto-fills with the contact’s first name.
const EMAIL_TEMPLATES = [
  {
    subject: "Hey {{firstName}}, quick question",
    body: "Hi {{firstName}},\n\nThis is sample outreach email #1.\nReplace this with your real message!\n\n- Your Name"
  },
  {
    subject: "Just checking in, {{firstName}}",
    body: "Hi {{firstName}},\n\nThis is sample outreach email #2.\nYou can add as many follow-ups as you want.\n\n- Your Name"
  },
  {
    subject: "Final note, {{firstName}}",
    body: "Hi {{firstName}},\n\nThis is sample outreach email #3.\nAfter this, the system will automatically stop emailing this lead.\n\n- Your Name"
  }
];

// 🔹 Status Constants
const STATUS_NEW      = "NEW";
const STATUS_SENT     = "SENT";
const STATUS_ERROR    = "ERROR";
const STATUS_COMPLETE = "COMPLETE";
const STATUS_REPLIED  = "REPLIED";

// 🔹 Gmail Labeling
const OUTREACH_LABEL = "C.O.E.Outreach";

// 🔹 Notes
// Gmail free safe: ≈400/day
// Workspace safe: ≈2000/day
// ⚠️ Above 500/day on a fresh account risks deliverability
