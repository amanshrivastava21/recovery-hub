import LandingNavbar from "@/components/landing/LandingNavbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Awareness from "@/components/landing/Awareness";
import AboutPreview from "@/components/landing/AboutPreview";
import Contact from "@/components/landing/Contact";
import LandingFooter from "@/components/landing/LandingFooter";
import ScrollToTop from "@/components/landing/ScrollToTop";

const HomePage = () => (
  <div className="min-h-screen bg-background">
    <LandingNavbar />
    <Hero />
    <HowItWorks />
    <Awareness />
    <AboutPreview />
    <Contact />
    <LandingFooter />
    <ScrollToTop />
  </div>
);

export default HomePage;
