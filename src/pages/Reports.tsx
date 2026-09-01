import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BarChart3, Loader2, Upload } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/services/api";
import {
  getDriverPerformance,
  getTripImport,
  getVehicleUtilization,
  importTrips,
  type TripImport,
  type Utilization,
} from "@/services/reportingService";

function ResultTable({ rows }: { rows?: Utilization[] }) {
  const pages = useClientPagination(rows ?? []);
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="p-3">Subject</th>
            <th>Trips</th>
            <th>Distance</th>
            <th>Revenue</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {pages.pageItems.map((row) => (
            <tr key={row.subjectId} className="border-t">
              <td className="p-3 font-medium">{row.subjectLabel}</td>
              <td>{row.tripCount}</td>
              <td>{row.distanceKm.toFixed(1)} km</td>
              <td>₹{row.revenue.toFixed(2)}</td>
              <td>{row.averageRating?.toFixed(1) ?? "—"}</td>
            </tr>
          ))}
          {rows?.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                No trip data in this date range.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <ListPagination page={pages.page} pageSize={pages.pageSize} totalItems={pages.totalItems} onPageChange={pages.setPage} />
    </div>
  );
}

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const initialFrom = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().slice(0, 10);
  }, []);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(today);
  const [tab, setTab] = useState<"vehicles" | "drivers">("vehicles");
  const [job, setJob] = useState<TripImport | null>(null);
  const vehicles = useQuery({
    queryKey: ["vehicle-utilization", from, to],
    queryFn: () => getVehicleUtilization(from, to),
    enabled: Boolean(from && to),
  });
  const drivers = useQuery({
    queryKey: ["driver-performance", from, to],
    queryFn: () => getDriverPerformance(from, to),
    enabled: Boolean(from && to),
  });
  const importMutation = useMutation({
    mutationFn: importTrips,
    onSuccess: setJob,
  });
  const importStatus = useQuery({
    queryKey: ["trip-import", job?.id],
    queryFn: () => getTripImport(job!.id),
    enabled: Boolean(job?.id && job.status === "PROCESSING"),
    refetchInterval: 1500,
  });
  useEffect(() => {
    if (importStatus.data) setJob(importStatus.data);
  }, [importStatus.data]);
  const error = vehicles.error ?? drivers.error ?? importMutation.error;
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Reports and trip data
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload trip records and review vehicle utilization or driver
          performance.
        </p>
      </div>
      <section className="mb-6 rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-medium">From</label>
            <Input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium">To</label>
            <Input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <label className="ml-auto cursor-pointer">
            <Button asChild variant="outline">
              <span>
                {importMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Import trip CSV
              </span>
            </Button>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) importMutation.mutate(file);
              }}
            />
          </label>
        </div>
        {job && (
          <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
            <b>{job.filename}</b>
            <p className="text-muted-foreground">
              {job.status}: {job.acceptedRows} accepted, {job.rejectedRows}{" "}
              rejected of {job.totalRows}
            </p>
            {job.rows
              .filter((row) => row.status === "REJECTED")
              .slice(0, 5)
              .map((row) => (
                <p key={row.rowNumber} className="text-xs text-destructive">
                  Row {row.rowNumber}: {row.message}
                </p>
              ))}
          </div>
        )}
        {error && (
          <p className="mt-3 text-sm text-destructive">
            {getErrorMessage(error)}
          </p>
        )}
      </section>
      <div className="mb-3 flex gap-2">
        <Button
          variant={tab === "vehicles" ? "default" : "outline"}
          onClick={() => setTab("vehicles")}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Vehicles
        </Button>
        <Button
          variant={tab === "drivers" ? "default" : "outline"}
          onClick={() => setTab("drivers")}
        >
          Drivers
        </Button>
      </div>
      <ResultTable key={`${tab}-${from}-${to}`} rows={tab === "vehicles" ? vehicles.data : drivers.data} />
    </DashboardLayout>
  );
}
