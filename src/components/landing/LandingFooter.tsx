import { Logo } from "../app/Logo";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
  { label: "Demo", href: "/app" },
];

export function LandingFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div>
            <Logo className="[&_span]:text-background [&_.rounded-md]:bg-background/15 [&_.rounded-md]:text-background/80" />
            <p className="mt-3 text-sm text-background/60">
              The modern workspace management platform for hybrid teams.
            </p>
            <p className="mt-2 text-xs text-background/40">
              © 2026 DeskFlow. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-background/50">
              Product
            </h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-background/70 transition-colors hover:text-background"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
