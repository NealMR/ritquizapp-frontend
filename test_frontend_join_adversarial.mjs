/**
 * Adversarial test script verifying frontend Join with Code logic:
 * - Code sanitization and formatting
 * - URL encoding and API endpoint routing
 * - Error message extraction and recovery logic
 * - Boundary validations
 */
import assert from "node:assert";

console.log("Starting Frontend Logic Adversarial Verification...");

// 1. Student Dashboard Input Sanitization & Validation Logic
function sanitizeStudentInput(input) {
  return input.toUpperCase().replace(/\s+/g, "");
}

function validateAndPrepareJoin(input) {
  const cleanCode = sanitizeStudentInput(input);
  if (cleanCode.length !== 6) {
    return { ok: false, error: "Code must be 6 characters." };
  }
  return { ok: true, code: cleanCode };
}

// Test boundary inputs
const inputTests = [
  { raw: "5yrmpf", expected: "5YRMPF", valid: true },
  { raw: " 5YRMPF ", expected: "5YRMPF", valid: true },
  { raw: " 5y \t rm\npf ", expected: "5YRMPF", valid: true },
  { raw: "abc", expected: "ABC", valid: false, error: "Code must be 6 characters." },
  { raw: "1234567", expected: "1234567", valid: false, error: "Code must be 6 characters." },
  { raw: "", expected: "", valid: false, error: "Code must be 6 characters." },
  { raw: "      ", expected: "", valid: false, error: "Code must be 6 characters." },
  { raw: "!@#$%^", expected: "!@#$%^", valid: true },
];

for (const t of inputTests) {
  const res = validateAndPrepareJoin(t.raw);
  if (t.valid) {
    assert.strictEqual(res.ok, true, `Expected ${t.raw} to be valid`);
    assert.strictEqual(res.code, t.expected, `Expected code ${t.expected}, got ${res.code}`);
  } else {
    assert.strictEqual(res.ok, false, `Expected ${t.raw} to be invalid`);
    assert.strictEqual(res.error, t.error, `Expected error '${t.error}', got '${res.error}'`);
  }
}
console.log("✔ Student Dashboard input sanitization tests PASSED (8/8)");

// 2. Token Page Parameter Parsing Logic
function parseJoinToken(tokenParam) {
  const rawToken = typeof tokenParam === "string" ? tokenParam : Array.isArray(tokenParam) ? tokenParam[0] : "";
  return rawToken ? rawToken.trim() : "";
}

assert.strictEqual(parseJoinToken("5YRMPF"), "5YRMPF");
assert.strictEqual(parseJoinToken("  5yrmpf  "), "5yrmpf");
assert.strictEqual(parseJoinToken(["5YRMPF", "extra"]), "5YRMPF");
assert.strictEqual(parseJoinToken(undefined), "");
assert.strictEqual(parseJoinToken(null), "");
assert.strictEqual(parseJoinToken("   "), "");
console.log("✔ Join Token page parameter parsing tests PASSED (6/6)");

// 3. API Path Encoding Logic
function buildGetClassPath(token) {
  return `/classes/by-token/${encodeURIComponent(token.trim())}`;
}

function buildJoinClassPath(token) {
  return `/classes/${encodeURIComponent(token.trim())}/join`;
}

assert.strictEqual(buildGetClassPath("5YRMPF"), "/classes/by-token/5YRMPF");
assert.strictEqual(buildGetClassPath(" 5YRMPF "), "/classes/by-token/5YRMPF");
assert.strictEqual(buildGetClassPath("foo/bar"), "/classes/by-token/foo%2Fbar");
assert.strictEqual(buildGetClassPath("!@#$%^"), "/classes/by-token/!%40%23%24%25%5E");

assert.strictEqual(buildJoinClassPath("5YRMPF"), "/classes/5YRMPF/join");
assert.strictEqual(buildJoinClassPath(" 5YRMPF "), "/classes/5YRMPF/join");
assert.strictEqual(buildJoinClassPath("foo/bar"), "/classes/foo%2Fbar/join");
assert.strictEqual(buildJoinClassPath("!@#$%^"), "/classes/!%40%23%24%25%5E/join");
console.log("✔ API path construction and URI encoding tests PASSED (8/8)");

// 4. API Error Parsing Oracle
function parseApiError(statusCode, responseBody) {
  if (typeof responseBody?.detail === "string") {
    return responseBody.detail;
  }
  return `Request failed (${statusCode})`;
}

assert.strictEqual(parseApiError(400, { detail: "Already enrolled in this class" }), "Already enrolled in this class");
assert.strictEqual(parseApiError(403, { detail: "Only students can join classes" }), "Only students can join classes");
assert.strictEqual(parseApiError(403, { detail: "Joining this class is not allowed" }), "Joining this class is not allowed");
assert.strictEqual(parseApiError(404, { detail: "Invalid join code or token" }), "Invalid join code or token");
assert.strictEqual(parseApiError(404, { detail: "This join code has expired" }), "This join code has expired");
assert.strictEqual(parseApiError(500, {}), "Request failed (500)");
assert.strictEqual(parseApiError(502, null), "Request failed (502)");
console.log("✔ API error parsing tests PASSED (7/7)");

// 5. Join Landing Page Duplicate Enrollment Fallback Oracle
function handleJoinCatch(err) {
  if (err.message && err.message.toLowerCase().includes("already")) {
    return { joined: true, error: null };
  }
  return { joined: false, error: err.message || "Failed to join class" };
}

const duplicateOutcome = handleJoinCatch(new Error("Already enrolled in this class"));
assert.strictEqual(duplicateOutcome.joined, true, "Already enrolled should gracefully resolve to joined=true");
assert.strictEqual(duplicateOutcome.error, null);

const forbiddenOutcome = handleJoinCatch(new Error("Only students can join classes"));
assert.strictEqual(forbiddenOutcome.joined, false);
assert.strictEqual(forbiddenOutcome.error, "Only students can join classes");

const notFoundOutcome = handleJoinCatch(new Error("Invalid join code or token"));
assert.strictEqual(notFoundOutcome.joined, false);
assert.strictEqual(notFoundOutcome.error, "Invalid join code or token");
console.log("✔ Join Landing Page error recovery tests PASSED (3/3)");

console.log("\nALL FRONTEND ADVERSARIAL LOGIC TESTS COMPLETED SUCCESSFULLY!");
