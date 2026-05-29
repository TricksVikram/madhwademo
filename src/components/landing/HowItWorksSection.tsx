const steps = [
  {
    number: 1,
    title: "Browse available spaces",
    description:
      "Explore your office floor map or calendar to find the perfect desk, room, or resource for your day.",
  },
  {
    number: 2,
    title: "Book in seconds",
    description:
      "Select your preferred spot, pick a time, and confirm — it's that simple. Recurring? We've got that too.",
  },
  {
    number: 3,
    title: "Check in & get to work",
    description:
      "Arrive at the office, check in via QR code or one tap, and you're all set. No-shows get auto-released.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-muted/40 px-4 py-12 md:px-8 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-balance text-center text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Three simple steps to a better office experience.
        </p>

        <div className="relative mt-12">
          {/* Connecting line — desktop only */}
          <div className="absolute top-8 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] hidden h-px border-t-2 border-dashed border-border md:block" />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                {/* Number circle */}
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-md">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
