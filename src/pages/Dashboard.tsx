import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Plane } from "lucide-react";
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
        <div className="mt-10 rounded-2xl border border-border bg-card/60 p-8 text-muted-foreground">
          No price alerts yet. / 尚無價格提醒。
                </div>
      </main>
    </div>
  );
}
