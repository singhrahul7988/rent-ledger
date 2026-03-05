export default function ForLandlords() {
  return (
    <section className="landlords" id="for-landlords">
      <div className="container landlords-grid">
        <div className="landlords-left">
          <p className="landlord-label">FOR LANDLORDS</p>
          <h2>Trust your tenants before signing the lease</h2>
          <ul className="check-list">
            <li>View any tenant's verified payment history instantly</li>
            <li>No sign-up required, tenants share a secure link</li>
            <li>Zero crypto knowledge needed</li>
            <li>Works in any country, any currency</li>
          </ul>
          <button className="btn btn-secondary landlord-cta-btn" type="button">
            Verify a Tenant Free -&gt;
          </button>
        </div>

        <article className="verification-card landlord-profile-card">
          <div className="profile-avatar">SC</div>
          <h3>Verified Tenant Profile</h3>
          <p className="profile-id">ID: 0x8a2...9f1</p>

          <div className="score-ring-box">
            <div className="mini-gauge">
              <svg viewBox="0 0 160 160" aria-hidden="true">
                <circle cx="80" cy="80" r="58" className="gauge-track small" pathLength="100" />
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  className="gauge-progress small landlord-gauge-progress"
                  pathLength="100"
                />
              </svg>
              <strong>612</strong>
              <span>RentScore</span>
            </div>
            <span className="tier-pill-landlord">CREDIT ESTABLISHED</span>
          </div>

          <div className="verify-metrics-grid">
            <div>
              <strong>14</strong>
              <span>ON-TIME PAYMENTS</span>
            </div>
            <div>
              <strong>1.2y</strong>
              <span>TENURE</span>
            </div>
          </div>
          <button className="btn btn-primary share-btn landlord-share-btn">
            Share Link
          </button>
        </article>
      </div>
    </section>
  );
}
