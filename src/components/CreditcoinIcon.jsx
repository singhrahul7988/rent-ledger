export default function CreditcoinIcon({ className = "", title = "Creditcoin" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden={title ? undefined : "true"}
      role="img"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M18.2 6A8.5 8.5 0 1 0 18.2 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="butt"
      />
      <path
        d="M10.8 12h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="butt"
      />
      <circle cx="10.8" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}
