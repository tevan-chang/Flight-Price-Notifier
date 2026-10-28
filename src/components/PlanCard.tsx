import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { cancelSubscription, saveSubscription, type Fare, type PlanName, type Subscription } from "@/lib/api";

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
  const status = subscription?.subscription_status;
  // Only paid (active) or cancelled-in-grace rows are live; pending_payment / expired must (re)pay.
  const live = status === "active" || status === "cancelled";
  const needsPayment = !subscription || status === "pending_payment" || status === "expired";
  const showForm = needsPayment || editing;

  const mutation = useMutation({
    mutationFn: (target_price: number) => saveSubscription({ email, plan_name: plan, target_price }),
    onSuccess: async (result) => {
      if (result === "redirected") return; // the page is now the ECPay cashier
      await queryClient.invalidateQueries({ queryKey: ["subscriptions", email] });
      setEditing(false);
    },
  });

  const cancel = useMutation({
    mutationFn: () => cancelSubscription({ email, plan_name: plan }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions", email] }),
  });

  const parsed = Number(price);
  const valid = Number.isFinite(parsed) && parsed > 0;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        {status === "active" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            <Check className="h-3 w-3" /> 已訂閱 (有效)
          </span>
        )}
        {status === "pending_payment" && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">未完成付款</span>
        )}
        {status === "cancelled" && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            已取消 · 有效至 {subscription?.current_period_end_date ?? "—"}
          </span>
        )}
        {status === "expired" && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">已結束</span>
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

      {subscription && !editing && (
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
            {mutation.isPending
              ? "處理中…"
              : status === "pending_payment"
                ? "完成付款 / Pay NT$300/月"
                : status === "expired"
                  ? "重新訂閱 / Resubscribe"
                  : live
                    ? "更新目標價"
                    : "訂閱 NT$300/月 / Subscribe"}
          </button>
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              儲存失敗，請稍後再試。 / Could not save, please try again.
            </p>
          )}
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setEditing(true)}
            className="rounded-full border border-border px-5 py-2 text-sm hover:border-primary"
          >
            更新目標價
          </button>
          {status === "active" && (
            <button
              disabled={cancel.isPending}
              onClick={() => {
                if (window.confirm("確定取消訂閱？目前週期結束前仍會收到通知，之後不再扣款。")) cancel.mutate();
              }}
              className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground hover:border-destructive disabled:opacity-50"
            >
              {cancel.isPending ? "取消中…" : "取消訂閱"}
            </button>
          )}
          {cancel.isError && (
            <p role="alert" className="w-full text-sm text-destructive">
              取消失敗，請稍後再試。 / Could not cancel, please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
