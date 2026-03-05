import { Link } from "react-router-dom";

export default function Brand({ to = "/" }) {
  return (
    <Link to={to} className="brand">
      <span className="brand-icon" aria-hidden="true">
        <span></span>
        <span></span>
      </span>
      <span className="brand-text">RentLedger</span>
    </Link>
  );
}
