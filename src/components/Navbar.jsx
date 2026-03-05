import Brand from "./Brand";
import { Link } from "react-router-dom";

export default function Navbar({ scrolled }) {
  return (
    <header className={`navbar${scrolled ? " scrolled" : ""}`}>
      <div className="container nav-inner">
        <Brand />

        <nav className="nav-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#rentscore">RentScore</a>
          <a href="#for-landlords">For Landlords</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="nav-actions">
          <Link to="/dashboard" className="btn btn-ghost btn-link">
            Sign In
          </Link>
          <Link to="/dashboard" className="btn btn-primary btn-link">
            Start Building Credit
          </Link>
        </div>
      </div>
    </header>
  );
}
