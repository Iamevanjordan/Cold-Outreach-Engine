/**
 * UTILITY FUNCTIONS
 * Small repeatable helpers
 */

// Case-insensitive header lookup
function findHeaderIndex(headers, possibleNames) {
  for (const name of possibleNames) {
    const index = headers.indexOf(name.toLowerCase());
    if (index !== -1) return index;
  }
  return -1;
}

// Log wrapper for nicer execution logs
function logInfo(message) {
  console.log("ℹ️ " + message);
}

function logSuccess(message) {
  console.log("✅ " + message);
}

function logError(message) {
  console.error("❌ " + message);
}
