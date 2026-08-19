import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/services/api";
import {
  createContent,
  deleteContent,
  listAllContent,
  updateContent,
  type ContentSection,
  type PortalContentItem,
  type PortalContentRequest,
} from "@/services/contentService";

const sections: ContentSection[] = [
  "METRIC",
  "SERVICE",
  "NOTICE",
  "MILESTONE",
  "BENEFIT",
  "FAQ",
  "CONTACT",
];
const blank = (): PortalContentRequest => ({
  section: "NOTICE",
  title: "",
  body: "",
  label: "",
  value: "",
  icon: "file",
  sortOrder: 0,
  active: true,
});

function ContentEditor({
  initial,
  onDone,
}: {
  initial?: PortalContentItem;
  onDone: () => void;
}) {
  const [form, setForm] = useState<PortalContentRequest>(blank());
  useEffect(() => {
    setForm(
      initial
        ? {
            section: initial.section,
            title: initial.title,
            body: initial.body,
            label: initial.label,
            value: initial.value,
            icon: initial.icon,
            sortOrder: initial.sortOrder,
            active: initial.active,
          }
        : blank(),
    );
  }, [initial]);
  const save = useMutation({
    mutationFn: () =>
      initial ? updateContent(initial.id, form) : createContent(form),
    onSuccess: () => {
      toast.success("Portal content saved");
      onDone();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-4 font-heading font-bold">
        {initial ? "Edit content item" : "New content item"}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        <select
          value={form.section}
          onChange={(event) =>
            setForm({ ...form, section: event.target.value as ContentSection })
          }
          className="h-10 rounded-md border bg-background px-3"
        >
          {sections.map((section) => (
            <option key={section}>{section}</option>
          ))}
        </select>
        <Input
          placeholder="Title"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <Input
          placeholder="Body or answer"
          value={form.body ?? ""}
          onChange={(event) => setForm({ ...form, body: event.target.value })}
        />
        <Input
          placeholder="Label (optional)"
          value={form.label ?? ""}
          onChange={(event) => setForm({ ...form, label: event.target.value })}
        />
        <Input
          placeholder="Value (optional)"
          value={form.value ?? ""}
          onChange={(event) => setForm({ ...form, value: event.target.value })}
        />
        <Input
          placeholder="Icon: car, leaf, shield..."
          value={form.icon ?? ""}
          onChange={(event) => setForm({ ...form, icon: event.target.value })}
        />
        <Input
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(event) =>
            setForm({ ...form, sortOrder: Number(event.target.value) })
          }
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setForm({ ...form, active: event.target.checked })
            }
          />
          Visible publicly
        </label>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button
          onClick={() => save.mutate()}
          disabled={!form.title.trim() || save.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}

export default function AdminContent() {
  const client = useQueryClient();
  const content = useQuery({
    queryKey: ["admin-content"],
    queryFn: listAllContent,
  });
  const [editing, setEditing] = useState<PortalContentItem | null | undefined>(
    undefined,
  );
  const remove = useMutation({
    mutationFn: deleteContent,
    onSuccess: () => {
      toast.success("Content removed");
      void client.invalidateQueries({ queryKey: ["admin-content"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const done = () => {
    setEditing(undefined);
    void client.invalidateQueries({ queryKey: ["admin-content"] });
    void client.invalidateQueries({ queryKey: ["public-content"] });
  };
  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Portal content</h1>
          <p className="text-sm text-muted-foreground">
            Manage landing-page metrics, notices, services, targets, FAQs and
            contact details.
          </p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus className="mr-2 h-4 w-4" />
          Add item
        </Button>
      </div>
      {editing !== undefined && (
        <div className="mb-6">
          <ContentEditor initial={editing ?? undefined} onDone={done} />
        </div>
      )}
      {content.isError && (
        <p className="text-destructive">{getErrorMessage(content.error)}</p>
      )}
      <div className="space-y-6">
        {sections.map((section) => {
          const rows =
            content.data?.filter((item) => item.section === section) ?? [];
          if (!rows.length) return null;
          return (
            <section key={section}>
              <h2 className="mb-2 text-sm font-bold tracking-wide text-muted-foreground">
                {section}
              </h2>
              <div className="overflow-hidden rounded-xl border bg-card">
                {rows.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 border-b p-4 last:border-0"
                  >
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setEditing(item)}
                    >
                      <b className="block truncate text-sm">{item.title}</b>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.value ?? item.body ?? item.label}
                      </p>
                    </button>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] ${item.active ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                    >
                      {item.active ? "Visible" : "Hidden"}
                    </span>
                    <button
                      aria-label={`Delete ${item.title}`}
                      onClick={() => remove.mutate(item.id)}
                      className="rounded p-1 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
