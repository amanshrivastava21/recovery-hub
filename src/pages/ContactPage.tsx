import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import ScrollToTop from "@/components/landing/ScrollToTop";
import Contact from "@/components/landing/Contact";

const ContactPage = () => (
  <div className="min-h-screen bg-background">
    <LandingNavbar />
    <div className="pt-24">
      <Contact />
    </div>
    <LandingFooter />
    <ScrollToTop />
  </div>
);

export default ContactPage;
