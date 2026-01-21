/**
 * COLD OUTREACH ENGINE - v1.0
 * Full operational build:
 */

function main() {
  logInfo("🚀 Initializing C.O.E...");

  // Cap clamp (warn only, don’t override buyer choice)
  const SAFE_MAX_CAP = 500;
  if (DAILY_CAP > SAFE_MAX_CAP) {
    logInfo(`⚠️ WARNING: DAILY_CAP of ${DAILY_CAP} > safe limit (${SAFE_MAX_CAP}). Use with caution (Workspace users may allow more).`);
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    logError("❌ No rows found (only headers present).");
    return;
  }

  const headers = data[0].map(h => h.toString().toLowerCase().trim());
  logInfo("📝 Headers detected: " + JSON.stringify(headers));

  // Column lookups
  const emailIndex       = findHeaderIndex(headers, ["contact_email","email","emailaddress","email_norm"]);
  const statusIndex      = findHeaderIndex(headers, ["status","email_status","outreach_status"]);
  const readyIndex       = findHeaderIndex(headers, ["ready_to_send","ready","eligible"]);
  const seqIndex         = findHeaderIndex(headers, ["sequence_step","step"]);
  const lastContactIndex = findHeaderIndex(headers, ["last_contact_date","sent_on","last_contacted","date_sent"]);
  const nextContactIndex = findHeaderIndex(headers, ["next_contact_date","next_send","followup_date"]);
  const firstNameIndex   = findHeaderIndex(headers, ["first_name","firstname","name"]);
  const replyIndex       = findHeaderIndex(headers, ["reply_status","replied"]);
  const errorIndex       = findHeaderIndex(headers, ["error_message","error"]);

  if (emailIndex === -1 || statusIndex === -1 || readyIndex === -1 || seqIndex === -1) {
    logError("❌ Missing required columns. Need: contact_email, status, ready_to_send, sequence_step.");
    return;
  }

  // 🔹 Patch: Initialize all blank statuses to "NEW" before processing
  for (let i = 1; i < data.length; i++) {
    if (!data[i][statusIndex]) {
      sheet.getRange(i+1, statusIndex+1).setValue(STATUS_NEW);
    }
  }

  let processedCount = 0;
  let sentCount = 0;

  for (let i = 1; i < data.length; i++) {
    if (sentCount >= DAILY_CAP) {
      logInfo(`⏹️ Hit daily cap of ${DAILY_CAP}. Stopping.`);
      break;
    }

    const row = data[i];
    const email = (row[emailIndex] || "").toString().trim();
    let status = (row[statusIndex] || "").toString().trim().toUpperCase();
    const readyFlag = (row[readyIndex] || "").toString().trim().toUpperCase();
    const firstName = (firstNameIndex !== -1 && row[firstNameIndex]) ? row[firstNameIndex] : "there";
    const sequenceStep = parseInt(row[seqIndex] || 0, 10);
    const replyStatus = (replyIndex !== -1 ? (row[replyIndex] || "").toString().trim().toUpperCase() : "");

    logInfo(`Row ${i+1} → email="${email}", status="${status}", ready="${readyFlag}", seq=${sequenceStep}, reply="${replyStatus}"`);

    // Eligibility checks
    if (!email) continue;
    if (status === STATUS_COMPLETE || status === STATUS_ERROR) continue;
    if (replyStatus === STATUS_REPLIED) {
      sheet.getRange(i+1, statusIndex+1).setValue(STATUS_REPLIED);
      continue;
    }
    if (readyFlag !== "Y") continue;
    if (sequenceStep >= MAX_SEQUENCE_STEPS) {
      sheet.getRange(i+1, statusIndex+1).setValue(STATUS_COMPLETE);
      continue;
    }

    processedCount++;

    const sendResult = sendSequenceEmail({
      email: email,
      rowIndex: i+1,
      sheet: sheet,
      statusIndex: statusIndex,
      lastContactIndex: lastContactIndex,
      nextContactIndex: nextContactIndex,
      seqIndex: seqIndex,
      errorIndex: errorIndex,
      firstName: firstName,
      sequenceStep: sequenceStep
    });

    if (sendResult.success) {
      sentCount++;
    }

    Utilities.sleep(SEND_DELAY_MS);
  }

  logSuccess(`🎯 Done! ${sentCount}/${processedCount} emails sent successfully.`);
}

/**
 * Send one sequence email
 */
function sendSequenceEmail(params) {
  const { email, rowIndex, sheet, statusIndex, lastContactIndex, nextContactIndex, seqIndex, errorIndex, firstName, sequenceStep } = params;

  try {
    // Pick current step template
    const template = EMAIL_TEMPLATES[sequenceStep] || EMAIL_TEMPLATES[EMAIL_TEMPLATES.length-1];
    const subject = template.subject.replace("{{firstName}}", firstName);
    const body    = template.body.replace("{{firstName}}", firstName);

    GmailApp.sendEmail(email, subject, body);

    // Mark SENT only first time
    if (sequenceStep === 0) {
      sheet.getRange(rowIndex, statusIndex+1).setValue(STATUS_SENT);
    }

    // Update last_contact_date
    if (lastContactIndex !== -1) {
      const cell = sheet.getRange(rowIndex, lastContactIndex+1);
      cell.setValue(new Date());
      cell.setNumberFormat("yyyy-mm-dd");
    }

    // Set next_contact_date
    if (nextContactIndex !== -1) {
      let nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + DRIP_INTERVAL_DAYS);
      const cell = sheet.getRange(rowIndex, nextContactIndex+1);
      cell.setValue(nextDate);
      cell.setNumberFormat("yyyy-mm-dd");
    }

    // Increment step
    let newStep = sequenceStep + 1;
    sheet.getRange(rowIndex, seqIndex+1).setValue(newStep);

    // Mark COMPLETE if finished
    if (newStep >= MAX_SEQUENCE_STEPS) {
      sheet.getRange(rowIndex, statusIndex+1).setValue(STATUS_COMPLETE);
    }

    logSuccess(`✅ Email step ${newStep} sent to ${email}, row ${rowIndex}`);
    applyLabelToSentEmail(OUTREACH_LABEL, email);

    return { success: true };

  } catch (err) {
    logError(`❌ Failed to send to ${email}: ${err}`);
    sheet.getRange(rowIndex, statusIndex+1).setValue(STATUS_ERROR);
    if (errorIndex !== -1) {
      sheet.getRange(rowIndex, errorIndex+1).setValue(err.toString());
    }
    return { success: false };
  }
}
