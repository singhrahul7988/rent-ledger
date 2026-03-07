const STATS = [
  ["1.2B+", "RENTERS WITHOUT CREDIT"],
  ["0", "BANKS NEEDED"],
  ["$2.9T", "GLOBAL RENT MARKET"],
  ["18%", "APR VS 120% TRADITIONAL"]
];

export default function StatsBar() {
  return (
    <section className="stats-bar">
      <div className="container stats-grid">
        {STATS.map(([value, label]) => (
          <div className="stat-item" key={value}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
