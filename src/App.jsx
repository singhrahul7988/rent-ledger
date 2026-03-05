import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardOverviewPage from "./pages/dashboard/DashboardOverviewPage";
import PayRentPage from "./pages/dashboard/PayRentPage";
import PaymentHistoryPage from "./pages/dashboard/PaymentHistoryPage";
import MyRentScorePage from "./pages/dashboard/MyRentScorePage";
import CreditReportPage from "./pages/dashboard/CreditReportPage";
import LoansPage from "./pages/dashboard/LoansPage";
import TransactionsPage from "./pages/dashboard/TransactionsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import HelpPage from "./pages/dashboard/HelpPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="viewport-warning">
        This demo is optimized for desktop (minimum 1280px width).
      </div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="pay-rent" element={<PayRentPage />} />
          <Route path="payment-history" element={<PaymentHistoryPage />} />
          <Route path="my-rentscore" element={<MyRentScorePage />} />
          <Route path="credit-report" element={<CreditReportPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
