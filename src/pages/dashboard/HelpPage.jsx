const faqs = [
  {
    question: "How is RentScore calculated?",
    answer:
      "RentScore uses verified payment count, consistency streaks, rental amount tier, tenure bonus, and late payment penalties."
  },
  {
    question: "Do I need a bank account to use RentLedger?",
    answer:
      "No. Payments can be confirmed through supported digital methods and recorded through the automated payment system."
  },
  {
    question: "Can landlords view my personal account details?",
    answer:
      "No. Shared verification links hide personal account identifiers by default and only show report-level metrics."
  }
];

const supportChannels = [
  { channel: "Live Chat", availability: "24/7", target: "Reply in under 5 minutes" },
  { channel: "Email Support", availability: "Mon-Sat", target: "Reply in under 12 hours" },
  { channel: "Priority Loan Desk", availability: "Business hours", target: "Reply in under 2 hours" }
];

export default function HelpPage() {
  return (
    <>
      <section className="dashboard-columns">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Need Help?</h3>
          </div>
          <p className="panel-copy">
            Find answers, contact support, or submit a request. We keep guidance in
            plain language and provide transaction-level references when needed.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button">
              Open Live Chat
            </button>
            <button className="btn btn-secondary" type="button">
              Submit Support Ticket
            </button>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>System Status</h3>
          </div>
          <div className="settings-stack">
            <div className="settings-item">
              <p>Creditcoin testnet</p>
              <span className="status-tag active">OPERATIONAL</span>
            </div>
            <div className="settings-item">
              <p>Payment bridge sandbox</p>
              <span className="status-tag active">OPERATIONAL</span>
            </div>
            <div className="settings-item">
              <p>Report sharing services</p>
              <span className="status-tag active">OPERATIONAL</span>
            </div>
          </div>
        </article>
      </section>

      <section className="table-card">
        <div className="panel-header">
          <h3>Common Questions</h3>
        </div>
        <div className="faq-list">
          {faqs.map((item) => (
            <article className="faq-item" key={item.question}>
              <h4>{item.question}</h4>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="table-card">
        <div className="panel-header">
          <h3>Support Channels</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Channel</th>
              <th>Availability</th>
              <th>Target Response</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {supportChannels.map((item) => (
              <tr key={item.channel}>
                <td>{item.channel}</td>
                <td>{item.availability}</td>
                <td>{item.target}</td>
                <td>
                  <button className="btn btn-ghost small" type="button">
                    Contact
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
