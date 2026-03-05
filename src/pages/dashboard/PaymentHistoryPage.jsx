import { paymentCertificates } from "../../data/dashboardData";

export default function PaymentHistoryPage() {
  return (
    <>
      <section className="table-card payment-history-table-card">
        <div className="panel-header">
          <h3>Payment History</h3>
          <div className="table-actions">
            <select defaultValue="all">
              <option value="all">All Status</option>
              <option value="on-time">On Time</option>
              <option value="late">Late</option>
            </select>
            <select defaultValue="2026">
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
            <button className="btn btn-secondary small" type="button">
              Export CSV
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Certificate</th>
              <th>Payment Method</th>
              <th>Date</th>
              <th>Network Reference</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentCertificates.map((record) => (
              <tr key={record.certificateId}>
                <td>{record.month}</td>
                <td>{record.amount}</td>
                <td>
                  <span className={`status-tag ${record.status === "ON TIME" ? "on-time" : "late"}`}>
                    {record.status}
                  </span>
                </td>
                <td>{record.certificateId}</td>
                <td>{record.method}</td>
                <td>{record.paidOn}</td>
                <td className="mono">{record.hash}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost small" type="button">
                      Copy
                    </button>
                    <button className="btn btn-ghost small" type="button">
                      Explorer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="dashboard-columns">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Payment Reliability</h3>
          </div>
          <div className="progress-list">
            <div className="progress-row">
              <div>
                <p>On-Time Ratio</p>
                <small>5 of last 6 payments on time</small>
              </div>
              <span className="status-tag active">93%</span>
            </div>
            <div className="progress-row">
              <div>
                <p>Average Monthly Rent</p>
                <small>Based on last 12 months</small>
              </div>
              <span className="status-tag eligible">$1,833</span>
            </div>
            <div className="progress-row">
              <div>
                <p>Longest Streak</p>
                <small>Current streak started Jan 2026</small>
              </div>
              <span className="status-tag on-time">5 months</span>
            </div>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Certificate Access</h3>
          </div>
          <p className="panel-copy">
            Share a read-only payment history with landlords or lending partners.
            Account address is masked by default.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button">
              Generate Share Link
            </button>
          </div>
          <p className="mono link-preview">https://rentledger.app/verify/sarah-chen-8h2x</p>
        </article>
      </section>
    </>
  );
}
