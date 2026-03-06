import { NavLink, Outlet, useLocation } from "react-router-dom";
import Brand from "../components/Brand";

function Dot({ color = "var(--color-green)" }) {
  return <span className="dot" style={{ background: color }} aria-hidden="true"></span>;
}

function SidebarIcon({ d }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const sidebarGroups = [
  {
    label: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: "M4 5h16v14H4zM9 5v14M15 5v14",
        end: true
      }
    ]
  },
  {
    label: "PAYMENTS",
    items: [
      {
        name: "Pay Rent",
        path: "/dashboard/pay-rent",
        icon: "M3 7h18M6 4v6M18 4v6M4 11h16v9H4z"
      },
      {
        name: "Payment History",
        path: "/dashboard/payment-history",
        icon: "M6 4h9l3 3v13H6zM9 12h6M9 16h6"
      }
    ]
  },
  {
    label: "CREDIT",
    items: [
      {
        name: "My RentScore",
        path: "/dashboard/my-rentscore",
        icon: "M4 12a8 8 0 1 1 16 0"
      },
      {
        name: "Credit Report",
        path: "/dashboard/credit-report",
        icon: "M6 4h9l3 3v13H6zM9 11h6M9 15h6"
      }
    ]
  },
  {
    label: "FINANCE",
    items: [
      {
        name: "Loans",
        path: "/dashboard/loans",
        icon: "M4 8h16M4 16h16M8 4v16M16 4v16"
      },
      {
        name: "Transactions",
        path: "/dashboard/transactions",
        icon: "M4 6h16M4 12h16M4 18h16"
      }
    ]
  },
  {
    label: "ACCOUNT",
    items: [
      {
        name: "Settings",
        path: "/dashboard/settings",
        icon: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"
      },
      {
        name: "Help",
        path: "/dashboard/help",
        icon: "M12 17h.01M9.3 9a2.7 2.7 0 1 1 5.4 0c0 2-2.7 2.1-2.7 4"
      }
    ]
  }
];

const pageTitleByPath = {
  "/dashboard": "Dashboard",
  "/dashboard/pay-rent": "Pay Rent",
  "/dashboard/payment-history": "Payment History",
  "/dashboard/my-rentscore": "My RentScore",
  "/dashboard/credit-report": "Credit Report",
  "/dashboard/loans": "Loans",
  "/dashboard/transactions": "Transactions",
  "/dashboard/settings": "Settings",
  "/dashboard/help": "Help"
};

function SidebarItem({ item }) {
  if (!item.path) {
    return (
      <button className="sidebar-item disabled" type="button">
        <SidebarIcon d={item.icon} />
        <span>{item.name}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) => `sidebar-item${isActive ? " active" : ""}`}
    >
      <SidebarIcon d={item.icon} />
      <span>{item.name}</span>
    </NavLink>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const topbarTitle = pageTitleByPath[location.pathname] || "Dashboard";

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div>
          <Brand to="/" />
          <p className="sidebar-tagline">Your rent builds your future</p>

          <div className="sidebar-nav">
            {sidebarGroups.map((group) => (
              <div key={group.label}>
                <p className="sidebar-group-label">{group.label}</p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <SidebarItem item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="wallet-indicator">
            <Dot />
            <span>My Account: 0x8f21A9...B113</span>
          </div>
          <p className="creditcoin-note">
            Powered by <span className="creditcoin-brand">credit coin</span>
          </p>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <h1>{topbarTitle}</h1>

          <div className="topbar-right">
            <span className="network-badge">
              <Dot />
              CTC Testnet
            </span>
            <button className="icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 9a6 6 0 1 1 12 0v5l2 2H4l2-2zM10 19a2 2 0 0 0 4 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="avatar">SC</span>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
