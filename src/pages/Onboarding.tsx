import { ChangeEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Car, Loader2, RefreshCw, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/services/api";
import {
  getCurrentFleetDeclaration,
  getVahanIntegrationStatus,
  getMyVehicles,
  importVehicles,
  onboardVehicle,
  recheckVehicleVahan,
  VehicleCategory,
} from "@/services/vehicleService";
import {
  getMyDrivers,
  importDrivers,
  onboardDriver,
} from "@/services/driverService";
import {
  completeDevelopmentPayment,
  createTopUp,
  fundVehicle,
  getVehicleFundingQuote,
  getWallet,
} from "@/services/walletService";

export default function Onboarding() {
  const client = useQueryClient();
  const [tab, setTab] = useState<"vehicle" | "driver">("vehicle");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [category, setCategory] = useState<VehicleCategory>("4W");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [error, setError] = useState("");
  const [fundingVehicleId, setFundingVehicleId] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState(5000);
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: getMyVehicles });
  const drivers = useQuery({ queryKey: ["drivers"], queryFn: getMyDrivers });
  const wallet = useQuery({ queryKey: ["wallet"], queryFn: getWallet });
  const declaration = useQuery({
    queryKey: ["fleet-declaration-window"],
    queryFn: getCurrentFleetDeclaration,
  });
  const vahanStatus = useQuery({
    queryKey: ["vahan-integration-status"],
    queryFn: getVahanIntegrationStatus,
  });
  const fundingQuote = useQuery({
    queryKey: ["vehicle-funding-quote", fundingVehicleId],
    queryFn: () => getVehicleFundingQuote(fundingVehicleId!),
    enabled: Boolean(fundingVehicleId),
  });

  const vehicleMutation = useMutation({
    mutationFn: () => onboardVehicle(registrationNumber, category),
    onSuccess: (vehicle) => {
      setRegistrationNumber("");
      client.invalidateQueries({ queryKey: ["vehicles"] });
      client.invalidateQueries({ queryKey: ["fleet-declaration-window"] });
      if (vehicle.status === "SECURITY_DEPOSIT_REQUIRED")
        setFundingVehicleId(vehicle.id);
      toast.success(`VAHAN check: ${vehicle.status.replaceAll("_", " ")}`);
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
    mutationFn: fundVehicle,
    onSuccess: () => {
      setFundingVehicleId(null);
      client.invalidateQueries({ queryKey: ["vehicles"] });
      client.invalidateQueries({ queryKey: ["wallet"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      client.invalidateQueries({ queryKey: ["fleet-declaration-window"] });
      toast.success("Vehicle funded and activated");
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
        queryKey: ["vehicle-funding-quote", fundingVehicleId],
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
      await client.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(`Vehicle import ${job.status}`, {
        description: `${job.acceptedRows} accepted, ${job.rejectedRows} rejected`,
      });
    } catch (failure) {
      setError(getErrorMessage(failure));
    }
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
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
            <p>
              <b>{declaration.data.totalVehicles}</b>
              <span className="block text-xs text-muted-foreground">
                Declared
              </span>
            </p>
            <p>
              <b>{declaration.data.activeVehicles}</b>
              <span className="block text-xs text-muted-foreground">
                Onboarded
              </span>
            </p>
            <p>
              <b>{declaration.data.awaitingFunding}</b>
              <span className="block text-xs text-muted-foreground">
                SD/payment pending
              </span>
            </p>
            <p>
              <b>{declaration.data.rejectedVehicles}</b>
              <span className="block text-xs text-muted-foreground">
                Not fit
              </span>
            </p>
            <p>
              <b>{declaration.data.evPercentage}%</b>
              <span className="block text-xs text-muted-foreground">
                EV target {declaration.data.requiredEvPercentage}%
              </span>
            </p>
          </div>
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
            <label className="inline-flex items-center gap-2 mt-4 text-sm cursor-pointer text-primary">
              <Upload className="w-4 h-4" />
              Import vehicle CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={uploadVehicleCsv}
              />
            </label>
          </section>
          <section className="glass overflow-x-auto rounded-xl border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
              <h2 className="font-semibold">Onboarding queue</h2>
              <span className="text-sm text-muted-foreground">
                Wallet: ₹{wallet.data?.availableBalance ?? 0}
              </span>
            </div>
            <table className="w-full min-w-[1040px] text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-3 text-left">Registration</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Declaration window</th>
                  <th className="p-3 text-left">Dynamic VAHAN details</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.data?.map((vehicle) => (
                  <tr className="border-t" key={vehicle.id}>
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
                        <b>{vehicle.status.replaceAll("_", " ")}</b>
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
                        {vehicle.status === "SECURITY_DEPOSIT_REQUIRED" && (
                          <Button
                            size="sm"
                            onClick={() => setFundingVehicleId(vehicle.id)}
                          >
                            Review SD & payment
                          </Button>
                        )}
                        {(vehicle.status === "REJECTED" ||
                          vehicle.status === "SECURITY_DEPOSIT_REQUIRED") && (
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
          </section>
          {fundingVehicleId && (
            <section className="mt-5 rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    Security deposit and wallet payment
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    The vehicle activates only after the required SD is held and
                    the onboarding fee is paid.
                  </p>
                </div>
                <button
                  onClick={() => setFundingVehicleId(null)}
                  className="rounded border px-2 py-1 text-xs"
                >
                  Close
                </button>
              </div>
              {fundingQuote.isLoading && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Calculating fleet security deposit…
                </p>
              )}
              {fundingQuote.data && (
                <>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                    <p>
                      <b>₹{fundingQuote.data.securityDeposit}</b>
                      <span className="block text-xs text-muted-foreground">
                        Required SD
                      </span>
                    </p>
                    <p>
                      <b>₹{fundingQuote.data.onboardingFee}</b>
                      <span className="block text-xs text-muted-foreground">
                        Onboarding fee
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
                  {fundingQuote.data.sufficientBalance ? (
                    <Button
                      className="mt-4"
                      onClick={() => fundMutation.mutate(fundingVehicleId)}
                      disabled={fundMutation.isPending}
                    >
                      {fundMutation.isPending
                        ? "Processing…"
                        : "Pay through wallet and onboard"}
                    </Button>
                  ) : (
                    <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
                      <b className="text-sm text-amber-900">
                        Recharge wallet to revise the available security deposit
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
                {drivers.data?.map((driver) => (
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
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
