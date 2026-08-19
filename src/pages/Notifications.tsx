import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  listNotifications,
  markNotificationRead,
} from "@/services/notificationService";
import { getErrorMessage } from "@/services/api";

export default function Notifications() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
  });
  const read = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold">Notifications</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Regulatory alerts and workflow updates from the portal.
      </p>
      {query.isError && (
        <p className="rounded-lg border border-destructive/30 p-4 text-destructive">
          {getErrorMessage(query.error)}
        </p>
      )}
      <div className="space-y-3">
        {query.data?.map((item) => (
          <article
            key={item.id}
            className={`rounded-xl border p-4 ${item.readAt ? "bg-card" : "border-primary/30 bg-primary/5"}`}
          >
            <div className="flex items-start gap-3">
              <Bell className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                  <h2 className="break-words font-semibold">{item.title}</h2>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-1 break-words text-sm text-muted-foreground">
                  {item.message}
                </p>
                <p className="mt-2 text-xs uppercase text-muted-foreground">
                  {item.type} · {item.channel}
                </p>
              </div>
              {!item.readAt && (
                <button
                  onClick={() => read.mutate(item.id)}
                  className="shrink-0 rounded-md border p-2"
                  title="Mark read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          </article>
        ))}
        {query.data?.length === 0 && (
          <p className="rounded-xl border p-8 text-center text-muted-foreground">
            No notifications yet.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
