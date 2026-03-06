import Brand from "./Brand";
import CreditcoinIcon from "./CreditcoinIcon";
import { Link } from "react-router-dom";

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
          <Link to="/pricing">Pricing</Link>
        </nav>

        <div className="creditcoin-badge">
          <CreditcoinIcon title="" />
          Built on Creditcoin
        </div>
      </div>
    </footer>
  );
}
