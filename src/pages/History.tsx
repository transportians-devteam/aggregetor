import { useQuery } from "@tanstack/react-query";
import { Bell, CreditCard } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getWalletEntries } from "@/services/walletService";
import { listNotifications } from "@/services/notificationService";
import { getErrorMessage } from "@/services/api";

export default function History() {
  const wallet = useQuery({
    queryKey: ["wallet-entries"],
    queryFn: getWalletEntries,
  });
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
  });
  const activity = [
    ...(wallet.data ?? []).map((x) => ({
      id: `wallet-${x.id}`,
      at: x.createdAt,
      title: `${x.type.replaceAll("_", " ")} · ${x.direction}`,
      detail: `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(x.amount)} · ${x.referenceType} ${x.referenceId}`,
      icon: CreditCard,
    })),
    ...(notifications.data ?? []).map((x) => ({
      id: `notification-${x.id}`,
      at: x.createdAt,
      title: x.title,
      detail: x.message,
      icon: Bell,
    })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold">Activity</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Portal notifications and wallet ledger events from the backend.
      </p>
      {(wallet.isError || notifications.isError) && (
        <p className="mb-4 text-destructive">
          {getErrorMessage(wallet.error || notifications.error)}
        </p>
      )}
      <div className="divide-y rounded-xl border bg-card">
        {activity.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-4">
            <span className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
              <item.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="break-words text-sm font-semibold">
                {item.title}
              </h2>
              <p className="break-words text-sm text-muted-foreground">
                {item.detail}
              </p>
              <time className="mt-1 block text-xs text-muted-foreground sm:hidden">
                {new Date(item.at).toLocaleString()}
              </time>
            </div>
            <time className="hidden shrink-0 text-xs text-muted-foreground sm:block">
              {new Date(item.at).toLocaleString()}
            </time>
          </div>
        ))}
        {activity.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            No activity yet.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
