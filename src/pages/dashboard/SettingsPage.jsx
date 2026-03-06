import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const SETTINGS_STORAGE_PREFIX = "rentledger.settings";
const NOTIFICATION_OPTIONS = [
  { key: "paymentReminders", label: "Payment reminders (3 days before due date)" },
  { key: "rentScoreAlerts", label: "RentScore change alerts" },
  { key: "loanOfferUpdates", label: "Loan offer updates" }
];

const CONNECTED_SERVICES = [
  {
    service: "Creditcoin Testnet",
    status: "ACTIVE",
    tone: "service-active",
    lastSync: "Mar 6, 2026 08:20 UTC",
    action: "Refresh"
  },
  {
    service: "Payment Bridge (Sandbox)",
    status: "ACTIVE",
    tone: "service-active",
    lastSync: "Mar 6, 2026 08:19 UTC",
    action: "Configure"
  },
  {
    service: "Report Share Link Service",
    status: "ACTIVE",
    tone: "service-active",
    lastSync: "Mar 6, 2026 07:58 UTC",
    action: "Manage"
  }
];

function defaultPreferences(currentUser) {
  return {
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
    country: "singapore",
    currency: "usd",
    sessionTimeout: "30m",
    notifications: {
      paymentReminders: true,
      rentScoreAlerts: true,
      loanOfferUpdates: false
    }
  };
}

function buildSnapshot({
  fullName,
  email,
  country,
  currency,
  sessionTimeout,
  notifications
}) {
  return {
    fullName: String(fullName || "").trim(),
    email: String(email || "").trim(),
    country: String(country || "singapore"),
    currency: String(currency || "usd"),
    sessionTimeout: String(sessionTimeout || "30m"),
    notifications: {
      paymentReminders: Boolean(notifications?.paymentReminders),
      rentScoreAlerts: Boolean(notifications?.rentScoreAlerts),
      loanOfferUpdates: Boolean(notifications?.loanOfferUpdates)
    }
  };
}

export default function SettingsPage() {
  const { currentUser, accountId, updateSessionUser } = useOutletContext();
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [country, setCountry] = useState("singapore");
  const [currency, setCurrency] = useState("usd");
  const [sessionTimeout, setSessionTimeout] = useState("30m");
  const [notifications, setNotifications] = useState({
    paymentReminders: true,
    rentScoreAlerts: true,
    loanOfferUpdates: false
  });
  const [savedSnapshot, setSavedSnapshot] = useState(() => defaultPreferences(currentUser));
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fallback = defaultPreferences(currentUser);
    const storageKey = `${SETTINGS_STORAGE_PREFIX}.${accountId || "guest"}`;
    let loaded = fallback;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        loaded = {
          ...fallback,
          ...parsed,
          notifications: {
            ...fallback.notifications,
            ...(parsed?.notifications || {})
          }
        };
      }
    } catch (_error) {
      loaded = fallback;
    }

    setFullName(loaded.fullName);
    setEmail(loaded.email);
    setCountry(loaded.country);
    setCurrency(loaded.currency);
    setSessionTimeout(loaded.sessionTimeout);
    setNotifications(loaded.notifications);
    setSavedSnapshot(loaded);
    setSaveMessage("");
    setSaveError("");
  }, [currentUser, accountId]);

  const handleCopyAddress = async () => {
    if (!accountId) return;
    try {
      await navigator.clipboard.writeText(accountId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (_error) {
      setCopied(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = () => {
    const snapshot = buildSnapshot({
      fullName,
      email,
      country,
      currency,
      sessionTimeout,
      notifications
    });

    if (!snapshot.fullName) {
      setSaveError("Full Name cannot be empty.");
      setSaveMessage("");
      return;
    }

    if (!snapshot.email || !snapshot.email.includes("@")) {
      setSaveError("Enter a valid email address.");
      setSaveMessage("");
      return;
    }

    try {
      const storageKey = `${SETTINGS_STORAGE_PREFIX}.${accountId || "guest"}`;
      window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
      if (typeof updateSessionUser === "function") {
        updateSessionUser({
          fullName: snapshot.fullName,
          email: snapshot.email
        });
      }
      setSavedSnapshot(snapshot);
      setSaveError("");
      setSaveMessage("Preferences saved.");
    } catch (_error) {
      setSaveMessage("");
      setSaveError("Unable to save preferences.");
    }
  };

  const handleCancel = () => {
    setFullName(savedSnapshot.fullName);
    setEmail(savedSnapshot.email);
    setCountry(savedSnapshot.country);
    setCurrency(savedSnapshot.currency);
    setSessionTimeout(savedSnapshot.sessionTimeout);
    setNotifications(savedSnapshot.notifications);
    setSaveMessage("");
    setSaveError("");
  };

  return (
    <>
      <section className="dashboard-columns">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Profile Preferences</h3>
          </div>
          <div className="form-grid settings-form">
            <label>
              Full Name
              <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              Country
              <select value={country} onChange={(event) => setCountry(event.target.value)}>
                <option value="singapore">Singapore</option>
                <option value="canada">Canada</option>
                <option value="uae">United Arab Emirates</option>
                <option value="usa">United States</option>
              </select>
            </label>
            <label>
              Default Currency
              <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
                <option value="usd">USD</option>
                <option value="sgd">SGD</option>
                <option value="cad">CAD</option>
                <option value="aed">AED</option>
              </select>
            </label>
            <label className="full">
              Notification Preferences
              <div className="toggle-list">
                {NOTIFICATION_OPTIONS.map((item) => (
                  <button
                    key={item.key}
                    className={`toggle-item${notifications[item.key] ? " on" : ""}`}
                    type="button"
                    aria-pressed={notifications[item.key]}
                    onClick={() => toggleNotification(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </label>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button" onClick={handleSavePreferences}>
              Save Preferences
            </button>
            <button className="btn btn-secondary" type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
          {saveMessage ? <p className="action-success">{saveMessage}</p> : null}
          {saveError ? <p className="action-error">{saveError}</p> : null}
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Security</h3>
          </div>
          <div className="settings-stack">
            <div className="settings-item">
              <div>
                <p>My Account Address</p>
                <span className="mono">{accountId || "--"}</span>
              </div>
              <button className="btn btn-ghost small" type="button" onClick={handleCopyAddress}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="settings-item">
              <div>
                <p>Two-step verification</p>
                <small>Protect account actions with one-time verification.</small>
              </div>
              <span className="status-tag eligible">RECOMMENDED</span>
            </div>
            <div className="settings-item">
              <div>
                <p>Session timeout</p>
                <small>Automatically sign out after 30 minutes of inactivity.</small>
              </div>
              <select value={sessionTimeout} onChange={(event) => setSessionTimeout(event.target.value)} className="compact-select">
                <option value="15m">15 min</option>
                <option value="30m">30 min</option>
                <option value="60m">60 min</option>
              </select>
            </div>
          </div>
        </article>
      </section>

      <section className="table-card">
        <div className="panel-header">
          <h3>Connected Services</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
              <th>Last Sync</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {CONNECTED_SERVICES.map((item) => (
              <tr key={item.service}>
                <td>{item.service}</td>
                <td>
                  <span className={`status-tag ${item.tone}`}>{item.status}</span>
                </td>
                <td>{item.lastSync}</td>
                <td>
                  <button className="btn btn-ghost small" type="button">
                    {item.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
