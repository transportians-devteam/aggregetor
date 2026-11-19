import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Download,
  IdCard,
  Route,
  Search,
  Users,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getGovernmentMis,
  getGovernmentMisDrivers,
  getGovernmentMisLicenses,
  getGovernmentMisTrips,
  getGovernmentMisVehicles,
  type MisDriver,
  type MisLicense,
  type MisPage,
  type MisTrip,
  type MisVehicle,
} from "@/services/reportingService";
import { getErrorMessage } from "@/services/api";

type DetailTab = "vehicles" | "drivers" | "trips" | "licenses";
const dateTime = (value: string) => new Date(value).toLocaleString();
const date = (value: string | null) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "—";
const status = (value: string) => value.replaceAll("_", " ");

function EmptyRow({
  columns,
  message,
}: {
  columns: number;
  message?: string;
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={columns}
        className="h-32 text-center text-sm text-muted-foreground"
      >
        {message ?? "No records found in the selected date range."}
      </TableCell>
    </TableRow>
  );
}

function VehiclesTable({
  rows,
  isFiltered,
}: {
  rows: MisVehicle[];
  isFiltered?: boolean;
}) {
  return (
    <Table className="min-w-[1050px]">
      <TableHeader>
        <TableRow>
          <TableHead>Operator</TableHead>
          <TableHead>Registration</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>EV</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Registration valid</TableHead>
          <TableHead>PUCC valid</TableHead>
          <TableHead>Insurance valid</TableHead>
          <TableHead>Fitness valid</TableHead>
          <TableHead>Tax valid</TableHead>
          <TableHead>Permit valid</TableHead>
          <TableHead>Challan</TableHead>
          <TableHead>Last activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <b>{row.operatorName}</b>
              <small className="block text-muted-foreground">
                User #{row.ownerUserId}
              </small>
            </TableCell>
            <TableCell className="font-mono text-xs font-semibold">{row.registrationNumber}</TableCell>
            <TableCell>{row.stateCode ?? "—"}</TableCell>
            <TableCell>{row.category}</TableCell>
            <TableCell>
              {row.electric === null
                ? "Unknown"
                : row.electric
                  ? <span className="font-medium text-emerald-600 dark:text-emerald-400">Electric</span>
                  : "Non-EV"}
            </TableCell>
            <TableCell>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {status(row.status)}
              </span>
              {row.rejectionReason && (
                <small className="mt-1 block max-w-48 text-destructive">
                  {row.rejectionReason}
                </small>
              )}
            </TableCell>
            <TableCell>{date(row.registrationValidUntil)}</TableCell>
            <TableCell>{date(row.pucValidUntil)}</TableCell>
            <TableCell>{date(row.insuranceValidUntil)}</TableCell>
            <TableCell>{date(row.fitnessValidUntil)}</TableCell>
            <TableCell>{date(row.taxValidUntil)}</TableCell>
            <TableCell>{date(row.permitValidUntil)}</TableCell>
            <TableCell>
              {row.challanClear === null
                ? <span className="text-muted-foreground">Not verified</span>
                : row.challanClear
                  ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">Clear</span>
                  : <span className="text-amber-600 dark:text-amber-400 font-medium">Outstanding</span>}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{dateTime(row.updatedAt)}</TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <EmptyRow
            columns={14}
            message={
              isFiltered
                ? "No vehicles match your active search or filters."
                : "No records found in the selected date range."
            }
          />
        )}
      </TableBody>
    </Table>
  );
}

function DriversTable({
  rows,
  isFiltered,
}: {
  rows: MisDriver[];
  isFiltered?: boolean;
}) {
  return (
    <Table className="min-w-[900px]">
      <TableHeader>
        <TableRow>
          <TableHead>Operator</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Licence</TableHead>
          <TableHead>Licence valid</TableHead>
          <TableHead>PSV badge</TableHead>
          <TableHead>PSV valid</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <b>{row.operatorName}</b>
              <small className="block text-muted-foreground">
                User #{row.ownerUserId}
              </small>
            </TableCell>
            <TableCell className="font-medium">{row.driverName ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs font-semibold">{row.licenseNumber}</TableCell>
            <TableCell>{date(row.licenseValidUntil)}</TableCell>
            <TableCell className="font-mono text-xs">{row.psvBadgeNumber ?? "—"}</TableCell>
            <TableCell>{date(row.psvBadgeValidUntil)}</TableCell>
            <TableCell>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {status(row.status)}
              </span>
              {row.rejectionReason && (
                <small className="mt-1 block max-w-48 text-destructive">
                  {row.rejectionReason}
                </small>
              )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{dateTime(row.updatedAt)}</TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <EmptyRow
            columns={8}
            message={
              isFiltered
                ? "No drivers match your active search or filters."
                : "No records found in the selected date range."
            }
          />
        )}
      </TableBody>
    </Table>
  );
}

function TripsTable({
  rows,
  isFiltered,
}: {
  rows: MisTrip[];
  isFiltered?: boolean;
}) {
  return (
    <Table className="min-w-[950px]">
      <TableHeader>
        <TableRow>
          <TableHead>Operator</TableHead>
          <TableHead>Trip ID</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Distance</TableHead>
          <TableHead>Fare</TableHead>
          <TableHead>Rating</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <b>{row.operatorName}</b>
              <small className="block text-muted-foreground">
                User #{row.ownerUserId}
              </small>
            </TableCell>
            <TableCell className="font-mono text-xs font-semibold">{row.tripId}</TableCell>
            <TableCell className="font-mono text-xs">{row.vehicleRegistration}</TableCell>
            <TableCell>
              <span className="font-medium">{row.driverName ?? row.driverLicense}</span>
              {row.driverName && (
                <small className="block font-mono text-[11px] text-muted-foreground">
                  {row.driverLicense}
                </small>
              )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{dateTime(row.startedAt)}</TableCell>
            <TableCell>{row.durationMinutes} min</TableCell>
            <TableCell>{Number(row.distanceKm).toFixed(2)} km</TableCell>
            <TableCell className="font-semibold">₹{Number(row.fareAmount).toFixed(2)}</TableCell>
            <TableCell>
              {row.driverRating === null
                ? "—"
                : `★ ${Number(row.driverRating).toFixed(1)}`}
            </TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <EmptyRow
            columns={9}
            message={
              isFiltered
                ? "No trips match your active search or filters."
                : "No records found in the selected date range."
            }
          />
        )}
      </TableBody>
    </Table>
  );
}

function LicensesTable({
  rows,
  isFiltered,
}: {
  rows: MisLicense[];
  isFiltered?: boolean;
}) {
  return (
    <Table className="min-w-[780px]">
      <TableHeader>
        <TableRow>
          <TableHead>Operator</TableHead>
          <TableHead>Licence number</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Valid from</TableHead>
          <TableHead>Valid until</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Application</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <b>{row.operatorName}</b>
              <small className="block text-muted-foreground">
                User #{row.holderUserId}
              </small>
            </TableCell>
            <TableCell className="font-mono text-xs font-semibold">{row.licenseNumber}</TableCell>
            <TableCell>{date(row.issuedOn)}</TableCell>
            <TableCell>{date(row.validFrom)}</TableCell>
            <TableCell>{date(row.validUntil)}</TableCell>
            <TableCell>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {status(row.status)}
              </span>
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{row.applicationId}</TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <EmptyRow
            columns={7}
            message={
              isFiltered
                ? "No licences match your active search or filters."
                : "No records found in the selected date range."
            }
          />
        )}
      </TableBody>
    </Table>
  );
}

function Pagination({
  data,
  filteredCount,
  onPage,
}: {
  data: MisPage<unknown>;
  filteredCount?: number;
  onPage: (page: number) => void;
}) {
  const isFiltered =
    filteredCount !== undefined && filteredCount !== data.items.length;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <p className="text-muted-foreground">
        {isFiltered ? (
          <>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredCount}
            </span>{" "}
            of {data.totalElements} records (filtered) · page{" "}
          </>
        ) : (
          <>{data.totalElements} records · page </>
        )}
        {data.totalPages === 0 ? 0 : data.page + 1} of {data.totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={data.page === 0}
          onClick={() => onPage(data.page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={data.page + 1 >= data.totalPages}
          onClick={() => onPage(data.page + 1)}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminAggregators() {
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const [from, setFrom] = useState(monthAgo.toISOString().slice(0, 10));
  const [to, setTo] = useState(now.toISOString().slice(0, 10));
  const [tab, setTab] = useState<DetailTab>("vehicles");
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [evFilter, setEvFilter] = useState("ALL");
  const validRange = Boolean(from && to && from <= to);
  const summary = useQuery({
    queryKey: ["government-mis", from, to],
    queryFn: () => getGovernmentMis(from, to),
    enabled: validRange,
  });
  const vehicles = useQuery({
    queryKey: ["government-mis-vehicles", from, to, page],
    queryFn: () => getGovernmentMisVehicles(from, to, page),
    enabled: validRange && tab === "vehicles",
  });
  const drivers = useQuery({
    queryKey: ["government-mis-drivers", from, to, page],
    queryFn: () => getGovernmentMisDrivers(from, to, page),
    enabled: validRange && tab === "drivers",
  });
  const trips = useQuery({
    queryKey: ["government-mis-trips", from, to, page],
    queryFn: () => getGovernmentMisTrips(from, to, page),
    enabled: validRange && tab === "trips",
  });
  const licenses = useQuery({
    queryKey: ["government-mis-licenses", from, to, page],
    queryFn: () => getGovernmentMisLicenses(from, to, page),
    enabled: validRange && tab === "licenses",
  });
  const data = summary.data;
  const activeQuery =
    tab === "vehicles"
      ? vehicles
      : tab === "drivers"
        ? drivers
        : tab === "trips"
          ? trips
          : licenses;
  const changeDate = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(0);
  };
  const selectTab = (next: DetailTab) => {
    setTab(next);
    setPage(0);
    setSearchQuery("");
    setStatusFilter("ALL");
    setEvFilter("ALL");
  };

  const filteredVehicles = useMemo(() => {
    const list = vehicles.data?.items ?? [];
    return list.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (evFilter === "EV" && r.electric !== true) return false;
      if (evFilter === "NON_EV" && r.electric !== false) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.operatorName?.toLowerCase().includes(q) ||
        r.registrationNumber?.toLowerCase().includes(q) ||
        r.stateCode?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q)
      );
    });
  }, [vehicles.data?.items, searchQuery, statusFilter, evFilter]);

  const filteredDrivers = useMemo(() => {
    const list = drivers.data?.items ?? [];
    return list.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.operatorName?.toLowerCase().includes(q) ||
        r.driverName?.toLowerCase().includes(q) ||
        r.licenseNumber?.toLowerCase().includes(q) ||
        r.psvBadgeNumber?.toLowerCase().includes(q)
      );
    });
  }, [drivers.data?.items, searchQuery, statusFilter]);

  const filteredTrips = useMemo(() => {
    const list = trips.data?.items ?? [];
    return list.filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.operatorName?.toLowerCase().includes(q) ||
        r.tripId?.toLowerCase().includes(q) ||
        r.vehicleRegistration?.toLowerCase().includes(q) ||
        r.driverName?.toLowerCase().includes(q) ||
        r.driverLicense?.toLowerCase().includes(q)
      );
    });
  }, [trips.data?.items, searchQuery]);

  const filteredLicenses = useMemo(() => {
    const list = licenses.data?.items ?? [];
    return list.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.operatorName?.toLowerCase().includes(q) ||
        r.licenseNumber?.toLowerCase().includes(q) ||
        r.applicationId?.toLowerCase().includes(q)
      );
    });
  }, [licenses.data?.items, searchQuery, statusFilter]);

  const availableStatuses = useMemo(() => {
    const currentList: Array<{ status?: string }> =
      tab === "vehicles"
        ? (vehicles.data?.items ?? [])
        : tab === "drivers"
          ? (drivers.data?.items ?? [])
          : tab === "licenses"
            ? (licenses.data?.items ?? [])
            : [];
    const set = new Set<string>();
    currentList.forEach((r) => {
      if (r.status) set.add(r.status);
    });
    return Array.from(set);
  }, [tab, vehicles.data?.items, drivers.data?.items, licenses.data?.items]);

  const filteredCount =
    tab === "vehicles"
      ? filteredVehicles.length
      : tab === "drivers"
        ? filteredDrivers.length
        : tab === "trips"
          ? filteredTrips.length
          : filteredLicenses.length;

  const isFiltered = Boolean(
    searchQuery || statusFilter !== "ALL" || evFilter !== "ALL"
  );

  const searchPlaceholder =
    tab === "vehicles"
      ? "Search vehicles by operator, reg number, state, category…"
      : tab === "drivers"
        ? "Search drivers by operator, name, license, PSV badge…"
        : tab === "trips"
          ? "Search trips by ID, vehicle reg, driver, operator…"
          : "Search licences by operator, licence no, application ID…";

  const handleExportCsv = () => {
    const sanitize = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    let filename = `mis-${tab}-${from}-to-${to}`;
    let headers: string[] = [];
    let rows: (string | number | null | undefined)[][] = [];

    if (tab === "vehicles") {
      headers = [
        "Operator",
        "Owner User ID",
        "Registration",
        "State",
        "Category",
        "Electric",
        "Status",
        "Rejection Reason",
        "Registration Valid Until",
        "PUC Valid Until",
        "Insurance Valid Until",
        "Fitness Valid Until",
        "Tax Valid Until",
        "Permit Valid Until",
        "Challan Clear",
        "Last Activity",
      ];
      rows = filteredVehicles.map((r) => [
        r.operatorName,
        r.ownerUserId,
        r.registrationNumber,
        r.stateCode ?? "",
        r.category,
        r.electric === null ? "Unknown" : r.electric ? "Electric" : "Non-EV",
        r.status,
        r.rejectionReason ?? "",
        r.registrationValidUntil ?? "",
        r.pucValidUntil ?? "",
        r.insuranceValidUntil ?? "",
        r.fitnessValidUntil ?? "",
        r.taxValidUntil ?? "",
        r.permitValidUntil ?? "",
        r.challanClear === null ? "Not verified" : r.challanClear ? "Clear" : "Pending",
        r.updatedAt ?? r.createdAt,
      ]);
    } else if (tab === "drivers") {
      headers = [
        "Operator",
        "Owner User ID",
        "Driver Name",
        "License Number",
        "License Valid Until",
        "PSV Badge Number",
        "PSV Badge Valid Until",
        "Status",
        "Rejection Reason",
        "Last Activity",
      ];
      rows = filteredDrivers.map((r) => [
        r.operatorName,
        r.ownerUserId,
        r.driverName ?? "",
        r.licenseNumber,
        r.licenseValidUntil ?? "",
        r.psvBadgeNumber ?? "",
        r.psvBadgeValidUntil ?? "",
        r.status,
        r.rejectionReason ?? "",
        r.updatedAt ?? r.createdAt,
      ]);
    } else if (tab === "trips") {
      headers = [
        "Operator",
        "Trip ID",
        "Vehicle Registration",
        "Driver Name",
        "Driver License",
        "Started At",
        "Ended At",
        "Duration Minutes",
        "Distance Km",
        "Fare Amount",
        "Driver Rating",
      ];
      rows = filteredTrips.map((r) => [
        r.operatorName,
        r.tripId,
        r.vehicleRegistration,
        r.driverName ?? "",
        r.driverLicense,
        r.startedAt,
        r.endedAt,
        r.durationMinutes,
        r.distanceKm,
        r.fareAmount,
        r.driverRating ?? "",
      ]);
    } else if (tab === "licenses") {
      headers = [
        "Operator",
        "Holder User ID",
        "Licence Number",
        "Issued On",
        "Valid From",
        "Valid Until",
        "Status",
        "Application ID",
      ];
      rows = filteredLicenses.map((r) => [
        r.operatorName,
        r.holderUserId,
        r.licenseNumber,
        r.issuedOn,
        r.validFrom,
        r.validUntil,
        r.status,
        r.applicationId,
      ]);
    }

    const csvContent = [
      headers.map(sanitize).join(","),
      ...rows.map((row) => row.map(sanitize).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const error = summary.error ?? activeQuery.error;
  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold">Government MIS</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Regulatory snapshot with date-filtered fleet, driver, trip and licence
        drill-down.
      </p>
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <CalendarDays className="mb-2 hidden h-5 w-5 text-primary sm:block" />
        <label className="text-xs font-medium">
          From
          <input
            type="date"
            value={from}
            max={to}
            onChange={(event) => changeDate(setFrom)(event.target.value)}
            className="mt-1 block rounded border bg-background p-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium">
          To
          <input
            type="date"
            value={to}
            min={from}
            onChange={(event) => changeDate(setTo)(event.target.value)}
            className="mt-1 block rounded border bg-background p-2 text-sm"
          />
        </label>
        <p className="text-xs text-muted-foreground sm:ml-2">
          Vehicle and driver tabs use last activity; trips use start time;
          licences use issue date.
        </p>
      </div>
      {!validRange && (
        <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          Choose a valid date range.
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(error)}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active licences"
          value={(data?.activeLicenses ?? 0).toString()}
          icon={<IdCard className="h-5 w-5" />}
          trend="Current government snapshot"
        />
        <StatCard
          label="Active vehicles"
          value={(data?.activeVehicles ?? 0).toString()}
          icon={<Car className="h-5 w-5" />}
          trend={`${data?.offboardedVehicles ?? 0} currently offboarded`}
        />
        <StatCard
          label="Active drivers"
          value={(data?.activeDrivers ?? 0).toString()}
          icon={<Users className="h-5 w-5" />}
          trend={`${data?.offboardedDrivers ?? 0} currently offboarded`}
        />
        <StatCard
          label="Trips in range"
          value={(data?.trips ?? 0).toString()}
          icon={<Route className="h-5 w-5" />}
          trend={`${from} to ${to}`}
        />
      </div>
      <section className="mt-7 overflow-hidden rounded-xl border bg-card">
        {/* Tab switcher + Export CSV */}
        <div className="flex flex-wrap items-center justify-between border-b bg-muted/20 p-2.5 gap-2">
          <div className="flex overflow-x-auto gap-1">
            {(
              [
                ["vehicles", "Vehicles"],
                ["drivers", "Drivers"],
                ["trips", "Trips"],
                ["licenses", "Licences"],
              ] as Array<[DetailTab, string]>
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => selectTab(value)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredCount === 0}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col gap-2.5 border-b p-3 sm:flex-row sm:items-center sm:justify-between bg-card">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {availableStatuses.length > 0 && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Statuses</option>
                {availableStatuses.map((s) => (
                  <option key={s} value={s}>
                    {status(s)}
                  </option>
                ))}
              </select>
            )}

            {tab === "vehicles" && (
              <select
                value={evFilter}
                onChange={(e) => setEvFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Fuel Types</option>
                <option value="EV">Electric Only</option>
                <option value="NON_EV">Non-EV</option>
              </select>
            )}

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setEvFilter("ALL");
                }}
                className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {activeQuery.isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading detailed records…
          </div>
        ) : (
          <div>
            {tab === "vehicles" && (
              <VehiclesTable rows={filteredVehicles} isFiltered={isFiltered} />
            )}
            {tab === "drivers" && (
              <DriversTable rows={filteredDrivers} isFiltered={isFiltered} />
            )}
            {tab === "trips" && (
              <TripsTable rows={filteredTrips} isFiltered={isFiltered} />
            )}
            {tab === "licenses" && (
              <LicensesTable rows={filteredLicenses} isFiltered={isFiltered} />
            )}
          </div>
        )}
        {activeQuery.data && (
          <Pagination
            data={activeQuery.data as MisPage<unknown>}
            filteredCount={filteredCount}
            onPage={setPage}
          />
        )}
      </section>
    </DashboardLayout>
  );
}
