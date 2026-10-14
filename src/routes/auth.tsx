import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Plane } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in / 登入 — Flight Price Notifier" },
      { name: "description", content: "Sign in or create an account to track flight prices." },
      { property: "og:title", content: "Sign in — Flight Price Notifier" },
      { property: "og:description", content: "Sign in or create an account to track flight prices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { data, error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin + "/app" },
          });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (data.session) navigate({ to: "/app" });
    else setMsg("Check your email to confirm your account. / 請至信箱確認帳號。");
  }

  const input =
    "w-full rounded-lg border border-border bg-card px-4 py-2.5 text-foreground outline-none focus:border-primary";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card/60 p-8 shadow-glow">
        <Link to="/" className="mb-6 flex items-center gap-2 font-semibold">
          <Plane className="h-5 w-5 text-primary" /> Flight Price Notifier
        </Link>
        <h1 className="mb-6 text-2xl font-bold">
          {mode === "signin" ? "Sign in / 登入" : "Sign up / 註冊"}
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input className={input} type="email" required placeholder="user@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} type="password" required minLength={6} placeholder="Password / 密碼"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={busy}
            className="w-full rounded-full bg-gradient-primary py-2.5 font-medium text-primary-foreground disabled:opacity-60">
            {busy ? "…" : mode === "signin" ? "Sign in / 登入" : "Create account / 建立帳號"}
          </button>
        </form>
        {msg && <p className="mt-4 text-sm text-muted-foreground">{msg}</p>}
        <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMsg(null); }}
          className="mt-6 text-sm text-primary hover:underline">
          {mode === "signin" ? "No account? Sign up / 註冊" : "Have an account? Sign in / 登入"}
        </button>
      </div>
    </div>
  );
}
