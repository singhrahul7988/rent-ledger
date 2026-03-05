import CountUp from "./CountUp";

const SCORE_STEPS = [
  { value: 150, month: "Month 1", fill: "20%" },
  { value: 300, month: "Month 3", fill: "38%" },
  { value: 487, month: "Month 6", fill: "62%" },
  { value: 612, month: "Month 12", fill: "78%" }
];

const FACTORS = [
  { title: "Payment Count", note: "(+30 per payment)", width: "82%" },
  {
    title: "Consistency Bonus",
    note: "(+50 for 6 months streak)",
    width: "68%"
  },
  {
    title: "Rental Amount Tier",
    note: "(+50 for $1,000+/month)",
    width: "74%"
  },
  { title: "Tenure Bonus", note: "(+50 for 12+ months)", width: "55%" },
  {
    title: "Late Payment Penalty",
    note: "(-15 per late)",
    width: "18%",
    penalty: true
  }
];

export default function RentScoreExplainer() {
  return (
    <section className="score-explainer" id="rentscore">
      <div className="container score-grid">
        <div className="score-left">
          <div className="calc-card">
            <div className="calc-values">
              {SCORE_STEPS.map((step) => (
                <CountUp target={step.value} key={`value-${step.value}`} />
              ))}
            </div>
            <div className="calc-bars">
              {SCORE_STEPS.map((step) => (
                <div className="calc-bar-col" key={step.value}>
                  <div className="calc-bar-shell">
                    <i className="calc-bar-fill" style={{ height: step.fill }}></i>
                  </div>
                  <span>{step.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="score-right">
          <h3>How your RentScore is calculated</h3>
          <ul className="factor-list">
            {FACTORS.map((factor) => (
              <li key={factor.title}>
                <div className="factor-headline">
                  <p>{factor.title}</p>
                  <span>{factor.note}</span>
                </div>
                <div className={`bar${factor.penalty ? " penalty red-penalty" : ""}`}>
                  <i style={{ width: factor.width }}></i>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
