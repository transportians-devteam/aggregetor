import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Car,
  FileCheck,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  listApplicationsForReview,
  listAppellateApplications,
} from "@/services/registrationService";
import { getComplianceFindings } from "@/services/complianceService";
import { listEnforcementCases } from "@/services/enforcementService";
import { getGovernmentMis } from "@/services/reportingService";

const dates = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
};

export default function Admin() {
  const { auth } = useAuth();
  const role = auth.role;
  const range = dates();
  const apps = useQuery({
    queryKey: ["authority-applications", role],
    queryFn:
      role === "appellate_officer"
        ? listAppellateApplications
        : () => listApplicationsForReview(),
    enabled:
      role === "officer" || role === "appellate_officer" || role === "admin",
  });
  const findings = useQuery({
    queryKey: ["compliance-findings"],
    queryFn: getComplianceFindings,
    enabled: role !== "appellate_officer",
  });
  const cases = useQuery({
    queryKey: ["enforcement-cases"],
    queryFn: listEnforcementCases,
    enabled: role !== "officer",
  });
  const mis = useQuery({
    queryKey: ["government-mis", range],
    queryFn: () => getGovernmentMis(range.from, range.to),
    enabled: role !== "appellate_officer",
  });
  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold">Authority dashboard</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Live regulatory workload for {role?.replaceAll("_", " ")}.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Applications"
          value={(apps.data?.length ?? 0).toString()}
          icon={<FileCheck className="h-5 w-5" />}
          trend="Current review queue"
        />
        <StatCard
          label="Open findings"
          value={(
			findings.data?.filter((x) => x.action !== "AUTO_OFFBOARDED").length ?? 0
          ).toString()}
          icon={<ShieldCheck className="h-5 w-5" />}
          trend="Compliance monitoring"
        />
        <StatCard
          label="Enforcement cases"
          value={(cases.data?.length ?? 0).toString()}
          icon={<Scale className="h-5 w-5" />}
          trend="Visible to your role"
        />
        <StatCard
          label="Active vehicles"
          value={(mis.data?.activeVehicles ?? 0).toString()}
          icon={<Car className="h-5 w-5" />}
          trend="Last 30 days MIS"
        />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Application review",
            "/admin/applications",
            "Review documents, decisions, appeals and licence issue",
            role !== "enforcement",
          ],
          [
            "Compliance monitor",
            "/admin/compliance",
            "Inspect findings and run policy checks",
            role !== "appellate_officer",
          ],
          [
            "Enforcement",
            "/admin/enforcement",
            "Penalties, suspensions, cancellation and appeals",
            role !== "officer",
          ],
          [
            "Government MIS",
            "/admin/mis",
            "Fleet and trip reporting metrics",
            role !== "appellate_officer",
          ],
        ]
          .filter((x) => x[3])
          .map(([title, path, detail]) => (
            <Link
              key={String(path)}
              to={String(path)}
              className="rounded-xl border bg-card p-5 hover:border-primary/40"
            >
              <AlertTriangle className="mb-3 h-5 w-5 text-primary" />
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            </Link>
          ))}
      </div>
    </DashboardLayout>
  );
}
