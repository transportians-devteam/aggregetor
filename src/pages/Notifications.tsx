import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notificationService";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";

export default function Notifications() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
  });
  const read = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["notifications"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  const readAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (updated) => {
      void client.invalidateQueries({ queryKey: ["notifications"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(updated > 0 ? `${updated} notifications marked as read` : "All notifications are already read");
    },
  });
  const normalizedSearch = search.trim().toLowerCase();
  const filteredNotifications = useMemo(
    () =>
      (query.data ?? []).filter((notification) =>
        !normalizedSearch ||
        [notification.title, notification.message, notification.type, notification.channel]
          .some((value) => value.toLowerCase().includes(normalizedSearch)),
      ),
    [normalizedSearch, query.data],
  );
  const unreadCount = (query.data ?? []).filter((notification) => !notification.readAt).length;
  const pages = useClientPagination(filteredNotifications);
  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold">Notifications &amp; actions</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Regulatory alerts and workflow updates from the portal.
      </p>
      <div className="mb-5 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              pages.reset();
            }}
            placeholder="Search title, message, type or channel"
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => readAll.mutate()}
          disabled={unreadCount === 0 || readAll.isPending}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          {readAll.isPending ? "Marking…" : `Mark all as read${unreadCount ? ` (${unreadCount})` : ""}`}
        </Button>
      </div>
      {query.isError && (
        <p className="rounded-lg border border-destructive/30 p-4 text-destructive">
          {getErrorMessage(query.error)}
        </p>
      )}
      <div className="space-y-3">
        {pages.pageItems.map((item) => (
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
        {filteredNotifications.length === 0 && (
          <p className="rounded-xl border p-8 text-center text-muted-foreground">
            {normalizedSearch ? "No notifications match your search." : "No notifications yet."}
          </p>
        )}
      </div>
      {pages.totalItems > pages.pageSize && (
        <div className="mt-4 overflow-hidden rounded-xl border">
          <ListPagination page={pages.page} pageSize={pages.pageSize} totalItems={pages.totalItems} onPageChange={pages.setPage} />
        </div>
      )}
    </DashboardLayout>
  );
}
