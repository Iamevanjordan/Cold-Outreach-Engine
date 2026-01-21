/**
 * LABEL HANDLER
 * Handles Gmail labels for tracking
 */

function getOrCreateLabel(labelName) {
  let label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    label = GmailApp.createLabel(labelName);
  }
  return label;
}

// Example: apply label to a thread after sending
function applyLabelToSentEmail(labelName, email) {
  const label = getOrCreateLabel(labelName);
  const threads = GmailApp.search('to:' + email + ' newer_than:1d');
  if (threads.length > 0) {
    threads[0].addLabel(label);
  }
}
