const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_BASE = rawBaseUrl.endsWith("/api/v1")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api/v1`;
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 12000);

async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    if (error && typeof error === "object" && error.name === "AbortError") {
      throw new Error(`Request timeout after ${API_TIMEOUT_MS}ms. Check backend availability.`);
    }
    throw new Error(`Failed to reach backend at ${API_BASE}. Make sure backend server is running.`);
  } finally {
    clearTimeout(timeoutId);
  }

  const responseText = await response.text();
  const payload = responseText
    ? (() => {
        try {
          return JSON.parse(responseText);
        } catch (_error) {
          return {};
        }
      })()
    : {};

  if (!response.ok) {
    let message = payload?.error || payload?.message || "";
    if (!message && response.status === 404) {
      message = `API route not found (404): ${path}. Check backend URL/routes.`;
    }
    if (!message) {
      message = `Request failed (${response.status})`;
    }
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
