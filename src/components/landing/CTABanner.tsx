import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export function CTABanner() {
  return (
    <section className="bg-primary px-4 py-16 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance text-2xl font-semibold text-primary-foreground md:text-3xl lg:text-4xl">
          Ready to transform your workspace?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/80">
          Join thousands of teams already using DeskFlow to organize their
          office. Start for free — no credit card required.
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="mt-8"
          asChild
        >
          <Link to="/app">
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
