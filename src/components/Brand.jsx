import { Link } from "react-router-dom";

export default function Brand({ to = "/" }) {
  return (
    <Link to={to} className="brand">
      <span className="brand-icon" aria-hidden="true">
        <svg viewBox="0 0 72 72" role="presentation">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 28v-6l18-12 18 12v24" />
            <rect x="8" y="38" width="16" height="24" />
            <rect x="13" y="44" width="6" height="13" />
            <path d="M24 38h9l14 4.8c4.8 1.6 8 6.1 8 11.1h6.2c3.7 0 6.8 3 6.8 6.8v1.5L36 67.5 24 64.2V38z" />
            <path d="M31 49.4l10.6 3.1c2.4.7 4.9 1.1 7.4 1.1h10.2" />
          </g>
          <g fill="currentColor">
            <rect x="32" y="24" width="3.2" height="3.2" />
            <rect x="36.8" y="24" width="3.2" height="3.2" />
            <rect x="32" y="28.8" width="3.2" height="3.2" />
            <rect x="36.8" y="28.8" width="3.2" height="3.2" />
          </g>
        </svg>
      </span>
      <span className="brand-text">RentLedger</span>
    </Link>
  );
}
