import {
  BadgeCheck,
  Headset,
  Lock,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "Direct China Sourcing",
    description:
      "We connect you directly to verified Chinese suppliers and manufacturers without middlemen.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description:
      "Protected checkout and encrypted transactions for a safe, reliable buying experience.",
  },
  {
    icon: Zap,
    title: "Handled Logistics",
    description:
      "We coordinate overseas freight and customs handling so you do not have to navigate import complexities.",
  },
  {
    icon: Headset,
    title: "Clear Order Tracking",
    description:
      "Track your shipment from China warehouse dispatch all the way to local Nigerian delivery.",
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
            A practical, professional bridge connecting Nigerian buyers with China&apos;s
            manufacturing hubs.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
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
