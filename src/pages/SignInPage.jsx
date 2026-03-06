import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import {
  DEMO_JUDGE_EMAIL,
  DEMO_JUDGE_PASSWORD,
  DEMO_JUDGE_USER,
  saveSessionUser
} from "../lib/session";

export default function SignInPage() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (email !== DEMO_JUDGE_EMAIL.toLowerCase() || password !== DEMO_JUDGE_PASSWORD) {
      setAuthError("Use the active demo account credentials shown below.");
      return;
    }

    setAuthError("");
    saveSessionUser(DEMO_JUDGE_USER);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <div className="container auth-topbar-inner">
          <Brand />
          <div className="auth-topbar-cta">
            <span>Single account demo access enabled.</span>
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
                placeholder={DEMO_JUDGE_EMAIL}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter account password"
                required
              />
            </label>

            <div className="auth-form-row">
              <label className="auth-check">
                <input type="checkbox" name="remember" />
                Keep me signed in on this device
              </label>
            </div>

            <button type="submit" className="btn btn-primary full-width">
              Sign In
            </button>
          </form>

          {authError ? <p className="action-error">{authError}</p> : null}
          <div className="demo-credentials-card">
            <p className="demo-credentials-title">Demo Access Account</p>
            <p>
              Email: <code>{DEMO_JUDGE_EMAIL}</code>
            </p>
            <p>
              Password: <code>{DEMO_JUDGE_PASSWORD}</code>
            </p>
          </div>
          <p className="auth-footnote">
            Use this single account so all transactions remain visible in one history.
          </p>
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
