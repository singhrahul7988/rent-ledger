import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import SignInPage from "./pages/SignInPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardOverviewPage from "./pages/dashboard/DashboardOverviewPage";
import PayRentPage from "./pages/dashboard/PayRentPage";
import PaymentHistoryPage from "./pages/dashboard/PaymentHistoryPage";
import MyRentScorePage from "./pages/dashboard/MyRentScorePage";
import CreditReportPage from "./pages/dashboard/CreditReportPage";
import LoansPage from "./pages/dashboard/LoansPage";
import LoanApplicationPage from "./pages/dashboard/LoanApplicationPage";
import TransactionsPage from "./pages/dashboard/TransactionsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import HelpPage from "./pages/dashboard/HelpPage";
import CertificateViewPage from "./pages/CertificateViewPage";
import SharedCreditReportPage from "./pages/SharedCreditReportPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="viewport-warning">
        This demo is optimized for desktop (minimum 1280px width).
      </div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<Navigate to="/signin" replace />} />
        <Route path="/certificate/:paymentRecordId" element={<CertificateViewPage />} />
        <Route path="/shared-report/:token" element={<SharedCreditReportPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="pay-rent" element={<PayRentPage />} />
          <Route path="payment-history" element={<PaymentHistoryPage />} />
          <Route path="my-rentscore" element={<MyRentScorePage />} />
          <Route path="credit-report" element={<CreditReportPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="loans/apply" element={<LoanApplicationPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
