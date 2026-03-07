import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { createLoanApplication, getLoanApplications } from "../../lib/apiClient";

const tierTerms = {
  1: { label: "Tier 1 Starter", maxAmountUsd: 5000, apr: 18, minScore: 300, tenorMonths: 6 },
  2: { label: "Tier 2 Builder", maxAmountUsd: 10000, apr: 15, minScore: 450, tenorMonths: 6 },
  3: { label: "Tier 3 Established", maxAmountUsd: 15000, apr: 12, minScore: 600, tenorMonths: 6 },
  4: { label: "Tier 4 Trusted", maxAmountUsd: 20000, apr: 10, minScore: 700, tenorMonths: 6 }
};

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function toPositiveNumber(value) {
  const parsed = Number.parseFloat(String(value || "").replace(/,/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed;
}

export default function LoanApplicationPage() {
  const [searchParams] = useSearchParams();
  const {
    accountId,
    currentUser,
    rentScore,
    checkLoanEligibility,
    refreshDashboardData
  } = useOutletContext();

  const score = rentScore?.score || 150;
  const initialTierFromQuery = Number(searchParams.get("tier"));
  const safeTier = [1, 2, 3, 4].includes(initialTierFromQuery) ? initialTierFromQuery : 1;
  const [tier, setTier] = useState(safeTier);
  const [requestedAmount, setRequestedAmount] = useState("2200");
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("EMPLOYED");
  const [purpose, setPurpose] = useState("");
  const [idDocumentType, setIdDocumentType] = useState("NATIONAL_ID");
  const [idDocumentNumber, setIdDocumentNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [postalCode, setPostalCode] = useState("");
  const [consentKyc, setConsentKyc] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [applications, setApplications] = useState([]);

  const terms = tierTerms[tier] || tierTerms[1];
  const amountUsd = Math.round(toPositiveNumber(requestedAmount));

  useEffect(() => {
    const max = terms.maxAmountUsd;
    if (amountUsd > max) {
      setRequestedAmount(String(max));
    }
    if (!requestedAmount) {
      setRequestedAmount(String(Math.min(2200, max)));
    }
  }, [tier, terms.maxAmountUsd]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!accountId) return;
    getLoanApplications(accountId)
      .then((res) => setApplications(res.items || []))
      .catch(() => setApplications([]));
  }, [accountId]);

  const canApplyForTier = score >= terms.minScore;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill basic identity details.");
      return;
    }
    if (!dateOfBirth) {
      setError("Please provide date of birth.");
      return;
    }
    if (!annualIncome || toPositiveNumber(annualIncome) <= 0) {
      setError("Please provide valid annual income.");
      return;
    }
    if (!purpose.trim() || purpose.trim().length < 8) {
      setError("Loan purpose must be at least 8 characters.");
      return;
    }
    if (!idDocumentNumber.trim()) {
      setError("Please provide a valid identification number.");
      return;
    }
    if (!addressLine1.trim() || !city.trim() || !country.trim() || !postalCode.trim()) {
      setError("Please complete address details.");
      return;
    }
    if (!consentKyc || !consentTerms) {
      setError("You must accept KYC and loan processing consent.");
      return;
    }
    if (amountUsd <= 0 || amountUsd > terms.maxAmountUsd) {
      setError(`Requested amount must be between $1 and ${formatUsd(terms.maxAmountUsd)}.`);
      return;
    }

    setLoading(true);
    try {
      const eligibility = await checkLoanEligibility(tier);
      if (!eligibility.eligible) {
        setError(`Not eligible for this tier yet. Minimum score required is ${eligibility.requiredScore}.`);
        setLoading(false);
        return;
      }

      const response = await createLoanApplication({
        accountId,
        tier,
        requestedAmountUsd: amountUsd,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth,
        annualIncomeUsd: Math.round(toPositiveNumber(annualIncome)),
        employmentStatus,
        purpose: purpose.trim(),
        idDocumentType,
        idDocumentNumber: idDocumentNumber.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        country: country.trim(),
        postalCode: postalCode.trim(),
        consentKyc: true,
        consentTerms: true
      });

      setSuccess(
        `${response.message} Reference ID: ${response.applicationId}.`
      );
      const latest = await getLoanApplications(accountId);
      setApplications(latest.items || []);
      await refreshDashboardData({ silent: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit loan request.");
    } finally {
      setLoading(false);
    }
  };

  const latestApplications = useMemo(() => applications.slice(0, 5), [applications]);

  return (
    <>
      <section className="pay-banner">
        <p>
          Submit a complete loan request with KYC details. Our team will verify your
          profile and reach out with confirmation.
        </p>
      </section>

      <section className="dashboard-columns">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Loan Application & KYC</h3>
            <Link to="/dashboard/loans" className="btn btn-ghost small btn-link">
              Back to Loans
            </Link>
          </div>
          <form className="form-grid loan-application-grid" onSubmit={handleSubmit}>
            <label>
              Loan Tier
              <select value={tier} onChange={(event) => setTier(Number(event.target.value))}>
                {Object.entries(tierTerms).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label} ({formatUsd(value.maxAmountUsd)} max, {value.apr}% APR)
                  </option>
                ))}
              </select>
            </label>
            <label>
              Requested Amount (USD)
              <input
                type="number"
                min={1}
                max={terms.maxAmountUsd}
                step={1}
                value={requestedAmount}
                onChange={(event) => setRequestedAmount(event.target.value)}
              />
            </label>

            <label>
              Full Name
              <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              Phone
              <input type="text" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <label>
              Date of Birth
              <input type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} />
            </label>
            <label>
              Annual Income (USD)
              <input type="number" min={1} value={annualIncome} onChange={(event) => setAnnualIncome(event.target.value)} />
            </label>
            <label>
              Employment Status
              <select value={employmentStatus} onChange={(event) => setEmploymentStatus(event.target.value)}>
                <option value="EMPLOYED">Employed</option>
                <option value="SELF_EMPLOYED">Self-employed</option>
                <option value="STUDENT">Student</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label>
              Identification Type
              <select value={idDocumentType} onChange={(event) => setIdDocumentType(event.target.value)}>
                <option value="NATIONAL_ID">National ID</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVERS_LICENSE">Driver's License</option>
              </select>
            </label>
            <label>
              Identification Number
              <input
                type="text"
                value={idDocumentNumber}
                onChange={(event) => setIdDocumentNumber(event.target.value)}
              />
            </label>
            <label>
              Address Line 1
              <input type="text" value={addressLine1} onChange={(event) => setAddressLine1(event.target.value)} />
            </label>
            <label>
              City
              <input type="text" value={city} onChange={(event) => setCity(event.target.value)} />
            </label>
            <label>
              Country
              <input type="text" value={country} onChange={(event) => setCountry(event.target.value)} />
            </label>
            <label>
              Postal Code
              <input type="text" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
            </label>
            <label className="full">
              Loan Purpose
              <textarea value={purpose} rows={3} onChange={(event) => setPurpose(event.target.value)} />
            </label>

            <label className="setting-check full">
              <input type="checkbox" checked={consentKyc} onChange={(event) => setConsentKyc(event.target.checked)} />
              <span>I confirm the KYC details and documents are accurate.</span>
            </label>
            <label className="setting-check full">
              <input
                type="checkbox"
                checked={consentTerms}
                onChange={(event) => setConsentTerms(event.target.checked)}
              />
              <span>I accept loan processing terms and communication consent.</span>
            </label>

            <div className="hero-actions full">
              <button className="btn btn-primary" type="submit" disabled={loading || !canApplyForTier}>
                {loading ? "Submitting..." : "Submit Loan Request"}
              </button>
            </div>
            {!canApplyForTier ? (
              <p className="action-error full">
                Current score {score} is below required score {terms.minScore} for this tier.
              </p>
            ) : null}
            {error ? <p className="action-error full">{error}</p> : null}
            {success ? <p className="action-success full">{success}</p> : null}
          </form>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Application Snapshot</h3>
          </div>
          <div className="summary-rows">
            <p>
              <span>Current Score</span>
              <strong>{score}</strong>
            </p>
            <p>
              <span>Selected Tier</span>
              <strong>{terms.label}</strong>
            </p>
            <p>
              <span>Maximum Eligible Amount</span>
              <strong>{formatUsd(terms.maxAmountUsd)}</strong>
            </p>
            <p>
              <span>Requested APR</span>
              <strong>{terms.apr}%</strong>
            </p>
            <p className="total">
              <span>Tenor</span>
              <strong>{terms.tenorMonths} months</strong>
            </p>
          </div>
        </article>
      </section>

      <section className="table-card">
        <div className="panel-header">
          <h3>Recent Loan Requests</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Tier</th>
              <th>Requested Amount</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {latestApplications.length > 0 ? (
              latestApplications.map((item) => (
                <tr key={item.applicationId}>
                  <td>{item.applicationId}</td>
                  <td>{item.tier}</td>
                  <td>{formatUsd(item.requestedAmountUsd)}</td>
                  <td>
                    <span className="status-tag active">{item.status}</span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleString("en-US")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>No loan requests submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
