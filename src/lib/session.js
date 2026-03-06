const SESSION_KEY = "rentledger_user";
const DEFAULT_ACCOUNT_ID = import.meta.env.VITE_DEMO_ACCOUNT_ID || "acc_01HQP7S1A9";

function normalizeWhitespace(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function formatNameFromEmail(email) {
  const localPart = normalizeWhitespace(email).split("@")[0] || "";
  const spaced = localPart.replace(/[._-]+/g, " ");
  return spaced
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}

export function getUserInitials(user) {
  const source = normalizeWhitespace(user?.fullName || user?.email || "");
  if (!source) return "DU";
  const parts = source.split(" ").filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function createSessionUser({ fullName, email, accountId } = {}) {
  const safeEmail = normalizeWhitespace(email) || "demo.user@rentledger.local";
  const safeName = normalizeWhitespace(fullName) || formatNameFromEmail(safeEmail) || "Demo User";
  return {
    fullName: safeName,
    email: safeEmail,
    accountId: normalizeWhitespace(accountId) || DEFAULT_ACCOUNT_ID
  };
}

export function loadSessionUser() {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return createSessionUser(parsed);
  } catch (_error) {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSessionUser(user) {
  const normalized = createSessionUser(user);
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearSessionUser() {
  window.localStorage.removeItem(SESSION_KEY);
}

export { DEFAULT_ACCOUNT_ID };
