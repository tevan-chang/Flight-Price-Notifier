import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plane } from "lucide-react";
import { PlanCard } from "@/components/PlanCard";
import { listFares, listSubscriptions } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useDocumentMeta } from "@/lib/use-document-meta";

const meta = {
  title: "Dashboard / 控制台 — Flight Price Notifier",
  description: "Your flight price alerts dashboard.",
  ogTitle: "Dashboard — Flight Price Notifier",
  ogDescription: "Your flight price alerts dashboard.",
};

export default function AppPage() {
  useDocumentMeta(meta);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const purchase = params.get("purchase"); // set by the ECPay OrderResultURL redirect (UX only)
  // undefined = still checking, null = signed out, string = signed-in email
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setEmail(data.user ? (data.user.email ?? "") : null);
    });
    return () => {
      active = false;
    };
  }, []);

  const subs = useQuery({
    queryKey: ["subscriptions", email],
    queryFn: () => listSubscriptions(email as string),
    enabled: typeof email === "string" && email.length > 0,
    // right after paying, the server-to-server ReturnURL callback may land a moment later
    refetchInterval: purchase === "success" ? 4000 : false,
  });
  const fares = useQuery({ queryKey: ["fares"], queryFn: listFares, refetchInterval: 5 * 60 * 1000 });
  const fareByRoute = new Map((fares.data ?? []).map((f) => [f.route, f]));
  const byPlan = new Map((subs.data ?? []).map((s) => [s.plan_name, s]));

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/");
  }
  if (email === undefined) return null;
  if (email === null) return <Navigate to="/sign-in" replace />;

  return (
    <div className="min-h-screen font-sans text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-semibold">
          <Plane className="h-5 w-5 text-primary" /> Flight Price Notifier
        </span>
        <button onClick={signOut}
          className="rounded-full border border-border px-5 py-2 text-sm hover:border-primary">
          Sign out / 登出
        </button>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-3xl font-bold">Welcome / 歡迎</h1>
        <p className="mt-2 text-muted-foreground">{email}</p>
        <h2 className="mt-10 text-xl font-semibold">選擇航線 / Pick a route</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          設定目標價，機票降到目標價以下時我們會寄 email 通知你。
        </p>
        {purchase === "success" && (
          <p role="status" className="mt-4 rounded-lg bg-primary/15 px-4 py-3 text-sm text-primary">
            付款完成，訂閱啟用中… / Payment received — activating your subscription.
          </p>
        )}
        {purchase === "failed" && (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            付款未完成，請在下方重新付款。 / Payment was not completed — please try again below.
          </p>
        )}
        {subs.isError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            無法載入訂閱資料。 / Could not load your subscriptions.
          </p>
        )}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PlanCard email={email} plan="tokyo" title="台北 ✈ 東京" fare={fareByRoute.get("TPE-TYO")}
            subscription={byPlan.get("tokyo")} />
          <PlanCard email={email} plan="seoul" title="台北 ✈ 首爾" fare={fareByRoute.get("TPE-SEL")}
            subscription={byPlan.get("seoul")} />
          <PlanCard email={email} plan="london" title="台北 ✈ 倫敦" fare={fareByRoute.get("TPE-LON")}
            subscription={byPlan.get("london")} />
        </div>
      </main>
    </div>
  );
}
