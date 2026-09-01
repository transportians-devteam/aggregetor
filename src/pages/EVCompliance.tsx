import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { getComplianceFindings } from "@/services/complianceService";

export default function EVCompliance() {
  const findings = useQuery({
    queryKey: ["complianceFindings"],
    queryFn: getComplianceFindings,
  });
  const open = findings.data ?? [];
  const pages = useClientPagination(findings.data ?? []);
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Compliance monitoring
        </h1>
        <p className="text-sm text-muted-foreground">
          System checks for registration, PUCC, insurance, challans, fleet size,
          deposits and EV targets
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="glass border rounded-xl p-5">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <p className="text-3xl font-bold mt-2">
            {findings.data?.length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Total findings</p>
        </div>
        <div className="glass border rounded-xl p-5">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <p className="text-3xl font-bold mt-2">{open.length}</p>
			<p className="text-xs text-muted-foreground">Requires attention</p>
        </div>
        <div className="glass border rounded-xl p-5">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-3xl font-bold mt-2">
            {findings.data?.filter((f) => f.action === "SHOW_CAUSE_REVIEW").length ?? 0}
          </p>
			<p className="text-xs text-muted-foreground">Pending enforcement review</p>
        </div>
      </div>
      <div className="space-y-3">
        {pages.pageItems.map((finding) => (
          <article
            key={finding.id}
            className="glass border rounded-xl p-4 flex gap-4"
          >
            <AlertTriangle
              className={`w-5 h-5 shrink-0 ${finding.severity === "CRITICAL" ? "text-destructive" : "text-amber-600"}`}
            />
            <div className="flex-1">
              <div className="flex justify-between gap-3">
                <h2 className="font-semibold">
				  {finding.code.replaceAll("_", " ")}
                </h2>
				<span className="text-xs font-bold">
				  {finding.action.replaceAll("_", " ")}
				</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
				{finding.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
				{finding.subjectLabel} · {finding.operatorName} ·{" "}
                {new Date(finding.detectedAt).toLocaleString()}
              </p>
            </div>
          </article>
        ))}
        {!findings.isLoading && !findings.data?.length && (
          <div className="glass border rounded-xl p-10 text-center text-muted-foreground">
            No compliance findings.
          </div>
        )}
      </div>
      <ListPagination page={pages.page} pageSize={pages.pageSize} totalItems={pages.totalItems} onPageChange={pages.setPage} />
    </DashboardLayout>
  );
}
