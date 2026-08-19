import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  IdCard,
  Route,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
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

function EmptyRow({ columns }: { columns: number }) {
  return (
    <tr>
      <td
        colSpan={columns}
        className="p-10 text-center text-sm text-muted-foreground"
      >
        No records found in the selected date range.
      </td>
    </tr>
  );
}
function VehiclesTable({ rows }: { rows: MisVehicle[] }) {
  return (
    <table className="w-full min-w-[1050px] text-left text-sm">
      <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
        <tr>
          <th className="p-3">Operator</th>
          <th>Registration</th>
		  <th>State</th>
          <th>Category</th>
          <th>EV</th>
          <th>Status</th>
          <th>Registration</th>
          <th>PUCC</th>
          <th>Insurance</th>
		  <th>Fitness</th>
		  <th>Tax</th>
		  <th>Permit</th>
          <th>Challan</th>
          <th>Last activity</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-t">
            <td className="p-3">
              <b>{row.operatorName}</b>
              <small className="block text-muted-foreground">
                User #{row.ownerUserId}
              </small>
            </td>
            <td className="font-medium">{row.registrationNumber}</td>
			<td>{row.stateCode ?? "—"}</td>
            <td>{row.category}</td>
            <td>
              {row.electric === null
                ? "Unknown"
                : row.electric
                  ? "Electric"
                  : "Non-EV"}
            </td>
            <td>
              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                {status(row.status)}
              </span>
              {row.rejectionReason && (
                <small className="mt-1 block max-w-48 text-destructive">
                  {row.rejectionReason}
                </small>
              )}
            </td>
            <td>{date(row.registrationValidUntil)}</td>
            <td>{date(row.pucValidUntil)}</td>
            <td>{date(row.insuranceValidUntil)}</td>
			<td>{date(row.fitnessValidUntil)}</td>
			<td>{date(row.taxValidUntil)}</td>
			<td>{date(row.permitValidUntil)}</td>
            <td>
              {row.challanClear === null
				? "Not verified"
                : row.challanClear
                  ? "Clear"
				  : "Outstanding"}
            </td>
            <td>{dateTime(row.updatedAt)}</td>
          </tr>
        ))}
		{rows.length === 0 && <EmptyRow columns={14} />}
      </tbody>
    </table>
  );
}
function DriversTable({ rows }: { rows: MisDriver[] }) {
  return (
    <table className="w-full min-w-[900px] text-left text-sm">
      <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
        <tr>
          <th className="p-3">Operator</th>
          <th>Driver</th>
          <th>Licence</th>
          <th>Licence valid</th>
          <th>PSV badge</th>
          <th>PSV valid</th>
          <th>Status</th>
          <th>Last activity</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-t">
            <td className="p-3">
              <b>{row.operatorName}</b>
              <small className="block text-muted-foreground">
                User #{row.ownerUserId}
              </small>
            </td>
            <td>{row.driverName ?? "—"}</td>
            <td className="font-medium">{row.licenseNumber}</td>
            <td>{date(row.licenseValidUntil)}</td>
            <td>{row.psvBadgeNumber ?? "—"}</td>
            <td>{date(row.psvBadgeValidUntil)}</td>
            <td>
              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                {status(row.status)}
              </span>
              {row.rejectionReason && (
                <small className="mt-1 block max-w-48 text-destructive">
                  {row.rejectionReason}
                </small>
              )}
            </td>
            <td>{dateTime(row.updatedAt)}</td>
          </tr>
        ))}
        {rows.length === 0 && <EmptyRow columns={8} />}
      </tbody>
    </table>
  );
}
function TripsTable({ rows }: { rows: MisTrip[] }) {
  return (
    <table className="w-full min-w-[950px] text-left text-sm">
      <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
        <tr>
          <th className="p-3">Operator</th>
          <th>Trip</th>
          <th>Vehicle</th>
          <th>Driver</th>
          <th>Started</th>
          <th>Duration</th>
          <th>Distance</th>
          <th>Fare</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-t">
            <td className="p-3">
              <b>{row.operatorName}</b>
              <small className="block text-muted-foreground">
                User #{row.ownerUserId}
              </small>
            </td>
            <td className="font-medium">{row.tripId}</td>
            <td>{row.vehicleRegistration}</td>
            <td>
              {row.driverName ?? row.driverLicense}
              <small className="block text-muted-foreground">
                {row.driverLicense}
              </small>
            </td>
            <td>{dateTime(row.startedAt)}</td>
            <td>{row.durationMinutes} min</td>
            <td>{Number(row.distanceKm).toFixed(2)} km</td>
            <td>₹{Number(row.fareAmount).toFixed(2)}</td>
            <td>
              {row.driverRating === null
                ? "—"
                : Number(row.driverRating).toFixed(1)}
            </td>
          </tr>
        ))}
        {rows.length === 0 && <EmptyRow columns={9} />}
      </tbody>
    </table>
  );
}
function LicensesTable({ rows }: { rows: MisLicense[] }) {
  return (
    <table className="w-full min-w-[780px] text-left text-sm">
      <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
        <tr>
          <th className="p-3">Operator</th>
          <th>Licence number</th>
          <th>Issued</th>
          <th>Valid from</th>
          <th>Valid until</th>
          <th>Status</th>
          <th>Application</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-t">
            <td className="p-3">
              <b>{row.operatorName}</b>
              <small className="block text-muted-foreground">
                User #{row.holderUserId}
              </small>
            </td>
            <td className="font-medium">{row.licenseNumber}</td>
            <td>{date(row.issuedOn)}</td>
            <td>{date(row.validFrom)}</td>
            <td>{date(row.validUntil)}</td>
            <td>
              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                {status(row.status)}
              </span>
            </td>
            <td className="font-mono text-xs">{row.applicationId}</td>
          </tr>
        ))}
        {rows.length === 0 && <EmptyRow columns={7} />}
      </tbody>
    </table>
  );
}

function Pagination({
  data,
  onPage,
}: {
  data: MisPage<unknown>;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
      <p className="text-muted-foreground">
        {data.totalElements} records · page{" "}
        {data.totalPages === 0 ? 0 : data.page + 1} of {data.totalPages}
      </p>
      <div className="flex gap-2">
        <button
          disabled={data.page === 0}
          onClick={() => onPage(data.page - 1)}
          className="inline-flex items-center rounded-lg border px-3 py-1.5 disabled:opacity-40"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </button>
        <button
          disabled={data.page + 1 >= data.totalPages}
          onClick={() => onPage(data.page + 1)}
          className="inline-flex items-center rounded-lg border px-3 py-1.5 disabled:opacity-40"
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </button>
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
        <div className="flex overflow-x-auto border-b p-2">
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
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {activeQuery.isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading detailed records…
          </div>
        ) : (
          <div className="overflow-x-auto">
            {tab === "vehicles" && (
              <VehiclesTable rows={vehicles.data?.items ?? []} />
            )}
            {tab === "drivers" && (
              <DriversTable rows={drivers.data?.items ?? []} />
            )}
            {tab === "trips" && <TripsTable rows={trips.data?.items ?? []} />}
            {tab === "licenses" && (
              <LicensesTable rows={licenses.data?.items ?? []} />
            )}
          </div>
        )}
        {activeQuery.data && (
          <Pagination
            data={activeQuery.data as MisPage<unknown>}
            onPage={setPage}
          />
        )}
      </section>
    </DashboardLayout>
  );
}
