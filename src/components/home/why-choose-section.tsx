import {
  BadgeCheck,
  Headset,
  Lock,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "Direct Verified Sourcing",
    description:
      "Every product is sourced and verified from trusted manufacturers and suppliers.",
  },
  {
    icon: Lock,
    title: "Secure checkout",
    description:
      "Encrypted payments with Paystack & Stripe with complete order protection.",
  },
  {
    icon: Zap,
    title: "Fast fulfillment",
    description:
      "Real-time inventory and tracking from origin warehouse directly to your doorstep.",
  },
  {
    icon: Headset,
    title: "Dedicated support",
    description:
      "Responsive customer service and trade assistance whenever you need it.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="border-y border-border/60 bg-muted/25 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Why choose Africhina Connect
          </h2>
          <p className="mt-3 text-muted-foreground">
            A premium cross-border commerce platform designed for quality, reliability,
            and seamless Africa-China trade.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-heading mt-4 text-base font-semibold">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
