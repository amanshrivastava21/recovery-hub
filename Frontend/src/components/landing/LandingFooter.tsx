import { useLandingContent } from "@/contexts/LandingContentContext";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const getSocialIcon = (label: string) => {
  const iconProps = { size: 18 };
  switch (label.toLowerCase()) {
    case "facebook":
      return <Facebook {...iconProps} />;
    case "twitter":
      return <Twitter {...iconProps} />;
    case "instagram":
      return <Instagram {...iconProps} />;
    case "youtube":
      return <Youtube {...iconProps} />;
    default:
      return label.charAt(0);
  }
};

const LandingFooter = () => {
  const { content } = useLandingContent();

  return (
    <footer className="bg-sidebar-background text-foreground py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <img src={content.navbar.logoUrl} alt={`${content.footer.brandName} logo`} className="h-5 w-5 object-contain" />
          <span className="font-bold text-lg text-foreground">{content.footer.brandName}</span>
        </div>

        <div className="flex gap-4">
          {content.footer.socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {getSocialIcon(s.label)}
            </a>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {content.footer.copyright}
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
