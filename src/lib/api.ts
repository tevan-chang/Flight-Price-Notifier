// Flight API (API Gateway HTTP API → Lambda → DynamoDB). Public endpoint; the browser holds no AWS credentials.
export const API_URL: string = (
  (import.meta.env["VITE_API_URL"] as string | undefined) ??"https://1u6hrfhj4h.execute-api.us-east-1.amazonaws.com"
).replace(/\/$/, "");

export type PlanName = "tokyo" | "seoul";

export interface Subscription {
  email: string;
  route: string;
  plan_name: PlanName;
  target_price: number;
  currency: string;
  updated_at?: string;
}

export async function listSubscriptions(email: string): Promise<Subscription[]> {
  const res = await fetch(`${API_URL}/subscriptions?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(`Failed to load subscriptions (${res.status})`);
  const data = (await res.json()) as { subscriptions: Subscription[] };
  return data.subscriptions;
}

export async function saveSubscription(input: {
  email: string;
  plan_name: PlanName;
  target_price: number;
}): Promise<void> {
  const res = await fetch(`${API_URL}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to save subscription (${res.status})`);
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
