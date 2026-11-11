import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Car, Download, FileSpreadsheet, Loader2, RefreshCw, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/services/api";
import { useClientPagination } from "@/hooks/useClientPagination";
import {
  getCurrentFleetDeclaration,
  getVahanIntegrationStatus,
  getMyVehicles,
  getVehicleImport,
  importVehicles,
  onboardVehicle,
  recheckVehicleVahan,
  FleetVehicle,
  VehicleCategory,
  VehicleImportJob,
} from "@/services/vehicleService";
import {
  getMyDrivers,
  importDrivers,
  onboardDriver,
} from "@/services/driverService";
import {
  completeDevelopmentPayment,
  createTopUp,
  fundVehicles,
  getVehicleBatchFundingQuote,
  getWallet,
} from "@/services/walletService";

const isPaymentReady = (status: string) =>
  status === "PAYMENT_REQUIRED" || status === "SECURITY_DEPOSIT_REQUIRED";

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.max(0, Math.round(seconds % 60));
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
};

export default function Onboarding() {
  const client = useQueryClient();
  const [tab, setTab] = useState<"vehicle" | "driver">("vehicle");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [category, setCategory] = useState<VehicleCategory>("4W");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [error, setError] = useState("");
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [topUpAmount, setTopUpAmount] = useState(5000);
  const [vehicleImportResult, setVehicleImportResult] = useState<VehicleImportJob | null>(null);
  const [vehicleImportJobId, setVehicleImportJobId] = useState<string | null>(null);
  const [singleRejectedVehicle, setSingleRejectedVehicle] = useState<FleetVehicle | null>(null);
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: getMyVehicles });
  const drivers = useQuery({ queryKey: ["drivers"], queryFn: getMyDrivers });
  const wallet = useQuery({ queryKey: ["wallet"], queryFn: getWallet });
  const paymentReadyVehiclesFirst = useMemo(
    () =>
      [...(vehicles.data ?? [])].sort(
        (left, right) =>
          Number(isPaymentReady(right.status)) - Number(isPaymentReady(left.status)),
      ),
    [vehicles.data],
  );
  const vehiclePages = useClientPagination(paymentReadyVehiclesFirst);
  const driverPages = useClientPagination(drivers.data ?? []);
  const registrationByVehicleId = useMemo(
    () => new Map((vehicles.data ?? []).map((vehicle) => [vehicle.id, vehicle.registrationNumber])),
    [vehicles.data],
  );
  const rejectedImportRows = useMemo(
    () => vehicleImportResult?.rows?.filter((row) => row.status === "REJECTED") ?? [],
    [vehicleImportResult],
  );
  const rejectedImportPages = useClientPagination(rejectedImportRows);
  const declaration = useQuery({
    queryKey: ["fleet-declaration-window"],
    queryFn: getCurrentFleetDeclaration,
  });
  const vahanStatus = useQuery({
    queryKey: ["vahan-integration-status"],
    queryFn: getVahanIntegrationStatus,
  });
  const fundingQuote = useQuery({
    queryKey: ["vehicle-batch-funding-quote", selectedVehicleIds],
    queryFn: () => getVehicleBatchFundingQuote(selectedVehicleIds),
    enabled: selectedVehicleIds.length > 0,
  });
  const vehicleImportProgress = useQuery({
    queryKey: ["vehicle-import", vehicleImportJobId],
    queryFn: () => getVehicleImport(vehicleImportJobId!),
    enabled: Boolean(vehicleImportJobId),
    refetchInterval: (query) =>
      query.state.data?.status === "COMPLETED" ? false : 1000,
  });

  useEffect(() => {
    const job = vehicleImportProgress.data;
    if (!job) return;
    setVehicleImportResult(job);
    if (job.status === "COMPLETED") {
      setVehicleImportJobId(null);
      void client.invalidateQueries({ queryKey: ["vehicles"] });
      void client.invalidateQueries({ queryKey: ["fleet-declaration-window"] });
      toast.success("Vehicle import completed", {
        description: `${job.acceptedRows} accepted, ${job.rejectedRows} rejected`,
      });
    }
  }, [client, vehicleImportProgress.data]);

  useEffect(() => {
    const eligible = new Set(
      (vehicles.data ?? [])
        .filter((vehicle) => isPaymentReady(vehicle.status))
        .map((vehicle) => vehicle.id),
    );
    setSelectedVehicleIds((current) => current.filter((id) => eligible.has(id)));
  }, [vehicles.data]);

  const vehicleMutation = useMutation({
    mutationFn: () => onboardVehicle(registrationNumber, category),
    onSuccess: (vehicle) => {
      setRegistrationNumber("");
      if (vehicle.status === "REJECTED") {
        setSingleRejectedVehicle(vehicle);
        toast.error("Vehicle is ineligible and was skipped");
      } else {
        setSingleRejectedVehicle(null);
        client.invalidateQueries({ queryKey: ["vehicles"] });
        client.invalidateQueries({ queryKey: ["fleet-declaration-window"] });
        toast.success(`VAHAN check: ${vehicle.status.replaceAll("_", " ")}`);
      }
    },
    onError: (failure) => setError(getErrorMessage(failure)),
  });
  const vahanRecheckMutation = useMutation({
    mutationFn: recheckVehicleVahan,
    onSuccess: (vehicle) => {
      setError("");
      void client.invalidateQueries({ queryKey: ["vehicles"] });
      void client.invalidateQueries({ queryKey: ["fleet-declaration-window"] });
      toast.success(
        `VAHAN recheck: ${vehicle.status.replaceAll("_", " ")}`,
      );
    },
    onError: (failure) => setError(getErrorMessage(failure)),
  });
  const driverMutation = useMutation({
    mutationFn: () => onboardDriver(licenseNumber),
    onSuccess: (driver) => {
      setLicenseNumber("");
      client.invalidateQueries({ queryKey: ["drivers"] });
      toast.success(`SARATHI check: ${driver.status.replaceAll("_", " ")}`);
    },
    onError: (failure) => setError(getErrorMessage(failure)),
  });
  const fundMutation = useMutation({
    mutationFn: fundVehicles,
    onSuccess: (_wallet, fundedIds) => {
      setSelectedVehicleIds((current) => current.filter((id) => !fundedIds.includes(id)));
      client.invalidateQueries({ queryKey: ["vehicles"] });
      client.invalidateQueries({ queryKey: ["wallet"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      client.invalidateQueries({ queryKey: ["fleet-declaration-window"] });
      toast.success(`${fundedIds.length} vehicle${fundedIds.length === 1 ? "" : "s"} funded and activated`);
    },
    onError: (failure) => setError(getErrorMessage(failure)),
  });
  const topUpMutation = useMutation({
    mutationFn: async () => {
      const intent = await createTopUp(topUpAmount);
      if (import.meta.env.DEV) return completeDevelopmentPayment(intent.id);
      window.location.assign(intent.checkoutUrl);
      return null;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["wallet"] });
      client.invalidateQueries({
        queryKey: ["vehicle-batch-funding-quote", selectedVehicleIds],
      });
      toast.success("Wallet recharged. You can now complete onboarding.");
    },
    onError: (failure) => setError(getErrorMessage(failure)),
  });

  const uploadVehicleCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const job = await importVehicles(file);
      setVehicleImportResult(job);
      rejectedImportPages.reset();
      setVehicleImportJobId(job.id);
      toast.success("CSV accepted for background processing", {
        description: `${job.totalRows} rows queued. You can continue using the portal.`,
      });
    } catch (failure) {
      setError(getErrorMessage(failure));
    } finally {
      event.target.value = "";
    }
  };

  const eligibleVehiclesOnPage = vehiclePages.pageItems.filter(
    (vehicle) => isPaymentReady(vehicle.status),
  );
  const allEligibleOnPageSelected =
    eligibleVehiclesOnPage.length > 0 &&
    eligibleVehiclesOnPage.every((vehicle) => selectedVehicleIds.includes(vehicle.id));
  const toggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds((current) => {
      if (current.includes(vehicleId)) {
        return current.filter((id) => id !== vehicleId);
      }
      if (current.length >= 100) {
        toast.error("A payment batch can contain at most 100 vehicles.");
        return current;
      }
      return [...current, vehicleId];
    });
  };
  const toggleCurrentPage = () => {
    const pageIds = eligibleVehiclesOnPage.map((vehicle) => vehicle.id);
    setSelectedVehicleIds((current) => {
      if (allEligibleOnPageSelected) {
        return current.filter((id) => !pageIds.includes(id));
      }
      const unselectedPageIds = pageIds.filter((id) => !current.includes(id));
      const availableSlots = Math.max(0, 100 - current.length);
      if (unselectedPageIds.length > availableSlots) {
        toast.error("Only the first 100 vehicles can be included in one payment batch.");
      }
      return [...current, ...unselectedPageIds.slice(0, availableSlots)];
    });
  };

  const downloadVehicleCsvTemplate = () => {
    const csv = "registration_number\r\nDL01AB1234\r\nDL02CD5678\r\n";
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vehicle-onboarding-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const downloadSingleRejection = () => {
    if (!singleRejectedVehicle) return;
    const quote = (value: string | null) => `"${(value ?? "").replaceAll('"', '""')}"`;
    const csv = `registration_number,category,rejection_reason\r\n${quote(singleRejectedVehicle.registrationNumber)},${quote(singleRejectedVehicle.category)},${quote(singleRejectedVehicle.rejectionReason)}\r\n`;
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "ineligible-vehicle.csv");
  };
  const downloadBulkRejections = () => {
    if (!vehicleImportResult || rejectedImportRows.length === 0) return;
    const quote = (value: string | number | null) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const lines = rejectedImportRows.map((row) =>
      [row.rowNumber, row.registrationNumber, row.category, row.message]
        .map(quote)
        .join(","),
    );
    const csv = `row_number,registration_number,category,rejection_reason\r\n${lines.join("\r\n")}\r\n`;
    downloadBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      `vehicle-import-${vehicleImportResult.id}-rejections.csv`,
    );
  };
  const uploadDriverCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const job = await importDrivers(file);
      await client.invalidateQueries({ queryKey: ["drivers"] });
      toast.success(`Driver import ${job.status}`, {
        description: `${job.acceptedRows} accepted, ${job.rejectedRows} rejected`,
      });
    } catch (failure) {
      setError(getErrorMessage(failure));
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Fleet onboarding</h1>
        <p className="text-sm text-muted-foreground">
          VAHAN/SARATHI validation followed by wallet funding
        </p>
        {vahanStatus.data && (
          <p
			className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
			  vahanStatus.data.configured
				? "bg-emerald-100 text-emerald-800"
				: "bg-destructive/10 text-destructive"
			}`}
          >
			{vahanStatus.data.configured
			  ? "Live VAHAN connected"
			  : "VAHAN configuration incomplete"}
          </p>
        )}
      </div>
      {declaration.data && (
        <section className="mb-5 rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Current fortnightly declaration
              </p>
              <h2 className="mt-1 font-semibold">
                {declaration.data.periodStart} to {declaration.data.periodEnd}
              </h2>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
              {declaration.data.status.replaceAll("_", " ")}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-6">
            <p>
              <b>{declaration.data.declaredFleetSize}</b>
              <span className="block text-xs text-muted-foreground">
                Licensed fleet limit
              </span>
            </p>
            <p>
              <b>{declaration.data.onboardedAgainstDeclaration}</b>
              <span className="block text-xs text-muted-foreground">
                Eligible slots used
              </span>
              <span className="block text-[10px] text-muted-foreground">
                Paid + awaiting payment
              </span>
            </p>
            <p>
              <b>{declaration.data.paidAndOnboardedVehicles}</b>
              <span className="block text-xs text-muted-foreground">
                Paid &amp; onboarded
              </span>
            </p>
            <p>
              <b>{declaration.data.remainingDeclarationCapacity}</b>
              <span className="block text-xs text-muted-foreground">Slots remaining</span>
            </p>
            <p>
              <b>{declaration.data.awaitingPaymentAgainstDeclaration}</b>
              <span className="block text-xs text-muted-foreground">
                Payment pending
              </span>
              <span className="block text-[10px] text-muted-foreground">
                All eligible vehicles
              </span>
            </p>
            <p>
              <b>{declaration.data.evPercentage}%</b>
              <span className="block text-xs text-muted-foreground">
                EV target {declaration.data.requiredEvPercentage}%
              </span>
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Current fortnight: {declaration.data.totalVehicles} retained vehicle records,
            {" "}{declaration.data.awaitingFunding} awaiting payment and {declaration.data.activeVehicles} activated.
            Ineligible uploads are skipped and never consume licensed fleet capacity.
          </p>
          {!declaration.data.evTargetMet && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
              The projected fleet is below the current electrification target.
              Add eligible EVs before funding additional non-EV vehicles.
            </p>
          )}
        </section>
      )}
      <div className="flex gap-2 mb-5">
        <Button
          variant={tab === "vehicle" ? "default" : "outline"}
          onClick={() => setTab("vehicle")}
        >
          <Car className="w-4 h-4 mr-2" />
          Vehicles
        </Button>
        <Button
          variant={tab === "driver" ? "default" : "outline"}
          onClick={() => setTab("driver")}
        >
          <UserRound className="w-4 h-4 mr-2" />
          Drivers
        </Button>
      </div>
      {error && (
        <div className="mb-5 border border-destructive/30 bg-destructive/5 rounded-lg p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {tab === "vehicle" ? (
        <>
          <section className="glass border rounded-xl p-5 mb-5">
            <h2 className="font-semibold mb-4">Add one vehicle</h2>
            <div className="grid sm:grid-cols-[1fr_120px_auto] gap-3">
              <Input
                placeholder="Registration number"
                value={registrationNumber}
                onChange={(e) =>
                  setRegistrationNumber(e.target.value.toUpperCase())
                }
              />
              <select
                className="border rounded-md bg-background px-3"
                value={category}
                onChange={(e) => setCategory(e.target.value as VehicleCategory)}
              >
                <option>2W</option>
                <option>3W</option>
                <option>4W</option>
              </select>
              <Button
                onClick={() => {
                  setError("");
                  vehicleMutation.mutate();
                }}
                disabled={!registrationNumber || vehicleMutation.isPending}
              >
                {vehicleMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Verify
              </Button>
            </div>
            {singleRejectedVehicle && (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-destructive">
                      {singleRejectedVehicle.registrationNumber} was skipped as ineligible
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {singleRejectedVehicle.rejectionReason ?? "The vehicle failed onboarding eligibility checks."}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This result is temporary. The vehicle was not saved and cannot be rechecked.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={downloadSingleRejection}>
                      <Download className="mr-1 h-4 w-4" /> Download result
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setSingleRejectedVehicle(null)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-5 rounded-xl border bg-muted/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <FileSpreadsheet className="h-4 w-4 text-primary" /> Bulk fleet CSV
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    UTF-8 CSV with one vehicle per row. Maximum 10,000 data rows.
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={downloadVehicleCsvTemplate}>
                  <Download className="mr-1 h-4 w-4" /> Download template
                </Button>
              </div>
              <div className="mt-3 grid gap-3 text-xs md:grid-cols-2">
                <div className="rounded-lg border bg-background p-3">
                  <b>Required column (exact header)</b>
                  <code className="mt-2 block rounded bg-muted px-2 py-1.5">
                    registration_number
                  </code>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
                    <li><b>registration_number:</b> Delhi RC number, for example DL01AB1234.</li>
                    <li>A category column is optional and ignored for eligibility; existing values such as 2WN, LMV and LGV are accepted.</li>
                    <li>VAHAN determines whether the vehicle is 2W, 3W or 4W.</li>
                    <li>Vehicles outside the categories selected in your issued licence are skipped with a row-level reason.</li>
                    <li>Do not repeat a registration number already in the portal or the same file.</li>
                  </ul>
                  <p className="mt-3 border-t pt-2 text-muted-foreground">
                    <b className="text-foreground">Annual fee:</b> EV ₹0; Petrol/CNG 2W ₹50, 3W ₹100,
                    4W ₹200. Vehicles under 2 years receive 50% discount, then the amount is prorated
                    for the remaining months through 31 March.
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <b>What happens after upload</b>
                  <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
                    <li>Each registration is fetched live from VAHAN.</li>
                    <li>Delhi state, RC, PUCC, insurance, fitness, tax, permit and challan are checked.</li>
                    <li>VAHAN fuel and registration date determine EV waiver or age-based fee.</li>
                    <li>Accepted rows enter this queue for Aggregator/DSP review and wallet payment.</li>
                    <li>Ineligible rows appear only in the rejection report and are not saved to your fleet.</li>
                  </ol>
                </div>
              </div>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary">
                <Upload className="h-4 w-4" /> Select and process CSV
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={uploadVehicleCsv} />
              </label>
              {vehicleImportResult && (
                <div className="mt-4 rounded-lg border bg-background p-3 text-xs">
                  <b>{vehicleImportResult.sourceFilename}</b>: {vehicleImportResult.status.replaceAll("_", " ")} · {" "}
                  {vehicleImportResult.acceptedRows} accepted, {vehicleImportResult.rejectedRows} rejected, {" "}
                  {Math.max(0, vehicleImportResult.totalRows - vehicleImportResult.acceptedRows - vehicleImportResult.rejectedRows)} remaining.
                  {vehicleImportResult.status !== "COMPLETED" && vehicleImportResult.processedRows > 0 && (
                    <span className="ml-1 text-muted-foreground">
                      {vehicleImportResult.rowsPerSecond} vehicles/s
                      {vehicleImportResult.duration && `  ${vehicleImportResult.duration} elapsed`}
                      {vehicleImportResult.estimatedSecondsRemaining != null &&
                        ` · approximately ${formatDuration(vehicleImportResult.estimatedSecondsRemaining)} remaining`}
                    </span>
                  )}
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${vehicleImportResult.totalRows > 0
                          ? Math.min(100, ((vehicleImportResult.acceptedRows + vehicleImportResult.rejectedRows) /
                              vehicleImportResult.totalRows) * 100)
                          : 0}%`,
                      }}
                    />
                  </div>
                  {vehicleImportResult.rows?.some((row) => row.status === "REJECTED") && (
                    <div className="mt-2 space-y-1 text-destructive">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span>
                          Ineligible rows were skipped and are not available for recheck. Download this temporary result before dismissing it.
                        </span>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={downloadBulkRejections}>
                            <Download className="mr-1 h-4 w-4" /> Download rejected rows
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setVehicleImportResult(null)}>
                            Dismiss
                          </Button>
                        </div>
                      </div>
                      {rejectedImportPages.pageItems.map((row) => (
                        <p key={row.rowNumber}>Row {row.rowNumber} · {row.registrationNumber || "blank"}: {row.message}</p>
                      ))}
                      <ListPagination
                        page={rejectedImportPages.page}
                        pageSize={rejectedImportPages.pageSize}
                        totalItems={rejectedImportPages.totalItems}
                        onPageChange={rejectedImportPages.setPage}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
          <section className="glass overflow-x-auto rounded-xl border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
              <div>
                <h2 className="font-semibold">Onboarding queue</h2>
                <span className="text-xs text-muted-foreground">
                  Select up to 100 funding-ready vehicles for one payment.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Wallet: ₹{wallet.data?.availableBalance ?? 0}</span>
                {selectedVehicleIds.length > 0 && (
                  <>
                    <span className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                      {selectedVehicleIds.length} selected · {fundingQuote.isLoading
                        ? "Calculating…"
                        : `Payable ₹${fundingQuote.data?.totalRequired ?? 0}`}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => setSelectedVehicleIds([])}>
                      Clear ({selectedVehicleIds.length})
                    </Button>
                  </>
                )}
              </div>
            </div>
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      aria-label="Select all funding-ready vehicles on this page"
                      checked={allEligibleOnPageSelected}
                      disabled={eligibleVehiclesOnPage.length === 0}
                      onChange={toggleCurrentPage}
                    />
                  </th>
                  <th className="p-3 text-left">Registration</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Declaration window</th>
                  <th className="p-3 text-left">Dynamic VAHAN details</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {vehiclePages.pageItems.map((vehicle) => (
                  <tr
                    className={`border-t ${
                      isPaymentReady(vehicle.status) ? "bg-emerald-50/40" : ""
                    }`}
                    key={vehicle.id}
                  >
                    <td className="p-3 align-top">
                      {isPaymentReady(vehicle.status) ? (
                        <input
                          type="checkbox"
                          aria-label={`Select ${vehicle.registrationNumber} for payment`}
                          checked={selectedVehicleIds.includes(vehicle.id)}
                          disabled={
                            !selectedVehicleIds.includes(vehicle.id) && selectedVehicleIds.length >= 100
                          }
                          onChange={() => toggleVehicleSelection(vehicle.id)}
                        />
                      ) : (
                        <span className="text-muted-foreground" aria-label="Not ready for payment">—</span>
                      )}
                    </td>
                    <td className="p-3 font-mono">
                      {vehicle.registrationNumber}
                    </td>
                    <td className="p-3">{vehicle.category}</td>
                    <td className="p-3 text-xs">
                      {vehicle.declarationPeriodStart}
                      <br />
                      to {vehicle.declarationPeriodEnd}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <b>
                          {isPaymentReady(vehicle.status)
                            ? "READY FOR PAYMENT"
                            : vehicle.status.replaceAll("_", " ")}
                        </b>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            vehicle.vahanSource === "VAHAN"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {vehicle.vahanSource === "VAHAN"
                            ? "LIVE VAHAN"
                            : vehicle.vahanSource ?? "SOURCE UNKNOWN"}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          RC status: {vehicle.vahanRegistrationStatus ?? "—"}
                        </span>
						<span>
						  Registration state: {vehicle.vahanStateCode ?? "Not provided"}
						</span>
                        <span>Class: {vehicle.vahanVehicleClass ?? "—"}</span>
                        <span>Fuel: {vehicle.vahanFuelType ?? "—"}</span>
                        <span>Registered: {vehicle.vahanRegistrationDate ?? "Not provided"}</span>
                        <span>EV: {vehicle.electric ? "Yes" : "No"}</span>
                        <span>
                          RC valid: {vehicle.registrationValidUntil ?? "—"}
                        </span>
                        <span>PUCC: {vehicle.pucValidUntil ?? "—"}</span>
                        <span>
                          Insurance: {vehicle.insuranceValidUntil ?? "—"}
                        </span>
						<span>
						  Fitness: {vehicle.fitnessValidUntil ?? "Not provided"}
						</span>
						<span>Tax: {vehicle.taxValidUntil ?? "Not provided"}</span>
						<span>
						  Permit: {vehicle.permitValidUntil ?? "Not provided"}
						</span>
                        <span>
						  Challan:{" "}
						  {vehicle.challanClear === null
							? "Not verified"
							: vehicle.challanClear
							  ? "Clear"
							  : "Outstanding"}
                          {vehicle.outstandingChallanAmount != null &&
                            ` · ₹${vehicle.outstandingChallanAmount}`}
                        </span>
                      </div>
                      {vehicle.vahanCheckedAt && (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Checked {new Date(vehicle.vahanCheckedAt).toLocaleString()}
                        </p>
                      )}
                      {vehicle.rejectionReason && (
                        <p className="mt-1 text-xs font-medium text-destructive">
                          {vehicle.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-start gap-2">
                        {isPaymentReady(vehicle.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              vahanRecheckMutation.isPending &&
                              vahanRecheckMutation.variables === vehicle.id
                            }
                            onClick={() =>
                              vahanRecheckMutation.mutate(vehicle.id)
                            }
                          >
                            <RefreshCw
                              className={`mr-1 h-3.5 w-3.5 ${
                                vahanRecheckMutation.isPending &&
                                vahanRecheckMutation.variables === vehicle.id
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                            Recheck VAHAN
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ListPagination
              page={vehiclePages.page}
              pageSize={vehiclePages.pageSize}
              totalItems={vehiclePages.totalItems}
              onPageChange={vehiclePages.setPage}
            />
          </section>
          {selectedVehicleIds.length > 0 && (
            <section className="mt-5 rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    Payment summary · {selectedVehicleIds.length} vehicle{selectedVehicleIds.length === 1 ? "" : "s"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    The registration bank guarantee already covers fleet security. Only the applicable annual vehicle fee is charged here. The batch is atomic: either every vehicle activates or none are charged.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVehicleIds([])}
                  className="rounded border px-2 py-1 text-xs"
                >
                  Close
                </button>
              </div>
              {fundingQuote.isLoading && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Calculating applicable annual vehicle fees…
                </p>
              )}
              {fundingQuote.isError && (
                <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {getErrorMessage(fundingQuote.error)}
                </p>
              )}
              {fundingQuote.data && (
                <>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <p>
                      <b>₹{fundingQuote.data.totalAnnualVehicleFee}</b>
                      <span className="block text-xs text-muted-foreground">
                        Payable annual fee
                      </span>
                    </p>
                    <p>
                      <b>₹{fundingQuote.data.availableBalance}</b>
                      <span className="block text-xs text-muted-foreground">
                        Wallet balance
                      </span>
                    </p>
                    <p>
                      <b>₹{fundingQuote.data.shortfall}</b>
                      <span className="block text-xs text-muted-foreground">
                        Shortfall
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[680px] text-xs">
                      <thead className="bg-muted/40 text-left">
                        <tr><th className="p-2">Vehicle</th><th className="p-2">Fuel</th><th className="p-2">Annual fee</th><th className="p-2">Calculation</th></tr>
                      </thead>
                      <tbody>
                        {fundingQuote.data.vehicles.map((quote) => (
                          <tr key={quote.vehicleId} className="border-t">
                            <td className="p-2 font-mono font-semibold">{registrationByVehicleId.get(quote.vehicleId) ?? quote.vehicleId}</td>
                            <td className="p-2">{quote.fuelType ?? "Not provided"}</td>
                            <td className="p-2">₹{quote.annualVehicleFee}</td>
                            <td className="max-w-sm p-2 text-muted-foreground">{quote.calculationRule}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {fundingQuote.data.sufficientBalance ? (
                    <Button
                      className="mt-4"
                      onClick={() => fundMutation.mutate(selectedVehicleIds)}
                      disabled={fundMutation.isPending}
                    >
                      {fundMutation.isPending
                        ? "Processing…"
                        : fundingQuote.data.totalRequired > 0
                          ? `Pay ₹${fundingQuote.data.totalRequired} and onboard ${selectedVehicleIds.length}`
                          : `Confirm and onboard ${selectedVehicleIds.length}`}
                    </Button>
                  ) : (
                    <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
                      <b className="text-sm text-amber-900">
                        Recharge wallet to pay the applicable annual vehicle fees
                      </b>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <Input
                          type="number"
                          min={Math.ceil(fundingQuote.data.shortfall)}
                          value={topUpAmount}
                          onChange={(e) =>
                            setTopUpAmount(Number(e.target.value))
                          }
                        />
                        <Button
                          variant="accent"
                          onClick={() => topUpMutation.mutate()}
                          disabled={
                            topUpAmount < fundingQuote.data.shortfall ||
                            topUpMutation.isPending
                          }
                        >
                          {topUpMutation.isPending
                            ? "Recharging…"
                            : "Recharge wallet"}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </>
      ) : (
        <>
          <section className="glass mb-5 rounded-xl border p-4 sm:p-5">
            <h2 className="mb-4 font-semibold">Add one driver</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Driving licence number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
              />
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  setError("");
                  driverMutation.mutate();
                }}
                disabled={!licenseNumber || driverMutation.isPending}
              >
                Verify with SARATHI
              </Button>
            </div>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-primary">
              <Upload className="h-4 w-4" />
              Import driver CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={uploadDriverCsv}
              />
            </label>
          </section>
          <section className="glass border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-3 text-left">Driver</th>
                  <th className="p-3 text-left">Licence</th>
                  <th className="p-3 text-left">Valid until</th>
                  <th className="p-3 text-left">PSV badge</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {driverPages.pageItems.map((driver) => (
                  <tr className="border-t" key={driver.id}>
                    <td className="p-3">
                      {driver.driverName ?? "Pending verification"}
                    </td>
                    <td className="p-3 font-mono">{driver.licenseNumber}</td>
                    <td className="p-3">{driver.licenseValidUntil ?? "—"}</td>
                    <td className="p-3">{driver.psvBadgeNumber ?? "—"}</td>
                    <td className="p-3">
                      {driver.status.replaceAll("_", " ")}
                      {driver.rejectionReason && (
                        <p className="text-xs text-destructive">
                          {driver.rejectionReason}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ListPagination
              page={driverPages.page}
              pageSize={driverPages.pageSize}
              totalItems={driverPages.totalItems}
              onPageChange={driverPages.setPage}
            />
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
