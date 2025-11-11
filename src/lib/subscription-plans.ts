/**
 * Plans d'abonnement et tarification
 */

export type PlanType = "discovery" | "essential" | "pro";

export interface Plan {
  id: PlanType;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  credits: number | "unlimited";
  features: string[];
  stripeMonthlyPriceId?: string;
  stripeYearlyPriceId?: string;
}

export const PLANS: Record<PlanType, Plan> = {
  discovery: {
    id: "discovery",
    name: "Découverte",
    priceMonthly: 0,
    priceYearly: 0,
    credits: 5,
    features: [
      "5 crédits gratuits",
      "Accès à tous les styles",
      "Générations en haute résolution",
      "Support par email",
    ],
  },
  essential: {
    id: "essential",
    name: "Essentiel",
    priceMonthly: 9.99,
    priceYearly: 99.99,
    credits: 100,
    features: [
      "100 crédits par mois",
      "Accès à tous les styles",
      "Générations en haute résolution",
      "Support prioritaire",
      "Galerie privée",
    ],
    stripeMonthlyPriceId: process.env.STRIPE_ESSENTIAL_MONTHLY_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_ESSENTIAL_YEARLY_PRICE_ID,
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 29.99,
    priceYearly: 299.99,
    credits: "unlimited",
    features: [
      "Générations illimitées",
      "Accès à tous les styles",
      "Générations en ultra haute résolution",
      "Support 24/7",
      "Galerie privée",
      "API access",
    ],
    stripeMonthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
};

export function getPlanById(id: string): Plan | undefined {
  return PLANS[id as PlanType];
}

export function getPlanByStripePriceId(priceId: string): Plan | undefined {
  return Object.values(PLANS).find(
    (plan) =>
      plan.stripeMonthlyPriceId === priceId ||
      plan.stripeYearlyPriceId === priceId
  );
}


