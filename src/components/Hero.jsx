import { Link } from "react-router-dom";
import CreditcoinIcon from "./CreditcoinIcon";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-pattern"></div>
      <div className="hero-glow"></div>
      <div className="container hero-grid">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <CreditcoinIcon title="" />
            Built on Creditcoin Blockchain
          </div>

          <h1>
            Your rent pays your landlord.
            <br />
            Now let it pay for your future.
          </h1>
          <p>
            Every on-time rent payment builds a verified credit score on the
            blockchain.
            <span className="hero-split-line">No bank required.</span>
            <span className="hero-split-line">No credit history needed.</span>
            <span className="hero-split-line">Just pay rent and watch doors open.</span>
          </p>

          <div className="hero-cta">
            <Link to="/signin" className="btn btn-primary btn-link">
              Start Building Credit
            </Link>
            <a href="#how-it-works" className="btn btn-outline btn-link">
              See How It Works -&gt;
            </a>
          </div>

          <div className="social-proof">
            <div className="avatars" aria-hidden="true">
              <span>A</span>
              <span>M</span>
              <span>S</span>
            </div>
            <span>2,847 renters already building credit</span>
          </div>
        </div>

        <div className="hero-right">
          <div className="link-line link-line-a"></div>
          <div className="link-line link-line-b"></div>

          <article className="preview-card main-card">
            <h3>My RentScore</h3>
            <div className="gauge-wrap">
              <svg viewBox="0 0 220 220" className="gauge-svg" aria-hidden="true">
                <circle
                  cx="110"
                  cy="110"
                  r="85"
                  className="gauge-track"
                  pathLength="100"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="85"
                  className="gauge-progress"
                  pathLength="100"
                  style={{ "--score-progress": 42.97 }}
                />
                <circle cx="190" cy="138" r="6" className="gauge-needle" />
              </svg>
              <div className="gauge-center">
                <strong>487</strong>
                <span>RentScore</span>
              </div>
            </div>
            <div className="tier-pill">Credit Builder</div>
          </article>

          <article className="preview-card mini-card payment-card">
            <p>Last Payment</p>
            <span className="status-pill on-time">ON TIME</span>
            <strong>$1,450 - Nov 2025</strong>
          </article>

          <article className="preview-card mini-card loan-card">
            <p>Loan Eligible</p>
            <strong>$5,000 unlocked</strong>
          </article>
        </div>
      </div>
    </section>
  );
}
