import { Heart, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const socials = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

const LandingFooter = () => (
  <footer className="bg-sidebar-background text-sidebar-foreground py-10 px-4">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <span className="font-bold text-lg">Jeevan Sudhar NGO</span>
      </div>

      <div className="flex gap-4">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <s.icon className="h-4 w-4" />
          </a>
        ))}
      </div>

      <p className="text-sm text-sidebar-foreground/60">
        © {new Date().getFullYear()} Jeevan Sudhar NGO. All rights reserved.
      </p>
    </div>
  </footer>
);

export default LandingFooter;
