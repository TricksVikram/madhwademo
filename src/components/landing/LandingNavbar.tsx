import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Logo } from "../app/Logo";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 w-full transition-[background-color,border-color] duration-300"
      style={{
        backgroundColor: scrolled ? "var(--color-card)" : "transparent",
        borderBottom: scrolled
          ? "1px solid var(--color-border)"
          : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app" data-testid="landing-login">Log in</Link>
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link to="/app" data-testid="landing-get-started">Get started free</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
