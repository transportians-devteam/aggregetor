import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CreditCard, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  appealEnforcement,
  listEnforcementCases,
  submitComplianceResponse,
  submitRestorationReport,
} from "@/services/enforcementService";
import { payPenalty } from "@/services/walletService";
import { getErrorMessage } from "@/services/api";

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    value,
  );

export default function Penalties() {
  const client = useQueryClient();
  const [text, setText] = useState<Record<string, string>>({});
  const [undertakings, setUndertakings] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const cases = useQuery({
    queryKey: ["enforcementCases"],
    queryFn: listEnforcementCases,
  });
  const pages = useClientPagination(cases.data ?? []);
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["enforcementCases"] });
    client.invalidateQueries({ queryKey: ["wallet"] });
    client.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const pay = useMutation({
    mutationFn: payPenalty,
    onSuccess: () => {
      refresh();
      toast.success("Penalty paid");
    },
    onError: (e) => setError(getErrorMessage(e)),
  });
  const respond = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      submitComplianceResponse(id, reason),
    onSuccess: refresh,
    onError: (e) => setError(getErrorMessage(e)),
  });
  const appeal = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      appealEnforcement(id, reason),
    onSuccess: refresh,
    onError: (e) => setError(getErrorMessage(e)),
  });
  const restore = useMutation({
    mutationFn: ({ id, report, undertaking }: { id: string; report: string; undertaking: string }) =>
      submitRestorationReport(id, report, undertaking),
    onSuccess: refresh,
    onError: (e) => setError(getErrorMessage(e)),
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Penalties and enforcement
        </h1>
        <p className="text-sm text-muted-foreground">
          Pay monetary penalties, respond to notices and lodge permitted appeals
        </p>
      </div>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <div className="space-y-4">
        {pages.pageItems.map((item) => (
          <article key={item.id} className="glass border rounded-xl p-5">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="flex-1">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">
                      {item.caseNumber} · {item.violationCode}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-muted h-fit">
                    {item.status.replaceAll("_", " ")}
                  </span>
                </div>
                {item.penalty && (
                  <div className="mt-4 rounded-lg border p-4">
                    <div className="flex justify-between">
                      <strong>{item.penalty.type.replaceAll("_", " ")}</strong>
                      <span>
                        {item.penalty.amount
                          ? money(item.penalty.amount)
                          : item.penalty.instruction}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due {item.penalty.dueDate} · {item.penalty.status}
                    </p>
                    {item.penalty.type === "MONETARY" &&
                      item.penalty.status === "ISSUED" && (
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={() => pay.mutate(item.penalty!.id)}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay from wallet
                        </Button>
                      )}
                    {item.penalty.type === "NON_MONETARY" &&
                      item.penalty.status === "ISSUED" && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium">Show-cause hearing reply</p>
                          <div className="flex gap-2">
                          <Input
                            placeholder="Explain the violation and corrective action taken"
                            value={text[item.id] ?? ""}
                            onChange={(e) =>
                              setText((current) => ({
                                ...current,
                                [item.id]: e.target.value,
                              }))
                            }
                          />
                          <Button
                            onClick={() =>
                              respond.mutate({
                                id: item.id,
                                reason: text[item.id],
                              })
                            }
                            disabled={!text[item.id]}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          </div>
                        </div>
                      )}
                  </div>
                )}
                {item.status === "SUSPENDED" && (
                  <div className="mt-4 space-y-3 rounded-lg border p-4">
                    <div>
                      <strong>Request restoration of operations</strong>
                      <p className="text-xs text-muted-foreground">
                        Submit the compliance report and Form 4 undertaking for Authority review.
                      </p>
                    </div>
                    <Input
                      placeholder="Compliance report and corrective measures"
                      value={text[item.id] ?? ""}
                      onChange={(e) => setText((current) => ({ ...current, [item.id]: e.target.value }))}
                    />
                    <Input
                      placeholder="Form 4 undertaking reference/details"
                      value={undertakings[item.id] ?? ""}
                      onChange={(e) => setUndertakings((current) => ({ ...current, [item.id]: e.target.value }))}
                    />
                    <Button
                      onClick={() => restore.mutate({
                        id: item.id,
                        report: text[item.id],
                        undertaking: undertakings[item.id],
                      })}
                      disabled={!text[item.id] || !undertakings[item.id] || restore.isPending}
                    >
                      Submit for restoration review
                    </Button>
                  </div>
                )}
                {["SUSPENDED", "CANCELLED"].includes(item.status) &&
                  !item.appeal && (
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Appeal grounds"
                        value={text[item.id] ?? ""}
                        onChange={(e) =>
                          setText((current) => ({
                            ...current,
                            [item.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          appeal.mutate({ id: item.id, reason: text[item.id] })
                        }
                        disabled={!text[item.id]}
                      >
                        Submit appeal
                      </Button>
                    </div>
                  )}
                {item.appeal && (
                  <p className="mt-3 text-sm">
                    Appeal: <strong>{item.appeal.status}</strong>
                    {item.appeal.decisionReason &&
                      ` · ${item.appeal.decisionReason}`}
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
        {(pay.isPending || respond.isPending || appeal.isPending || restore.isPending) && (
          <Loader2 className="animate-spin" />
        )}
        {!cases.isLoading && !cases.data?.length && (
          <div className="glass border rounded-xl p-10 text-center text-muted-foreground">
            No enforcement cases.
          </div>
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
