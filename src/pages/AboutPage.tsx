import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import ScrollToTop from "@/components/landing/ScrollToTop";
import { Heart, Users, Shield, Award } from "lucide-react";

const values = [
  { icon: Heart, title: "Compassion", text: "We treat every individual with dignity and empathy." },
  { icon: Users, title: "Community", text: "Building a network of support for lasting recovery." },
  { icon: Shield, title: "Integrity", text: "Transparent and ethical practices in everything we do." },
  { icon: Award, title: "Excellence", text: "Committed to the highest standards of rehabilitation care." },
];

const AboutPage = () => (
  <div className="min-h-screen bg-background">
    <LandingNavbar />
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">
          About Jeevan Sudhar NGO
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 leading-relaxed">
          Founded in 2009, Jeevan Sudhar NGO has been dedicated to combating substance
          abuse and helping individuals reclaim their lives through holistic rehabilitation
          programs, counseling, and community reintegration support.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {values.map((v, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-card">
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <v.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            To create a drug-free society by providing accessible, quality rehabilitation
            services, raising awareness, and empowering communities to support individuals
            on their journey to recovery.
          </p>
        </div>
      </div>
    </div>
    <LandingFooter />
    <ScrollToTop />
  </div>
);

export default AboutPage;
