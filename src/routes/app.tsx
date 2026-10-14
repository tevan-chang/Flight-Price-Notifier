import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { email: data.user.email ?? "" };
  },
  head: () => ({
    meta: [
      { title: "Dashboard / 控制台 — Flight Price Notifier" },
      { name: "description", content: "Your flight price alerts dashboard." },
      { property: "og:title", content: "Dashboard — Flight Price Notifier" },
      { property: "og:description", content: "Your flight price alerts dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const { email } = Route.useRouteContext();
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
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
        <div className="mt-10 rounded-2xl border border-border bg-card/60 p-8 text-muted-foreground">
          No price alerts yet. / 尚無價格提醒。
                </div>
      </main>
    </div>
  );
}
