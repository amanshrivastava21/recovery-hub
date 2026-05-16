import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import ScrollToTop from "@/components/landing/ScrollToTop";
import { useLandingContent } from "@/contexts/LandingContentContext";

const AboutPage = () => {
  const { content } = useLandingContent();

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">
            {content.aboutPage.title}
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            {content.aboutPage.description}
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {content.aboutPage.values.map((v, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-card">
                <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <span className="text-accent-foreground font-semibold">•</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {content.aboutPage.mission}
            </p>
          </div>
        </div>
      </div>
      <LandingFooter />
      <ScrollToTop />
    </div>
  );
};

export default AboutPage;
