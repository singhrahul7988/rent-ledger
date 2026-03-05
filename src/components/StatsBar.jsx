const STATS = [
  ["44M+", "RENTERS WITHOUT CREDIT"],
  ["0", "BANKS NEEDED"],
  ["$120B", "GLOBAL RENT MARKET"],
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
