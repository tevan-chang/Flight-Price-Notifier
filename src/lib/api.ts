// Flight API (API Gateway HTTP API → Lambda → DynamoDB). Public endpoint; the browser holds no AWS credentials.
export const API_URL: string = (
  (import.meta.env["VITE_API_URL"] as string | undefined) ??"https://1u6hrfhj4h.execute-api.us-east-1.amazonaws.com"
).replace(/\/$/, "");

export type PlanName = "tokyo" | "seoul" | "london";

export type SubscriptionStatus = "pending_payment" | "active" | "cancelled" | "expired";

export interface Subscription {
  email: string;
  route: string;
  plan_name: PlanName;
  target_price: number;
  currency: string;
  subscription_status: SubscriptionStatus;
  current_period_end?: string | null;
  current_period_end_date?: string | null;
  updated_at?: string;
}

export async function listSubscriptions(email: string): Promise<Subscription[]> {
  const res = await fetch(`${API_URL}/subscriptions?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(`Failed to load subscriptions (${res.status})`);
  const data = (await res.json()) as { subscriptions: Subscription[] };
  return data.subscriptions;
}

// /subscribe returns text/html (an auto-submit ECPay checkout form) for a new/unpaid subscription,
// or application/json for an in-place target-price update on a paid/cancelled-in-grace one.
export async function saveSubscription(input: {
  email: string;
  plan_name: PlanName;
  target_price: number;
}): Promise<"redirected" | "updated"> {
  const res = await fetch(`${API_URL}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to save subscription (${res.status})`);
  if ((res.headers.get("content-type") ?? "").includes("text/html")) {
    const html = await res.text();
    document.open();
    document.write(html); // inline script auto-POSTs the form to the ECPay cashier
    document.close();
    return "redirected";
  }
  return "updated";
}

export async function cancelSubscription(input: { email: string; plan_name: PlanName }): Promise<void> {
  const res = await fetch(`${API_URL}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to cancel subscription (${res.status})`);
}

export interface Fare {
  route: string;
  month: string;
  price_twd: number;
  price_usd: number | null;
  airline: string | null;
  checked_at: string;
}

export async function listFares(): Promise<Fare[]> {
  const res = await fetch(`${API_URL}/fares`);
  if (!res.ok) throw new Error(`Failed to load fares (${res.status})`);
  const data = (await res.json()) as { fares: Fare[] };
  return data.fares;
}
