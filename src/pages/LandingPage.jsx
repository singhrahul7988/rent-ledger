import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import StatsBar from "../components/StatsBar";
import HowItWorks from "../components/HowItWorks";
import RentScoreExplainer from "../components/RentScoreExplainer";
import LoanTiers from "../components/LoanTiers";
import ForLandlords from "../components/ForLandlords";
import Footer from "../components/Footer";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-page">
      <Navbar scrolled={isScrolled} />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <RentScoreExplainer />
        <LoanTiers />
        <ForLandlords />
      </main>
      <Footer />
    </div>
  );
}
