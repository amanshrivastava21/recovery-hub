import { UserPlus, Stethoscope, TrendingUp, PartyPopper } from "lucide-react";
import { useLandingContent } from "@/contexts/LandingContentContext";

const HowItWorks = () => {
  const { content } = useLandingContent();
  const icons = [UserPlus, Stethoscope, TrendingUp, PartyPopper];

  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {content.howItWorks.title}
        </h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
          {content.howItWorks.subtitle}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.howItWorks.steps.map((step, i) => {
            const Icon = icons[i] || UserPlus;
            return (
              <div
                key={i}
                className="group bg-card rounded-xl p-6 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 border border-border"
              >
                <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-7 w-7 text-accent-foreground group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
