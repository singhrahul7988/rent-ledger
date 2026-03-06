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
          <Link to="/pricing">Pricing</Link>
        </nav>

        <div className="nav-actions">
          <Link to="/signin" className="btn btn-ghost btn-link">
            Sign In
          </Link>
          <Link to="/signin" className="btn btn-primary btn-link">
            Open Demo Account
          </Link>
        </div>
      </div>
    </header>
  );
}
