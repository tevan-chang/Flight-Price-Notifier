import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { saveSubscription, type Fare, type PlanName, type Subscription } from "@/lib/api";

interface PlanCardProps {
  email: string;
  plan: PlanName;
  title: string;
  fare?: Fare | undefined; // latest cheapest fare found by the scheduled checker
  subscription?: Subscription | undefined;
}

export function PlanCard({ email, plan, title, fare, subscription }: PlanCardProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState<string>(String(subscription?.target_price ?? ""));
  const subscribed = Boolean(subscription);
  const showForm = !subscribed || editing;

  const mutation = useMutation({
    mutationFn: (target_price: number) => saveSubscription({ email, plan_name: plan, target_price }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subscriptions", email] });
      setEditing(false);
    },
  });

  const parsed = Number(price);
  const valid = Number.isFinite(parsed) && parsed > 0;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        {subscribed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            <Check className="h-3 w-3" /> 已訂閱
          </span>
        )}
      </div>
      {fare ? (
        <p className="mt-1 text-sm text-muted-foreground">
          目前最低 / Cheapest now: <b className="text-foreground">NT${fare.price_twd.toLocaleString()}</b>
          {fare.price_usd !== null && <> (約 US${fare.price_usd.toLocaleString()})</>}
          <span className="block text-xs">
            {fare.month} 出發 · 更新於 {new Date(fare.checked_at).toLocaleString("zh-TW")}
          </span>
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">票價資料更新中… / Fare data pending…</p>
      )}

      {subscribed && !editing && (
        <p className="mt-4 text-sm">
          目標價 / Target: <b>NT${subscription!.target_price.toLocaleString()}</b>
        </p>
      )}

      {showForm ? (
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) mutation.mutate(parsed);
          }}
        >
          <label className="text-sm text-muted-foreground" htmlFor={`target-${plan}`}>
            目標價 (TWD) / Target price
          </label>
          <input
            id={`target-${plan}`}
            type="number"
            min={1}
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={fare ? String(Math.round(fare.price_twd * 1.1)) : ""}
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
          <button
            type="submit"
            disabled={!valid || mutation.isPending}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {mutation.isPending ? "儲存中…" : subscribed ? "更新目標價" : "開始追蹤"}
          </button>
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              儲存失敗，請稍後再試。 / Could not save, please try again.
            </p>
          )}
        </form>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="mt-4 rounded-full border border-border px-5 py-2 text-sm hover:border-primary"
        >
          更新目標價
        </button>
      )}
    </div>
  );
}
