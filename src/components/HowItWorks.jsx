function HouseIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M3 10.5 12 3l9 7.5M5.5 9v11h13V9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M12 3.5 5 6.5v5.8c0 4 2.8 6.6 7 8.2 4.2-1.6 7-4.2 7-8.2V6.5zM9 12.5l2 2 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M3 16.5h5l2-4 3.2 6 2.3-5H21M3 6h18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STEPS = [
  {
    step: "01",
    icon: <HouseIcon />,
    title: "Pay rent as usual",
    body: "Connect your lease agreement. Pay monthly rent through RentLedger's automated escrow just like a bank transfer."
  },
  {
    step: "02",
    icon: <ShieldIcon />,
    title: "Your payment is recorded on blockchain",
    body: "Each on-time payment generates a permanent Payment Certificate, a blockchain record that no one can alter or fake."
  },
  {
    step: "03",
    icon: <TrendIcon />,
    title: "Your RentScore grows, unlock loans",
    body: "After 3 payments, unlock your first credit line. After 12 months, access up to $15,000 at 10% APR with no collateral needed."
  }
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <p className="section-label">THE PROCESS</p>
        <h2>Three steps to financial freedom</h2>
        <p className="section-sub">
          No crypto knowledge required. Works with any payment method.
        </p>

        <div className="steps">
          {STEPS.map((item) => (
            <article className="step-card" key={item.step}>
              <span className="step-number">{item.step}</span>
              <div className="step-icon" aria-hidden="true">
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
