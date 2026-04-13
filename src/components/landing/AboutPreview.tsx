import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const stats = [
  "5,000+ patients rehabilitated",
  "50+ trained counselors and staff",
  "15+ years of service",
  "24/7 helpline and support",
];

const AboutPreview = () => (
  <section className="py-20 px-4 bg-muted/50">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        About Jeevan Sudhar NGO
      </h2>
      <p className="text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
        Founded with a mission to create a drug-free society, Jeevan Sudhar NGO has
        been at the forefront of rehabilitation and de-addiction services. We provide
        holistic care encompassing physical, mental, and social recovery.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8 max-w-lg mx-auto text-left">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            <span className="text-sm text-foreground">{s}</span>
          </div>
        ))}
      </div>

      <Link to="/about">
        <Button variant="outline" size="lg">
          Read More
        </Button>
      </Link>
    </div>
  </section>
);

export default AboutPreview;
