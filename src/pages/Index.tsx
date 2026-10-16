import { Link } from "react-router-dom";
import { Plane, BellRing, CalendarX } from "lucide-react";
import { useDocumentMeta } from "@/lib/use-document-meta";

const features = [
  { icon: Plane, title: "盯緊熱門航線 (Always-on route watching)", body: "持續監控台北出發的熱門航線（東京、首爾），自動抓最低票價。" },
  { icon: BellRing, title: "達標自動通知 (Target-price email alerts)", body: "低於你設定的目標價，就寄 email 提醒你，附上立即訂購連結。" },
  { icon: CalendarX, title: "隨時取消 (Cancel anytime)", body: "月訂閱制，不想用隨時停，沒有綁約。" },
];

const meta = {
  title: "Flight Price Notifier｜機票降價通知",
  description: "設定航線與目標價，機票降價就通知你。Set a route and a target price — we email you when the fare drops.",
  ogTitle: "Flight Price Notifier｜機票降價通知",
  ogDescription: "Set a route and a target price — we email you when the fare drops.",
};

export default function Index() {
  useDocumentMeta(meta);
  return (
    <div className="min-h-screen font-sans text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-semibold">
          <Plane className="h-5 w-5 text-primary" /> Flight Price Notifier
        </span>
        <Link
          to="/sign-in"
          className="rounded-full bg-gradient-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-105"
        >
          Sign in / 登入
        </Link>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
          <div className="relative mx-auto max-w-4xl px-6 py-28 text-center md:py-40">
            <h1 className="animate-fade-up text-5xl font-extrabold tracking-tight md:text-7xl">
              <span className="text-gradient">Flight Price</span> Notifier
            </h1>
            <p className="animate-fade-up mt-6 text-xl font-medium md:text-2xl [animation-delay:120ms]">
              設定航線與目標價，機票降價就通知你
            </p>
            <p className="animate-fade-up mt-3 text-muted-foreground [animation-delay:240ms]">
              Set a route and a target price — we email you when the fare drops.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-28 md:grid-cols-3">
          {features.map((f, i) => (
            <article
              key={f.title}
              className="animate-fade-up rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/50"
              style={{ animationDelay: `${300 + i * 120}ms` }}
            >
              <div className="mb-5 inline-flex rounded-xl bg-accent p-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">{f.title}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Flight Price Notifier
      </footer>
    </div>
  );
}
