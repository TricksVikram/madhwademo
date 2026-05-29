import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "DeskFlow completely eliminated the morning desk scramble. Our team knows exactly where everyone is sitting before they even arrive at the office.",
    name: "Sarah Mitchell",
    role: "Office manager, Acme Corp",
    initials: "SM",
  },
  {
    quote:
      "The floor map view is a game-changer. I can see who's near me, book adjacent desks for my team, and plan our in-office days effortlessly.",
    name: "David Park",
    role: "Engineering lead, Globex",
    initials: "DP",
  },
  {
    quote:
      "As a facilities director, the analytics dashboard gives me real insight into how our space is used. We've optimized our layout and saved 30% on unused desks.",
    name: "Maria Torres",
    role: "Facilities director, Initech",
    initials: "MT",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-card px-4 py-12 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-balance text-center text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
          Loved by teams everywhere
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          See what teams are saying about DeskFlow.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed text-foreground italic">
                  "{t.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
