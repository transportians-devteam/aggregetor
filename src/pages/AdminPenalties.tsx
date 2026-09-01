import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useAuth } from "@/contexts/AuthContext";
import {
  enforcementStatusMessage,
  getAuthorityEnforcementActions,
} from "@/lib/enforcementWorkflow";
import {
  cancelLicense,
  decideEnforcementAppeal,
  extendSuspension,
  issuePenalty,
  issueShowCause,
  listEnforcementCases,
  openCase,
  reviewComplianceResponse,
  reviewRestorationReport,
  startEnforcementAppeal,
  suspendLicense,
  type EnforcementCase,
} from "@/services/enforcementService";
import { getErrorMessage } from "@/services/api";

const today = new Date().toISOString().slice(0, 10);

export default function AdminPenalties() {
  const { auth } = useAuth();
  const client = useQueryClient();
  const canEnforce = auth.role === "enforcement" || auth.role === "admin";
  const appellateOnly = auth.role === "appellate_officer";
  const cases = useQuery({
    queryKey: ["enforcement-cases"],
    queryFn: listEnforcementCases,
  });
  const pages = useClientPagination(cases.data ?? []);
  const [ownerUserId, setOwnerUserId] = useState("");
  const [violationCode, setViolationCode] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<EnforcementCase | null>(null);
  const [reason, setReason] = useState("");
  const [penaltyType, setPenaltyType] = useState<"MONETARY" | "NON_MONETARY">(
    "MONETARY",
  );
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("10");
  const [dueDate, setDueDate] = useState("");
  const selectedActions = useMemo(
    () =>
      selected
        ? getAuthorityEnforcementActions(selected, auth.role, auth.user?.id)
        : null,
    [auth.role, auth.user?.id, selected],
  );

  const close = () => {
    setSelected(null);
    setReason("");
    setAmount("");
    setDays("10");
    setDueDate("");
  };
  const refresh = () => {
    close();
    void client.invalidateQueries({ queryKey: ["enforcement-cases"] });
  };
  const create = useMutation({
    mutationFn: () =>
      openCase({
        ownerUserId: Number(ownerUserId),
        source: "PORTAL",
        violationCode,
        description,
      }),
    onSuccess: () => {
      setOwnerUserId("");
      setViolationCode("");
      setDescription("");
      refresh();
    },
  });
  const act = useMutation({
    mutationFn: async (name: string) => {
      if (!selected) throw new Error("Select a case.");
      if (name === "penalty")
        return issuePenalty(
          selected.id,
          penaltyType === "MONETARY"
            ? { type: penaltyType, amount: Number(amount), dueDate }
            : { type: penaltyType, instruction: reason, dueDate },
        );
      if (name === "show-cause") return issueShowCause(selected.id, reason);
      if (name === "suspend")
        return suspendLicense(selected.id, Number(days), reason);
      if (name === "extend") return extendSuspension(selected.id, Number(days));
      if (name === "cancel") return cancelLicense(selected.id, reason);
      if (name === "satisfactory")
        return reviewComplianceResponse(selected.id, true, reason, Number(days));
      if (name === "unsatisfactory")
        return reviewComplianceResponse(selected.id, false, reason, Number(days));
      if (name === "restoration-pass")
        return reviewRestorationReport(selected.id, true, reason, Number(days));
      if (name === "restoration-fail")
        return reviewRestorationReport(selected.id, false, reason, Number(days));
      if (name === "appeal-start") return startEnforcementAppeal(selected.id);
      return decideEnforcementAppeal(
        selected.id,
        name === "appeal-allow",
        reason,
      );
    },
    onSuccess: refresh,
  });
  const submitCase = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };
  const actionError = act.isError ? getErrorMessage(act.error) : "";

  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold">
        {appellateOnly
          ? "Enforcement appeals"
          : "Penalties and regulatory actions"}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {appellateOnly
          ? "Review assigned appeals against enforcement decisions."
          : "Open violations, issue penalties and manage licence actions."}
      </p>

      {canEnforce && (
        <form
          onSubmit={submitCase}
          className="mb-6 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4"
        >
          <input
            type="number"
            min="1"
            required
            value={ownerUserId}
            onChange={(event) => setOwnerUserId(event.target.value)}
            placeholder="Operator user ID"
            className="rounded-lg border bg-background p-2 text-sm"
          />
          <input
            required
            value={violationCode}
            onChange={(event) => setViolationCode(event.target.value)}
            placeholder="Violation code"
            className="rounded-lg border bg-background p-2 text-sm"
          />
          <input
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Violation description"
            className="rounded-lg border bg-background p-2 text-sm"
          />
          <button
            disabled={create.isPending}
            className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {create.isPending ? "Opening…" : "Open case"}
          </button>
        </form>
      )}

      {(cases.isError || create.isError) && (
        <p className="mb-4 text-destructive">
          {getErrorMessage(cases.error || create.error)}
        </p>
      )}
      <div className="space-y-3">
        {pages.pageItems.map((item) => {
          const available = getAuthorityEnforcementActions(
            item,
            auth.role,
            auth.user?.id,
          );
          return (
            <article key={item.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    {item.caseNumber} · {item.violationCode}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Operator #{item.ownerUserId} · {item.description}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs">
                  {item.status.replaceAll("_", " ")}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <p>
                  <b>Penalty:</b>{" "}
                  {item.penalty
                    ? `${item.penalty.type}${item.penalty.amount ? ` ₹${item.penalty.amount}` : ""} · ${item.penalty.status}`
                    : "Not issued"}
                </p>
                <p>
                  <b>Actions:</b>{" "}
                  {item.actions
                    .map((action) => `${action.type} (${action.status})`)
                    .join(", ") || "None"}
                </p>
                <p>
                  <b>Appeal:</b> {item.appeal?.status ?? "None"}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelected(item);
                  setReason("");
                }}
                className="mt-3 rounded-lg border px-3 py-2 text-sm"
              >
                {available.hasActions ? "Manage case" : "View details"}
              </button>
            </article>
          );
        })}
        {cases.data?.length === 0 && (
          <p className="rounded-xl border p-8 text-center text-muted-foreground">
            No enforcement cases.
          </p>
        )}
      </div>
      <ListPagination page={pages.page} pageSize={pages.pageSize} totalItems={pages.totalItems} onPageChange={pages.setPage} />

      {selected && selectedActions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-xl bg-background p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{selected.caseNumber}</h2>
                <p className="text-sm text-muted-foreground">
                  {selected.violationCode} · {selected.description}
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs">
                {selected.status.replaceAll("_", " ")}
              </span>
            </div>

            {selected.penalty && (
              <div className="mt-4 rounded-lg border p-4 text-sm">
                <h3 className="font-semibold">Penalty evidence</h3>
                <p className="mt-2">
                  <b>Type:</b> {selected.penalty.type.replaceAll("_", " ")}
                </p>
                <p>
                  <b>Due date:</b> {selected.penalty.dueDate}
                </p>
                <p>
                  <b>Status:</b> {selected.penalty.status.replaceAll("_", " ")}
                </p>
                {selected.penalty.instruction && (
                  <p className="mt-2">
                    <b>Instruction:</b> {selected.penalty.instruction}
                  </p>
                )}
                {selected.penalty.complianceResponse && (
                  <div className="mt-3 rounded-md bg-muted p-3">
                    <b>Operator compliance response</b>
                    <p className="mt-1 whitespace-pre-wrap">
                      {selected.penalty.complianceResponse}
                    </p>
                  </div>
                )}
              </div>
            )}
            {selected.restorationSubmittedAt && (
              <div className="mt-4 rounded-lg border p-4 text-sm">
                <h3 className="font-semibold">Restoration evidence</h3>
                <p className="mt-2 whitespace-pre-wrap">
                  <b>Compliance report:</b> {selected.restorationReport}
                </p>
                <p className="mt-2 whitespace-pre-wrap">
                  <b>Form 4 undertaking:</b> {selected.form4Undertaking}
                </p>
              </div>
            )}
            {selected.appeal && (
              <div className="mt-4 rounded-lg border p-4 text-sm">
                <h3 className="font-semibold">Appeal evidence</h3>
                <p className="mt-2 whitespace-pre-wrap">
                  <b>Grounds:</b> {selected.appeal.grounds}
                </p>
                <p className="mt-2">
                  <b>Status:</b> {selected.appeal.status.replaceAll("_", " ")}
                </p>
                {selected.appeal.reviewerUserId && (
                  <p>
                    <b>Assigned reviewer:</b> #{selected.appeal.reviewerUserId}
                  </p>
                )}
                {selected.appeal.decisionReason && (
                  <p className="mt-2 whitespace-pre-wrap">
                    <b>Decision reason:</b> {selected.appeal.decisionReason}
                  </p>
                )}
              </div>
            )}

            {!selectedActions.hasActions && (
              <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                {enforcementStatusMessage(selected)}
              </p>
            )}

            {selectedActions.issueShowCause && (
              <div className="mt-4 space-y-3 rounded-lg border border-amber-300 bg-amber-50/50 p-4">
                <h3 className="font-semibold">Issue 15-day show-cause notice</h3>
                <p className="text-sm text-muted-foreground">
                  The operator will be notified and must submit a hearing reply within 15 days.
                </p>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="State the violation and corrective action required"
                  className="min-h-20 w-full rounded border bg-background p-3 text-sm"
                />
                <button
                  disabled={act.isPending || !reason.trim()}
                  onClick={() => act.mutate("show-cause")}
                  className="rounded bg-amber-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  Issue show-cause notice
                </button>
              </div>
            )}

            {selectedActions.issuePenalty && (
              <div className="mt-4 space-y-3 rounded-lg border p-4">
                <h3 className="font-semibold">Issue penalty</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <select
                    value={penaltyType}
                    onChange={(event) =>
                      setPenaltyType(
                        event.target.value as "MONETARY" | "NON_MONETARY",
                      )
                    }
                    className="rounded border bg-background p-2 text-sm"
                  >
                    <option value="MONETARY">Monetary</option>
                    <option value="NON_MONETARY">Non-monetary</option>
                  </select>
                  {penaltyType === "MONETARY" && (
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="Amount"
                      className="rounded border p-2 text-sm"
                    />
                  )}
                  <input
                    type="date"
                    min={today}
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="rounded border p-2 text-sm"
                  />
                </div>
                {penaltyType === "NON_MONETARY" && (
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Compliance instruction"
                    className="min-h-20 w-full rounded border bg-background p-3 text-sm"
                  />
                )}
                <button
                  disabled={
                    act.isPending ||
                    !dueDate ||
                    (penaltyType === "MONETARY"
                      ? !amount || Number(amount) <= 0
                      : !reason.trim())
                  }
                  onClick={() => act.mutate("penalty")}
                  className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
                >
                  Issue penalty
                </button>
              </div>
            )}

            {(selectedActions.reviewResponse ||
              selectedActions.reviewRestoration ||
              selectedActions.suspend ||
              selectedActions.extendSuspension ||
              selectedActions.cancelLicense ||
              selectedActions.decideAppeal) && (
              <div className="mt-4 space-y-3 rounded-lg border p-4">
                <h3 className="font-semibold">Authority action</h3>
                {!selectedActions.extendSuspension ||
                selectedActions.cancelLicense ||
                selectedActions.reviewResponse ||
                selectedActions.reviewRestoration ||
                selectedActions.decideAppeal ? (
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Record the reason for this decision"
                    className="min-h-20 w-full rounded border bg-background p-3 text-sm"
                  />
                ) : null}
                {(selectedActions.suspend ||
                  selectedActions.extendSuspension ||
                  selectedActions.reviewResponse ||
                  selectedActions.reviewRestoration) && (
                  <input
                    type="number"
                    min={selectedActions.reviewResponse || selectedActions.suspend ? 10 : 1}
                    max={180}
                    value={days}
                    onChange={(event) => setDays(event.target.value)}
                    className="w-full rounded border p-2 text-sm sm:w-48"
                  />
                )}
                <div className="flex flex-wrap gap-2">
                  {selectedActions.reviewResponse && (
                    <>
                      <button
                        disabled={act.isPending || !reason.trim()}
                        onClick={() => act.mutate("satisfactory")}
                        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                      >
                        Response satisfactory
                      </button>
                      <button
                        disabled={act.isPending || !reason.trim()}
                        onClick={() => act.mutate("unsatisfactory")}
                        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                      >
                        Response deficient
                      </button>
                    </>
                  )}
                  {selectedActions.reviewRestoration && (
                    <>
                      <button
                        disabled={act.isPending || !reason.trim()}
                        onClick={() => act.mutate("restoration-pass")}
                        className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
                      >
                        Approve and resume operations
                      </button>
                      <button
                        disabled={act.isPending || !reason.trim() || Number(days) < 1}
                        onClick={() => act.mutate("restoration-fail")}
                        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                      >
                        Reject and extend suspension
                      </button>
                    </>
                  )}
                  {selectedActions.suspend && (
                    <button
                      disabled={
                        act.isPending || !reason.trim() || Number(days) < 10
                      }
                      onClick={() => act.mutate("suspend")}
                      className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                    >
                      Suspend licence
                    </button>
                  )}
                  {selectedActions.extendSuspension && (
                    <button
                      disabled={act.isPending || Number(days) < 1}
                      onClick={() => act.mutate("extend")}
                      className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                    >
                      Extend suspension
                    </button>
                  )}
                  {selectedActions.cancelLicense && (
                    <button
                      disabled={act.isPending || !reason.trim()}
                      onClick={() => act.mutate("cancel")}
                      className="rounded bg-destructive px-3 py-2 text-sm text-destructive-foreground disabled:opacity-50"
                    >
                      Cancel licence
                    </button>
                  )}
                  {selectedActions.decideAppeal && (
                    <>
                      <button
                        disabled={act.isPending || !reason.trim()}
                        onClick={() => act.mutate("appeal-allow")}
                        className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
                      >
                        Allow appeal
                      </button>
                      <button
                        disabled={act.isPending || !reason.trim()}
                        onClick={() => act.mutate("appeal-dismiss")}
                        className="rounded bg-destructive px-3 py-2 text-sm text-destructive-foreground disabled:opacity-50"
                      >
                        Dismiss appeal
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            {selectedActions.startAppealReview && (
              <button
                disabled={act.isPending}
                onClick={() => act.mutate("appeal-start")}
                className="mt-4 rounded bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                Start appeal review
              </button>
            )}
            {actionError && (
              <p className="mt-3 text-sm text-destructive">{actionError}</p>
            )}
            <div className="mt-5 flex justify-end">
              <button
                onClick={close}
                className="rounded border px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
