import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, ShieldAlert } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  getComplianceFindings,
  runCompliance,
} from "@/services/complianceService";
import { getErrorMessage } from "@/services/api";

export default function AdminEVMonitor() {
  const { auth } = useAuth();
  const client = useQueryClient();
  const findings = useQuery({
    queryKey: ["compliance-findings"],
    queryFn: getComplianceFindings,
  });
  const run = useMutation({
    mutationFn: runCompliance,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["compliance-findings"] }),
  });
  const mayRun = auth.role === "enforcement" || auth.role === "admin";
  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            Continuous compliance
          </h1>
          <p className="text-sm text-muted-foreground">
            PUCC, insurance, challan, electrification, fleet-size and deposit
            findings.
          </p>
        </div>
        {mayRun && (
          <button
            onClick={() => run.mutate()}
            disabled={run.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            <Play className="h-4 w-4" />
            {run.isPending ? "Running…" : "Run policy checks"}
          </button>
        )}
      </div>
      {run.data && (
        <p className="mb-4 rounded-lg border bg-card p-3 text-sm">
          Checked {run.data.subjectsChecked} subjects; created{" "}
          {run.data.findingsCreated} findings; system-offboarded{" "}
          {run.data.subjectsOffboarded}.
        </p>
      )}
      {(findings.isError || run.isError) && (
        <p className="mb-4 text-destructive">
          {getErrorMessage(findings.error || run.error)}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase">
            <tr>
              <th className="p-3">Subject</th>
              <th className="p-3">Rule</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Description</th>
              <th className="p-3">Status</th>
              <th className="p-3">Detected</th>
            </tr>
          </thead>
          <tbody>
            {findings.data?.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">
				  <b>{item.subjectLabel}</b>
				  <span className="block text-xs text-muted-foreground">
					{item.subjectType.replaceAll("_", " ")} · {item.operatorName}
				  </span>
				</td>
				<td className="p-3 font-medium">
				  {item.code.replaceAll("_", " ")}
				</td>
                <td className="p-3">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {item.severity}
                  </span>
                </td>
				<td className="max-w-md p-3">{item.message}</td>
				<td className="p-3">{item.action.replaceAll("_", " ")}</td>
                <td className="p-3 text-xs">
                  {new Date(item.detectedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {findings.data?.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            <ShieldAlert className="mx-auto mb-2 h-6 w-6" />
            No findings.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
