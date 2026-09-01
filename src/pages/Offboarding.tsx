import { useQuery } from "@tanstack/react-query";
import { Car, ShieldAlert, Users } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { getMyVehicles } from "@/services/vehicleService";
import { getMyDrivers } from "@/services/driverService";

export default function Offboarding() {
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: getMyVehicles });
  const drivers = useQuery({ queryKey: ["drivers"], queryFn: getMyDrivers });
  const restrictedVehicles =
    vehicles.data?.filter((item) =>
      ["REJECTED", "OFFBOARDED"].includes(item.status),
    ) ?? [];
  const restrictedDrivers =
    drivers.data?.filter((item) =>
      ["REJECTED", "OFFBOARDED"].includes(item.status),
    ) ?? [];
  const vehiclePages = useClientPagination(restrictedVehicles);
  const driverPages = useClientPagination(restrictedDrivers);
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">System off-boarding</h1>
        <p className="text-sm text-muted-foreground">
          The compliance engine automatically restricts invalid vehicles and
          drivers; operators cannot bypass regulatory state.
        </p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 flex gap-3 text-amber-900">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <p className="text-sm">
          Triggers include expired RC/PUCC/insurance, overdue challans above
          threshold, expired or disqualified licences, and invalid PSV badges.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <section className="glass border rounded-xl">
          <div className="p-4 border-b flex gap-2 font-semibold">
            <Car className="w-5 h-5" /> Restricted vehicles
          </div>
          {vehiclePages.pageItems.map((item) => (
            <div key={item.id} className="p-4 border-b last:border-0">
              <strong className="font-mono">{item.registrationNumber}</strong>
              <p className="text-sm">{item.status.replaceAll("_", " ")}</p>
              <p className="text-xs text-destructive">{item.rejectionReason}</p>
            </div>
          ))}
          {!restrictedVehicles.length && (
            <p className="p-8 text-center text-muted-foreground">None</p>
          )}
          <ListPagination page={vehiclePages.page} pageSize={vehiclePages.pageSize} totalItems={vehiclePages.totalItems} onPageChange={vehiclePages.setPage} />
        </section>
        <section className="glass border rounded-xl">
          <div className="p-4 border-b flex gap-2 font-semibold">
            <Users className="w-5 h-5" /> Restricted drivers
          </div>
          {driverPages.pageItems.map((item) => (
            <div key={item.id} className="p-4 border-b last:border-0">
              <strong>{item.driverName ?? item.licenseNumber}</strong>
              <p className="text-sm font-mono">
                {item.licenseNumber} · {item.status}
              </p>
              <p className="text-xs text-destructive">{item.rejectionReason}</p>
            </div>
          ))}
          {!restrictedDrivers.length && (
            <p className="p-8 text-center text-muted-foreground">None</p>
          )}
          <ListPagination page={driverPages.page} pageSize={driverPages.pageSize} totalItems={driverPages.totalItems} onPageChange={driverPages.setPage} />
        </section>
      </div>
    </DashboardLayout>
  );
}
