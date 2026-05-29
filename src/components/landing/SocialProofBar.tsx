export function SocialProofBar() {
  const companies = [
    { name: "Acme Corp", weight: "font-bold" },
    { name: "Globex", weight: "font-semibold italic" },
    { name: "Initech", weight: "font-bold tracking-wide" },
    { name: "Umbrella", weight: "font-semibold" },
    { name: "Wayne Enterprises", weight: "font-bold tracking-tight" },
    { name: "Stark Industries", weight: "font-semibold italic" },
  ];

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
          {companies.map((c) => (
            <span
              key={c.name}
              className={`text-lg text-background/40 ${c.weight}`}
            >
              {c.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
