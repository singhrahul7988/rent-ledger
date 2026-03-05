import { transactions } from "../../data/dashboardData";

function statusTone(status) {
  if (status === "SUCCESS") return "active";
  if (status === "PENDING") return "eligible";
  return "locked";
}

export default function TransactionsPage() {
  return (
    <>
      <section className="table-card">
        <div className="panel-header">
          <h3>Transactions Ledger</h3>
          <div className="table-actions">
            <select defaultValue="all">
              <option value="all">All Event Types</option>
              <option value="payments">Payments</option>
              <option value="score">Score Updates</option>
              <option value="loans">Loans</option>
            </select>
            <select defaultValue="last30">
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="last90">Last 90 days</option>
            </select>
            <button className="btn btn-secondary small" type="button">
              Export CSV
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Network Reference</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={`${tx.type}-${tx.ref}`}>
                <td>{tx.type}</td>
                <td>{tx.date}</td>
                <td>{tx.time}</td>
                <td>
                  <span className={`status-tag ${statusTone(tx.status)}`}>{tx.status}</span>
                </td>
                <td className="mono">{tx.ref}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost small" type="button">
                      Copy
                    </button>
                    <a
                      className="btn btn-ghost small btn-link"
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Explorer
                    </a>
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
            <h3>Ledger Summary</h3>
          </div>
          <div className="reliability-grid">
            <div className="reliability-card">
              <p>Total Events (30d)</p>
              <strong>47</strong>
            </div>
            <div className="reliability-card">
              <p>Successful Confirmations</p>
              <strong>44</strong>
            </div>
            <div className="reliability-card">
              <p>Pending Confirmations</p>
              <strong>3</strong>
            </div>
            <div className="reliability-card">
              <p>Average Confirmation Time</p>
              <strong>22 sec</strong>
            </div>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Integrity Notes</h3>
          </div>
          <ul className="milestone-list">
            <li>All payment events are linked to a certificate token and ledger reference.</li>
            <li>Score updates follow each confirmed payment event.</li>
            <li>Loan status events stay visible until completion or default.</li>
          </ul>
        </article>
      </section>
    </>
  );
}
