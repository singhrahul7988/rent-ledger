const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_BASE = rawBaseUrl.endsWith("/api/v1")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api/v1`;

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
}

export function getLeases(accountId) {
  return apiRequest(`/leases/${accountId}`);
}

export function getPayments(accountId) {
  return apiRequest(`/payments/${accountId}`);
}

export function getRentScore(accountId) {
  return apiRequest(`/rentscore/${accountId}`);
}

export function getTransactions(accountId) {
  return apiRequest(`/transactions/${accountId}`);
}

export function getLoans(accountId) {
  return apiRequest(`/loans/${accountId}`);
}

export function createLease(payload) {
  return apiRequest("/leases", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function initiatePayment(payload) {
  return apiRequest("/payments/initiate", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function confirmPaymentWebhook(payload) {
  return apiRequest("/payments/webhook/mock", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getLoanEligibility(payload) {
  return apiRequest("/loans/eligibility", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function requestLoan(payload) {
  return apiRequest("/loans/request", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export { API_BASE };
