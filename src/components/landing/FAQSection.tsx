import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const faqs = [
  {
    question: "What is DeskFlow?",
    answer:
      "DeskFlow is a modern workspace management platform that lets teams book desks, meeting rooms, parking spots, and lockers with ease. It provides real-time availability, interactive floor maps, and team coordination tools.",
  },
  {
    question: "How does desk booking work?",
    answer:
      "Browse available desks on the floor map or calendar, select your preferred spot and time, and confirm your booking in seconds. You can also set up recurring reservations for your regular office days.",
  },
  {
    question: "Can I book for my team?",
    answer:
      "Yes! DeskFlow supports buddy booking, letting you reserve adjacent desks for yourself and your teammates in one action. You can also see where your team is sitting and coordinate office days together.",
  },
  {
    question: "What happens if I forget to check in?",
    answer:
      "DeskFlow has an auto-release feature. If you don't check in within the configured grace period (default 15 minutes), your booking is automatically released so others can use the space. You'll receive a notification when this happens.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "DeskFlow is a responsive web application that works beautifully on mobile browsers. You can book desks, check in via QR code, and manage your reservations right from your phone — no app download needed.",
  },
  {
    question: "How do I get started?",
    answer:
      "Sign up for a free account and you can start booking immediately. The free plan supports up to 5 desks and includes basic calendar views. Upgrade to Pro for unlimited resources, floor maps, and team features.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="px-4 py-12 md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-balance text-center text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Everything you need to know about DeskFlow.
        </p>

        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
