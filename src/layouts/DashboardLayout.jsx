import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import {
  confirmPaymentWebhook,
  getLeases,
  getLoanEligibility,
  getLoans,
  getPayments,
  getRentScore,
  getTransactions,
  initiatePayment,
  requestLoan,
} from "../lib/apiClient";
import {
  clearSessionUser,
  loadSessionUser
} from "../lib/session";

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

function shortenLabel(value, maxLength = 24) {
  const safe = String(value || "").trim();
  if (safe.length <= maxLength) return safe;
  return `${safe.slice(0, maxLength - 1)}…`;
}

function formatEventLabel(eventType) {
  return eventType
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function toRelativeTimeLabel(timestamp) {
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return "just now";
  const diffMs = Date.now() - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

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
  const navigate = useNavigate();
  const topbarTitle = pageTitleByPath[location.pathname] || "Dashboard";
  const [currentUser, setCurrentUser] = useState(() => loadSessionUser());
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const seenTransactionIdsRef = useRef(new Set());
  const previousScoreRef = useRef(null);
  const [dashboardData, setDashboardData] = useState({
    loading: true,
    error: "",
    leases: [],
    payments: [],
    transactions: [],
    loans: [],
    rentScore: null
  });
  const [actionState, setActionState] = useState({
    paying: false,
    requestingLoan: false
  });
  const activeAccountId = currentUser?.accountId || "";

  const pushNotification = useCallback((entry) => {
    setNotifications((prev) => {
      if (prev.some((item) => item.id === entry.id)) return prev;
      return [
        {
          read: false,
          createdAt: new Date().toISOString(),
          type: "info",
          ...entry
        },
        ...prev
      ].slice(0, 24);
    });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate("/signin", { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    setProfileMenuOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!profileMenuOpen && !notificationsOpen) return;

    const onWindowMouseDown = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const onWindowKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    window.addEventListener("mousedown", onWindowMouseDown);
    window.addEventListener("keydown", onWindowKeyDown);

    return () => {
      window.removeEventListener("mousedown", onWindowMouseDown);
      window.removeEventListener("keydown", onWindowKeyDown);
    };
  }, [profileMenuOpen, notificationsOpen]);

  const handleSignOut = () => {
    clearSessionUser();
    setProfileMenuOpen(false);
    setNotificationsOpen(false);
    setCurrentUser(null);
  };

  const refreshDashboardData = useCallback(async ({ silent = false } = {}) => {
    if (!activeAccountId) return;

    if (!silent) {
      setDashboardData((prev) => ({ ...prev, loading: true, error: "" }));
    }

    const [leaseRes, paymentRes, rentScoreRes, loanRes, transactionRes] = await Promise.allSettled([
        getLeases(activeAccountId),
        getPayments(activeAccountId),
        getRentScore(activeAccountId),
        getLoans(activeAccountId),
        getTransactions(activeAccountId)
    ]);

    const errors = [leaseRes, paymentRes, rentScoreRes, loanRes, transactionRes]
      .filter((result) => result.status === "rejected")
      .map((result) => {
        const reason = result.reason;
        if (reason instanceof Error && reason.message) return reason.message;
        return "Unable to load some dashboard data.";
      });

    setDashboardData((prev) => ({
      loading: false,
      error: errors.length ? errors[0] : "",
      leases: leaseRes.status === "fulfilled" ? leaseRes.value.items || [] : prev.leases,
      payments: paymentRes.status === "fulfilled" ? paymentRes.value.items || [] : prev.payments,
      transactions: transactionRes.status === "fulfilled" ? transactionRes.value.items || [] : prev.transactions,
      loans: loanRes.status === "fulfilled" ? loanRes.value.items || [] : prev.loans,
      rentScore: rentScoreRes.status === "fulfilled" ? rentScoreRes.value : prev.rentScore
    }));
  }, [activeAccountId]);

  useEffect(() => {
    if (!currentUser) return;
    refreshDashboardData();
  }, [currentUser, refreshDashboardData]);

  useEffect(() => {
    if (!dashboardData.error) return;
    pushNotification({
      id: `error-${dashboardData.error}`,
      type: "error",
      title: "Data Sync Issue",
      message: dashboardData.error
    });
  }, [dashboardData.error, pushNotification]);

  useEffect(() => {
    if (dashboardData.leases.length > 0 && dashboardData.payments.length === 0) {
      pushNotification({
        id: "reminder-first-payment",
        type: "info",
        title: "First Payment Pending",
        message: "Record the first rent payment to start building credit history.",
        route: "/dashboard/pay-rent"
      });
    }
  }, [dashboardData.leases.length, dashboardData.payments.length, pushNotification]);

  useEffect(() => {
    const currentScore = dashboardData.rentScore?.score;
    if (typeof currentScore !== "number") return;

    if (previousScoreRef.current === null) {
      previousScoreRef.current = currentScore;
      return;
    }

    if (currentScore > previousScoreRef.current) {
      pushNotification({
        id: `score-up-${currentScore}`,
        type: "success",
        title: "RentScore Updated",
        message: `Your score increased to ${currentScore}. Keep the streak going.`,
        route: "/dashboard/my-rentscore"
      });
    }

    previousScoreRef.current = currentScore;
  }, [dashboardData.rentScore, pushNotification]);

  useEffect(() => {
    const seen = seenTransactionIdsRef.current;
    const newTransactions = dashboardData.transactions.filter((tx) => !seen.has(tx.eventId));
    if (newTransactions.length === 0) return;

    newTransactions.forEach((tx) => {
      seen.add(tx.eventId);
      pushNotification({
        id: `tx-${tx.eventId}`,
        type: tx.status === "SUCCESS" ? "success" : tx.status === "FAILED" ? "error" : "info",
        title: formatEventLabel(tx.eventType),
        message: `Status: ${tx.status}`,
        href: tx.explorerUrl || ""
      });
    });
  }, [dashboardData.transactions, pushNotification]);

  const unreadNotifications = notifications.filter((item) => !item.read).length;

  const toggleNotifications = () => {
    setNotificationsOpen((open) => {
      const next = !open;
      if (next) {
        setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      }
      return next;
    });
    setProfileMenuOpen(false);
  };

  const submitRentPayment = async ({
    leaseId,
    amountUsd,
    processingFeeUsd,
    dueDate
  }) => {
    setActionState((prev) => ({ ...prev, paying: true }));
    try {
      const initiated = await initiatePayment({
        leaseId,
        payerAccountId: activeAccountId,
        amountUsd,
        processingFeeUsd,
        dueDate
      });

      const confirmation = await confirmPaymentWebhook({
        paymentIntentId: initiated.paymentIntentId,
        networkStatus: "CONFIRMED"
      });

      await refreshDashboardData({ silent: true });
      pushNotification({
        id: `payment-${initiated.paymentIntentId}`,
        type: "success",
        title: "Rent Payment Recorded",
        message: `Certificate ${confirmation.certificateTokenId} issued. Updated score: ${confirmation.newScore}.`,
        route: "/dashboard/payment-history"
      });
      return confirmation;
    } catch (error) {
      pushNotification({
        id: `payment-failed-${Date.now()}`,
        type: "error",
        title: "Payment Could Not Be Recorded",
        message: error instanceof Error ? error.message : "Unknown payment error."
      });
      throw error;
    } finally {
      setActionState((prev) => ({ ...prev, paying: false }));
    }
  };

  const requestLoanAction = async ({ tier, amountUsd }) => {
    setActionState((prev) => ({ ...prev, requestingLoan: true }));
    try {
      const response = await requestLoan({
        accountId: activeAccountId,
        tier,
        amountUsd
      });
      await refreshDashboardData({ silent: true });
      pushNotification({
        id: `loan-${response.loanId}`,
        type: "success",
        title: "Loan Request Submitted",
        message: `Loan ${response.loanId} is active with APR ${response.apr}%.`,
        route: "/dashboard/loans"
      });
      return response;
    } catch (error) {
      pushNotification({
        id: `loan-failed-${Date.now()}`,
        type: "error",
        title: "Loan Request Failed",
        message: error instanceof Error ? error.message : "Unable to submit loan request."
      });
      throw error;
    } finally {
      setActionState((prev) => ({ ...prev, requestingLoan: false }));
    }
  };

  const checkLoanEligibility = (requestedTier) =>
    getLoanEligibility({
      accountId: activeAccountId,
      requestedTier
    });

  const outletContext = useMemo(
    () => ({
      currentUser,
      accountId: activeAccountId,
      ...dashboardData,
      ...actionState,
      refreshDashboardData,
      submitRentPayment,
      requestLoanAction,
      checkLoanEligibility
    }),
    [currentUser, activeAccountId, dashboardData, actionState]
  );

  if (!currentUser) {
    return null;
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div>
          <Brand to="/dashboard" />
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
            <div className="wallet-copy">
              <span className="wallet-label">Account</span>
              <span className="wallet-id" title={activeAccountId}>
                {activeAccountId}
              </span>
            </div>
          </div>
          <p className="creditcoin-note">
            Powered by <span className="creditcoin-brand">Creditcoin</span>
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
            <div className="notification-menu" ref={notificationMenuRef}>
              <button
                className="icon-btn"
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={toggleNotifications}
              >
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
                {unreadNotifications > 0 ? (
                  <span className="notification-badge">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                ) : null}
              </button>
              {notificationsOpen ? (
                <div className="notification-panel" role="dialog" aria-label="Notifications">
                  <div className="notification-panel-head">
                    <p>Notifications</p>
                  </div>
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <article key={item.id} className={`notification-item ${item.type}${item.read ? "" : " unread"}`}>
                          <p className="notification-item-title">{item.title}</p>
                          <p className="notification-item-message">{item.message}</p>
                          <div className="notification-item-meta">
                            <span>{toRelativeTimeLabel(item.createdAt)}</span>
                            {item.route ? (
                              <Link to={item.route} className="notification-action">
                                Open
                              </Link>
                            ) : null}
                            {item.href ? (
                              <a href={item.href} target="_blank" rel="noreferrer" className="notification-action">
                                Explorer
                              </a>
                            ) : null}
                          </div>
                        </article>
                      ))
                    ) : (
                      <p className="notification-empty">No alerts yet.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="profile-menu" ref={profileMenuRef}>
              <button
                type="button"
                className="avatar avatar-btn"
                aria-label="Open profile menu"
                aria-expanded={profileMenuOpen}
                onClick={() => {
                  setProfileMenuOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 13a5 5 0 1 0-5-5 5 5 0 0 0 5 5zM4 21a8 8 0 0 1 16 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {profileMenuOpen ? (
                <div className="profile-menu-panel" role="menu">
                  <p className="profile-menu-head">Profile</p>
                  <p className="profile-menu-name" title={currentUser.fullName}>
                    {shortenLabel(currentUser.fullName, 28)}
                  </p>
                  <p className="profile-menu-email" title={currentUser.email}>
                    {shortenLabel(currentUser.email, 34)}
                  </p>
                  <p className="profile-menu-account mono" title={activeAccountId}>
                    {activeAccountId}
                  </p>
                  <button
                    type="button"
                    role="menuitem"
                    className="btn btn-secondary small full-width"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {dashboardData.error ? (
            <div className="data-alert">
              <p>{dashboardData.error}</p>
              <button className="btn btn-secondary small" type="button" onClick={() => refreshDashboardData()}>
                Retry
              </button>
            </div>
          ) : null}
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
}
