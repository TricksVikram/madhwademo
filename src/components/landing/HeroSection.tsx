import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section className="bg-card px-4 pb-32 pt-16 md:px-8 md:pb-44 md:pt-24">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="mx-auto max-w-3xl text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Your office{" "}
          <span className="ml-2 inline-block rounded-xl bg-primary/10 px-4 pb-3 pt-1 text-primary">
            organised
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
          DeskFlow makes it effortless to book desks, meeting rooms, and
          resources. See who's in the office, coordinate with your team, and
          never fight over a hot desk again.
        </p>

        <div className="mt-8 flex justify-center">
          <Button size="lg" asChild>
            <Link to="/app">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
