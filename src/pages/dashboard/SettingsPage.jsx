export default function SettingsPage() {
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
              <input type="text" defaultValue="Sarah Chen" />
            </label>
            <label>
              Email
              <input type="email" defaultValue="sarah.chen@example.com" />
            </label>
            <label>
              Country
              <select defaultValue="singapore">
                <option value="singapore">Singapore</option>
                <option value="canada">Canada</option>
                <option value="uae">United Arab Emirates</option>
                <option value="usa">United States</option>
              </select>
            </label>
            <label>
              Default Currency
              <select defaultValue="usd">
                <option value="usd">USD</option>
                <option value="sgd">SGD</option>
                <option value="cad">CAD</option>
                <option value="aed">AED</option>
              </select>
            </label>
            <label className="full">
              Notification Preferences
              <div className="toggle-list">
                <button className="toggle-item on" type="button">
                  Payment reminders (3 days before due date)
                </button>
                <button className="toggle-item on" type="button">
                  RentScore change alerts
                </button>
                <button className="toggle-item" type="button">
                  Loan offer updates
                </button>
              </div>
            </label>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button">
              Save Preferences
            </button>
            <button className="btn btn-secondary" type="button">
              Cancel
            </button>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Security</h3>
          </div>
          <div className="settings-stack">
            <div className="settings-item">
              <div>
                <p>My Account Address</p>
                <span className="mono">0x8f21A9...B113</span>
              </div>
              <button className="btn btn-ghost small" type="button">
                Copy
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
              <select defaultValue="30m" className="compact-select">
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
            <tr>
              <td>Creditcoin Testnet</td>
              <td>
                <span className="status-tag active">ACTIVE</span>
              </td>
              <td>Mar 6, 2026 08:20 UTC</td>
              <td>
                <button className="btn btn-ghost small" type="button">
                  Refresh
                </button>
              </td>
            </tr>
            <tr>
              <td>Payment Bridge (Sandbox)</td>
              <td>
                <span className="status-tag active">ACTIVE</span>
              </td>
              <td>Mar 6, 2026 08:19 UTC</td>
              <td>
                <button className="btn btn-ghost small" type="button">
                  Configure
                </button>
              </td>
            </tr>
            <tr>
              <td>Report Share Link Service</td>
              <td>
                <span className="status-tag active">ACTIVE</span>
              </td>
              <td>Mar 6, 2026 07:58 UTC</td>
              <td>
                <button className="btn btn-ghost small" type="button">
                  Manage
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
