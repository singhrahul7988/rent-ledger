import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";

export default function SignInPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <div className="container auth-topbar-inner">
          <Brand />
          <div className="auth-topbar-cta">
            <span>New to RentLedger?</span>
            <Link to="/signup" className="btn btn-secondary btn-link">
              Create Account
            </Link>
          </div>
        </div>
      </header>

      <main className="container auth-main">
        <section className="auth-card">
          <p className="auth-eyebrow">WELCOME BACK</p>
          <h1>Sign in to your account</h1>
          <p className="auth-subtext">
            Track your RentScore, payment certificates, and loan eligibility in one place.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              My Account Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="sarah.chen@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
            </label>

            <div className="auth-form-row">
              <label className="auth-check">
                <input type="checkbox" name="remember" />
                Keep me signed in on this device
              </label>
              <Link to="/signup" className="auth-inline-link">
                Need an account?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary full-width">
              Sign In
            </button>
          </form>

          <p className="auth-footnote">Demo mode: enter any valid email and password to continue.</p>
        </section>

        <aside className="auth-side-card">
          <p className="auth-eyebrow">WHY RENTLEDGER</p>
          <h2>Your rent can unlock real credit access</h2>
          <ul className="auth-benefits">
            <li>Build a verified score from on-time rent payments</li>
            <li>Get payment certificates that landlords and lenders can trust</li>
            <li>Unlock fair-rate micro-loans without a traditional credit history</li>
            <li>Use it globally with simple USD-first reporting</li>
          </ul>
        </aside>
      </main>
    </div>
  );
}
