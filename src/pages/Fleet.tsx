import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Car, Search, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { getMyVehicles } from "@/services/vehicleService";
import { getErrorMessage } from "@/services/api";

export default function Fleet() {
  const [category, setCategory] = useState<"ALL" | "2W" | "3W" | "4W">("ALL");
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["vehicles"], queryFn: getMyVehicles });
  const vehicles = useMemo(
    () =>
      (query.data ?? []).filter(
        (vehicle) =>
          (category === "ALL" || vehicle.category === category) &&
          vehicle.registrationNumber.includes(search.toUpperCase()),
      ),
    [category, query.data, search],
  );
  const pages = useClientPagination(vehicles);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">My Fleet</h1>
          <p className="text-sm text-muted-foreground">
            Live VAHAN and compliance status
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{query.data?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground">vehicles</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="glass border rounded-xl p-4">
          <Car className="w-5 h-5 text-primary" />
          <p className="text-2xl font-bold mt-2">
            {query.data?.filter((v) => v.status === "ACTIVE").length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="glass border rounded-xl p-4">
          <Zap className="w-5 h-5 text-green-600" />
          <p className="text-2xl font-bold mt-2">
            {query.data?.filter((v) => v.electric).length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Electric</p>
        </div>
        <div className="glass border rounded-xl p-4">
          <p className="text-2xl font-bold">
            {query.data?.filter((v) =>
              ["REJECTED", "OFFBOARDED"].includes(v.status),
            ).length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">
            Restricted/off-boarded
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(["ALL", "2W", "3W", "4W"] as const).map((value) => (
          <button
            key={value}
            onClick={() => {
              setCategory(value);
              pages.reset();
            }}
            className={`px-4 py-2 rounded-lg border text-sm ${category === value ? "bg-primary text-primary-foreground" : "bg-card"}`}
          >
            {value}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            className="h-10 border rounded-lg pl-9 pr-3 bg-background"
            placeholder="Registration number"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              pages.reset();
            }}
          />
        </div>
      </div>
      {query.isError && (
        <p className="text-destructive mb-4">{getErrorMessage(query.error)}</p>
      )}
      <div className="glass border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-3">Registration</th>
              <th className="text-left p-3">Category</th>
			  <th className="text-left p-3">State</th>
              <th className="text-left p-3">Powertrain</th>
              <th className="text-left p-3">RC</th>
              <th className="text-left p-3">PUCC</th>
              <th className="text-left p-3">Insurance</th>
			  <th className="text-left p-3">Fitness</th>
			  <th className="text-left p-3">Tax</th>
			  <th className="text-left p-3">Permit</th>
			  <th className="text-left p-3">Challan</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {pages.pageItems.map((vehicle) => (
              <tr key={vehicle.id} className="border-t">
                <td className="p-3 font-mono font-semibold">
                  {vehicle.registrationNumber}
                </td>
                <td className="p-3">{vehicle.category}</td>
				<td className="p-3">{vehicle.vahanStateCode ?? "—"}</td>
                <td className="p-3">{vehicle.electric ? "Electric" : "ICE"}</td>
                <td className="p-3">{vehicle.registrationValidUntil ?? "—"}</td>
                <td className="p-3">{vehicle.pucValidUntil ?? "—"}</td>
                <td className="p-3">{vehicle.insuranceValidUntil ?? "—"}</td>
				<td className="p-3">{vehicle.fitnessValidUntil ?? "—"}</td>
				<td className="p-3">{vehicle.taxValidUntil ?? "—"}</td>
				<td className="p-3">{vehicle.permitValidUntil ?? "—"}</td>
				<td className="p-3">
				  {vehicle.challanClear === null
					? "Not verified"
					: vehicle.challanClear
					  ? "Clear"
					  : "Outstanding"}
				</td>
                <td className="p-3">
                  <span className="font-semibold">
                    {vehicle.status.replaceAll("_", " ")}
                  </span>
                  {vehicle.rejectionReason && (
                    <p className="text-xs text-destructive">
                      {vehicle.rejectionReason}
                    </p>
                  )}
                </td>
              </tr>
            ))}
            {!query.isLoading && !vehicles.length && (
              <tr>
                <td
				  colSpan={12}
                  className="p-10 text-center text-muted-foreground"
                >
                  No matching vehicles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <ListPagination
          page={pages.page}
          pageSize={pages.pageSize}
          totalItems={pages.totalItems}
          onPageChange={pages.setPage}
        />
      </div>
    </DashboardLayout>
  );
}
