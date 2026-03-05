import Brand from "./Brand";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>Your rent builds your future</p>
        </div>

        <nav className="footer-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#rentscore">RentScore</a>
          <a href="#for-landlords">For Landlords</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="creditcoin-badge">
          <span className="ctc-icon">CTC</span>
          Built on Creditcoin
        </div>
      </div>
    </footer>
  );
}
