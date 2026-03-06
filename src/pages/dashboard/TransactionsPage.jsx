import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

function statusTone(status) {
  if (status === "SUCCESS") return "active";
  if (status === "PENDING") return "eligible";
  return "locked";
}

function eventLabel(eventType) {
  return eventType
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default function TransactionsPage() {
  const { transactions } = useOutletContext();
  const [eventFilter, setEventFilter] = useState("all");

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((tx) => {
        if (eventFilter === "all") return true;
        if (eventFilter === "payments") return tx.eventType.includes("PAYMENT");
        if (eventFilter === "score") return tx.eventType.includes("SCORE");
        if (eventFilter === "loans") return tx.eventType.includes("LOAN");
        return true;
      }),
    [transactions, eventFilter]
  );

  const successful = transactions.filter((tx) => tx.status === "SUCCESS").length;
  const pending = transactions.filter((tx) => tx.status === "PENDING").length;

  const copyHash = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash);
    } catch (_error) {
      // noop
    }
  };

  return (
    <>
      <section className="table-card">
        <div className="panel-header">
          <h3>Transactions Ledger</h3>
          <div className="table-actions">
            <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}>
              <option value="all">All Event Types</option>
              <option value="payments">Payments</option>
              <option value="score">Score Updates</option>
              <option value="loans">Loans</option>
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
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const txDate = new Date(tx.timestamp);
                return (
                  <tr key={tx.eventId}>
                    <td>{eventLabel(tx.eventType)}</td>
                    <td>{txDate.toLocaleDateString("en-US")}</td>
                    <td>{txDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td>
                      <span className={`status-tag ${statusTone(tx.status)}`}>{tx.status}</span>
                    </td>
                    <td className="mono">{tx.txHash}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost small" type="button" onClick={() => copyHash(tx.txHash)}>
                          Copy
                        </button>
                        {tx.explorerUrl ? (
                          <a
                            className="btn btn-ghost small btn-link"
                            href={tx.explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Explorer
                          </a>
                        ) : (
                          <button className="btn btn-ghost small" type="button" disabled>
                            Explorer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>No transaction events yet. Complete a payment to generate on-chain references.</td>
              </tr>
            )}
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
              <p>Total Events</p>
              <strong>{transactions.length}</strong>
            </div>
            <div className="reliability-card">
              <p>Successful Confirmations</p>
              <strong>{successful}</strong>
            </div>
            <div className="reliability-card">
              <p>Pending Confirmations</p>
              <strong>{pending}</strong>
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
