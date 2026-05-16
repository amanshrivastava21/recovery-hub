import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLandingContent } from "@/contexts/LandingContentContext";

const LandingNavbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { content } = useLandingContent();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-card border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={content.navbar.logoUrl} alt={`${content.navbar.brand} logo`} className="h-7 w-7 object-contain" />
            <span className={`text-xl font-bold ${scrolled ? 'text-muted-foreground' : 'text-white'}`}>
              {content.navbar.brand}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {content.navbar.links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : scrolled
                      ? 'text-muted-foreground'
                      : 'text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link to="/login">
              <Button size="sm">{content.navbar.loginText}</Button>
            </Link>
          </div>

          <button
            className={`md:hidden ${scrolled ? 'text-foreground' : 'text-white'}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-4 py-4 space-y-3">
            {content.navbar.links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`block text-sm font-medium py-2 ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link to="/login" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full">{content.navbar.loginText}</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
