function LockIcon({ open = false }) {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d={open ? "M7 11V8a5 5 0 0 1 10 0M5 11h14v9H5z" : "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TIERS = [
  {
    name: "Tier 1 Starter",
    details: "$10,000 - 18% APR",
    unlock: "Unlocks at score 300",
    tone: "tier-1",
    open: true,
    note: "Informal lender: 36-120% APR"
  },
  {
    name: "Tier 2 Builder",
    details: "$30,000 - 15% APR",
    unlock: "Unlocks at score 450",
    tone: "tier-2"
  },
  {
    name: "Tier 3 Established",
    details: "$75,000 - 12% APR",
    unlock: "Unlocks at score 600",
    tone: "tier-3"
  },
  {
    name: "Tier 4 Trusted",
    details: "$150,000 - 10% APR",
    unlock: "Unlocks at score 700+",
    tone: "tier-4"
  }
];

export default function LoanTiers() {
  return (
    <section className="loan-tiers" id="pricing">
      <div className="container">
        <h2>What you can unlock</h2>
        <div className="tier-grid">
          {TIERS.map((tier) => (
            <article className={`tier-card ${tier.tone}`} key={tier.name}>
              <span className="tier-lock" aria-hidden="true">
                <LockIcon open={tier.open} />
              </span>
              <h3>{tier.name}</h3>
              <p>{tier.details}</p>
              <small>{tier.unlock}</small>
              {tier.note ? <em>{tier.note}</em> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
