import {
  Map,
  Zap,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import featuresPhoto from "@/assets/features-photo.png.asset.json";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Map,
    title: "Interactive floor maps",
    description:
      "See your entire office at a glance with color-coded desk and room availability.",
  },
  {
    icon: Zap,
    title: "One-click booking",
    description:
      "Reserve a desk in seconds with smart defaults and instant confirmation.",
  },
  {
    icon: Users,
    title: "Team coordination",
    description:
      "See where your teammates are sitting and plan office days together.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-card px-4 py-16 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left — text */}
          <div>
            <h2 className="text-balance text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
              Everything you need to manage your workspace
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              From booking a desk to coordinating with your team, DeskFlow has
              you covered.
            </p>

            <ul className="mt-8 space-y-5">
              {features.map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — image */}
          <div>
            <img
              src={featuresPhoto.url}
              alt="Team collaborating in an office"
              className="w-full rounded-2xl object-cover shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
