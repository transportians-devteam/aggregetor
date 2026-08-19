import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Bell, Car, Shield, Users, Wallet } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboard } from "@/services/dashboardService";
import { getErrorMessage } from "@/services/api";

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    value,
  );
const total = (values?: Record<string, number>) =>
  Object.values(values ?? {}).reduce((sum, value) => sum + value, 0);

export default function Dashboard() {
  const { auth } = useAuth();
  const dashboard = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });
  const data = dashboard.data;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome, {auth.user?.name}
        </p>
      </div>
      {dashboard.isError && (
        <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {getErrorMessage(dashboard.error, "Dashboard could not be loaded.")}
        </div>
      )}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Licence"
          value={
            data?.licenseStatus ?? data?.applicationStatus ?? "Not applied"
          }
          icon={<Shield className="w-5 h-5" />}
          trend={
            data?.licenseValidUntil
              ? `Valid until ${data.licenseValidUntil}`
              : (data?.licenseNumber ?? "Application required")
          }
        />
        <StatCard
          label="Vehicles"
          value={total(data?.vehicles).toString()}
          icon={<Car className="w-5 h-5" />}
          trend={`${data?.electricVehicles ?? 0} electric`}
        />
        <StatCard
          label="Drivers"
          value={total(data?.drivers).toString()}
          icon={<Users className="w-5 h-5" />}
          trend={`${data?.drivers?.ACTIVE ?? 0} active`}
        />
        <StatCard
          label="Wallet available"
          value={money(data?.walletAvailableBalance)}
          icon={<Wallet className="w-5 h-5" />}
          trend={`${money(data?.walletHeldBalance)} held`}
        />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <section className="glass rounded-xl border p-5">
          <p className="text-xs text-muted-foreground uppercase">
            Application status
          </p>
          <p className="text-xl font-bold mt-2">
            {data?.applicationStatus ?? "No application"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.licenseNumber ??
              "Complete registration to begin operations."}
          </p>
        </section>
        <section className="glass rounded-xl border p-5">
          <p className="flex gap-2 text-xs text-muted-foreground uppercase">
            <AlertTriangle className="w-4 h-4" /> Compliance alerts
          </p>
          <p className="text-3xl font-bold mt-2">
            {data?.criticalComplianceAlerts ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">
            Critical findings requiring attention
          </p>
        </section>
        <section className="glass rounded-xl border p-5">
          <p className="flex gap-2 text-xs text-muted-foreground uppercase">
            <Bell className="w-4 h-4" /> Notifications
          </p>
          <p className="text-3xl font-bold mt-2">
            {data?.unreadNotifications ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">
            Unread regulatory updates
          </p>
        </section>
      </div>
      <section className="glass rounded-xl border p-5 mt-5">
        <h2 className="font-semibold mb-4">Fleet state</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Vehicles
            </p>
            {Object.entries(data?.vehicles ?? {}).map(([status, count]) => (
              <div
                key={status}
                className="flex justify-between py-1.5 border-b"
              >
                <span className="text-sm">{status.replaceAll("_", " ")}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Drivers
            </p>
            {Object.entries(data?.drivers ?? {}).map(([status, count]) => (
              <div
                key={status}
                className="flex justify-between py-1.5 border-b"
              >
                <span className="text-sm">{status.replaceAll("_", " ")}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
