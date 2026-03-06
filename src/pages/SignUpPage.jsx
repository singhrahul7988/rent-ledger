import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import { DEMO_JUDGE_USER, saveSessionUser } from "../lib/session";

export default function SignUpPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    saveSessionUser(DEMO_JUDGE_USER);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <div className="container auth-topbar-inner">
          <Brand />
          <div className="auth-topbar-cta">
            <span>Already have an account?</span>
            <Link to="/signin" className="btn btn-secondary btn-link">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="container auth-main">
        <section className="auth-card">
          <p className="auth-eyebrow">CREATE ACCOUNT</p>
          <h1>Start building your RentScore</h1>
          <p className="auth-subtext">
            Set up your profile in under two minutes. No bank account required.
          </p>

          <form className="auth-form-grid" onSubmit={handleSubmit}>
            <label>
              Account Type
              <select name="accountType" defaultValue="renter" required>
                <option value="renter">Renter</option>
                <option value="landlord">Landlord</option>
              </select>
            </label>

            <label>
              Full Name
              <input type="text" name="fullName" placeholder="Marcus Williams" required />
            </label>

            <label>
              Email Address
              <input type="email" name="email" placeholder="marcus.williams@example.com" required />
            </label>

            <label>
              Country / Region
              <input type="text" name="country" placeholder="United States" required />
            </label>

            <label>
              Monthly Rent (USD)
              <input type="number" min="100" step="50" name="rentUsd" placeholder="1450" required />
            </label>

            <label>
              Preferred Payment Method
              <select name="paymentMethod" defaultValue="bank-transfer" required>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="debit-card">Debit Card</option>
                <option value="credit-card">Credit Card</option>
              </select>
            </label>

            <label>
              Create Password
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </label>

            <label>
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter password"
                minLength={8}
                required
              />
            </label>

            <label className="auth-check full">
              <input type="checkbox" name="terms" required />
              I agree to the Terms of Service and Privacy Policy.
            </label>

            <button type="submit" className="btn btn-primary full-width full">
              Create My Account
            </button>
          </form>

          <p className="auth-footnote">
            Hackathon demo mode uses one shared judge account so transaction history stays in a single profile.
          </p>
        </section>

        <aside className="auth-side-card">
          <p className="auth-eyebrow">WHAT YOU UNLOCK</p>
          <h2>Credit visibility from rent you already pay</h2>
          <ul className="auth-benefits">
            <li>First score update after your first verified payment</li>
            <li>Eligibility checks for fair-rate loan offers</li>
            <li>Share-ready credit summary for landlords</li>
            <li>Global account setup with USD reporting for consistency</li>
          </ul>
        </aside>
      </main>
    </div>
  );
}
