import {
  BadgeCheck,
  Headset,
  Lock,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "Verified sellers",
    description:
      "Every store is reviewed before going live, so you shop with confidence.",
  },
  {
    icon: Lock,
    title: "Secure checkout",
    description:
      "Encrypted payments with Stripe and order protection on every purchase.",
  },
  {
    icon: Zap,
    title: "Fast fulfillment",
    description:
      "Real-time inventory and tracking from warehouse to your doorstep.",
  },
  {
    icon: Headset,
    title: "Dedicated support",
    description:
      "Human help when you need it — for buyers and sellers alike.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="border-y border-border/60 bg-muted/25 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Why choose ShopSphere
          </h2>
          <p className="mt-3 text-muted-foreground">
            A premium multi-vendor platform designed for clarity, trust, and
            speed — not marketplace noise.
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
