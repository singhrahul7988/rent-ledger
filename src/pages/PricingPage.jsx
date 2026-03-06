import { Link } from "react-router-dom";
import Brand from "../components/Brand";

const PLANS = [
  {
    name: "Basic",
    price: "$5",
    cadence: "USD / month",
    summary: "For individual renters building credit visibility.",
    features: [
      "1 active lease",
      "Monthly RentScore updates",
      "Payment Certificate for each verified payment",
      "Share link for landlord checks"
    ]
  },
  {
    name: "Plus",
    price: "$12",
    cadence: "USD / month",
    summary: "For users who want faster insights and eligibility tracking.",
    features: [
      "Up to 3 active leases",
      "RentScore refresh after each payment",
      "Loan eligibility progress guidance",
      "Priority support response"
    ],
    featured: true
  },
  {
    name: "Pro",
    price: "$20",
    cadence: "USD / month",
    summary: "For landlords and high-volume account management.",
    features: [
      "Up to 10 active leases",
      "Portfolio-level payment analytics",
      "CSV exports and advanced filters",
      "Dedicated onboarding support"
    ]
  }
];

export default function PricingPage() {
  return (
    <div className="pricing-page">
      <header className="pricing-topbar">
        <div className="container pricing-topbar-inner">
          <Brand />
          <div className="pricing-topbar-actions">
            <Link to="/" className="btn btn-ghost btn-link">
              Back to Home
            </Link>
            <Link to="/signin" className="btn btn-secondary btn-link">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary btn-link">
              Start Building Credit
            </Link>
          </div>
        </div>
      </header>

      <main className="container pricing-main">
        <section className="pricing-hero">
          <p className="section-label">PRICING</p>
          <h1>Simple plans for renters and landlords</h1>
          <p>
            Transparent monthly pricing with no hidden charges. Start small, then upgrade as your
            rent profile grows.
          </p>
        </section>

        <section className="pricing-grid" aria-label="Pricing plans">
          {PLANS.map((plan) => (
            <article className={`pricing-plan${plan.featured ? " featured" : ""}`} key={plan.name}>
              {plan.featured ? <span className="pricing-badge">Most Popular</span> : null}
              <h2>{plan.name}</h2>
              <p className="pricing-price">
                {plan.price}
                <span>{plan.cadence}</span>
              </p>
              <p className="pricing-summary">{plan.summary}</p>

              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <Link to={`/signup?plan=${plan.name.toLowerCase()}`} className="btn btn-primary btn-link full-width">
                Choose {plan.name}
              </Link>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
