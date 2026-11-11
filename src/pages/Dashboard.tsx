import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  Car,
  Check,
  Clock,
  CreditCard,
  FileText,
  Layers,
  LayoutDashboard,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboard } from "@/services/dashboardService";
import { getMyVehicles } from "@/services/vehicleService";
import { getMyDrivers } from "@/services/driverService";
import { getErrorMessage } from "@/services/api";

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    value,
  );
const total = (values?: Record<string, number>) =>
  Object.values(values ?? {}).reduce((sum, value) => sum + value, 0);

interface DonutPayloadItem {
  color: string;
  name: string;
  shortName: string;
  count: number;
  percentage: number;
  feeRateLabel: string;
  totalAnnualFee: number;
}

const CustomDonutTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DonutPayloadItem }>;
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="relative z-50 pointer-events-none select-none rounded-xl border bg-card/95 backdrop-blur-md p-3 shadow-2xl text-xs border-border">
        <div className="flex items-center gap-2 mb-1.5 font-bold text-foreground">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.name}</span>
        </div>
        <div className="space-y-1 text-[11px] text-muted-foreground">
          <div className="flex justify-between gap-4">
            <span>Fleet Count:</span>
            <b className="text-foreground">
              {item.count.toLocaleString("en-IN")} ({item.percentage}%)
            </b>
          </div>
          <div className="flex justify-between gap-4">
            <span>Official Annual Fee:</span>
            <b className="text-foreground">{item.feeRateLabel}</b>
          </div>
          <div className="flex justify-between gap-4 border-t pt-1 text-foreground font-semibold">
            <span>Annual Fee Payable:</span>
            <span>{money(item.totalAnnualFee)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomExpiryTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const valid = payload.find((p) => p.dataKey === "valid")?.value ?? 0;
    const expiringSoon =
      payload.find((p) => p.dataKey === "expiringSoon")?.value ?? 0;
    const expired = payload.find((p) => p.dataKey === "expired")?.value ?? 0;
    const totalCount = valid + expiringSoon + expired;
    return (
      <div className="relative z-50 pointer-events-none select-none rounded-xl border bg-card/95 backdrop-blur-md p-3 shadow-2xl text-xs border-border min-w-[200px]">
        <p className="font-bold text-foreground border-b pb-1 mb-2">{label}</p>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Valid &
              Healthy:
            </span>
            <b>{valid.toLocaleString("en-IN")}</b>
          </div>
          <div className="flex items-center justify-between gap-3 text-amber-600 dark:text-amber-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Expiring
              &lt;30d:
            </span>
            <b>{expiringSoon.toLocaleString("en-IN")}</b>
          </div>
          <div className="flex items-center justify-between gap-3 text-destructive font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Expired /
              Blocked:
            </span>
            <b>{expired.toLocaleString("en-IN")}</b>
          </div>
          {totalCount > 0 && (
            <div className="border-t pt-1 flex justify-between text-muted-foreground text-[10px]">
              <span>Compliance Rate:</span>
              <b className="text-foreground">
                {Math.round((valid / totalCount) * 100)}%
              </b>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { auth } = useAuth();
  const dashboard = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });
  const data = dashboard.data;
  const isOperator = auth.role === "aggregator" || auth.role === "dsp";

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],
    queryFn: getMyVehicles,
    enabled: isOperator,
  });
  const driversQuery = useQuery({
    queryKey: ["drivers"],
    queryFn: getMyDrivers,
    enabled: isOperator,
  });

  const rawVehicles = vehiclesQuery.data ?? [];
  const rawDrivers = driversQuery.data ?? [];
  const [isPieHovered, setIsPieHovered] = useState(false);

  if (isOperator && dashboard.data) {
    const isLicensed =
      Boolean(data?.licenseNumber) || data?.licenseStatus === "ACTIVE";
    if (!isLicensed) {
      return <Navigate to="/applications" replace />;
    }
  }

  const totalDrivers = total(data?.drivers);
  const totalVehicles = total(data?.vehicles);
  const isNewOperator = (data?.paidAndOnboardedVehicles ?? 0) === 0;

  // Fleet category breakdown & official Annual Fee schedule (Chart 1)
  const categoryData = useMemo(() => {
    const liveCount = rawVehicles.length;
    if (liveCount > 0) {
      const v2W = rawVehicles.filter((v) => v.category === "2W");
      const v3W = rawVehicles.filter((v) => v.category === "3W");
      const vGoods = rawVehicles.filter(
        (v) =>
          v.vahanVehicleClass?.toUpperCase().includes("GOODS") ||
          v.vahanVehicleClass?.toUpperCase().includes("CARGO"),
      );
      const v4W = rawVehicles.filter(
        (v) =>
          v.category === "4W" &&
          !v.vahanVehicleClass?.toUpperCase().includes("GOODS") &&
          !v.vahanVehicleClass?.toUpperCase().includes("CARGO"),
      );

      // Gazette Annual Fee rules:
      // Electric: ₹0 for all categories
      // 2W: Petrol: ₹50
      // 3W: CNG: ₹80, Petrol/Other: ₹100
      // 4W Passenger M1 (Cab): CNG: ₹120, Petrol: ₹150 (Default ₹120 for non-electric cabs)
      // 4W Carrier N1 (Goods Cargo): CNG: ₹150, Petrol: ₹200 (Default ₹150 for non-electric cargo)
      const calcFee2W = v2W.reduce((sum, v) => (v.electric ? sum : sum + 50), 0);
      const calcFee3W = v3W.reduce(
        (sum, v) =>
          v.electric
            ? sum
            : v.vahanFuelType?.toUpperCase().includes("PETROL")
              ? sum + 100
              : sum + 80,
        0,
      );
      const calcFee4W = v4W.reduce(
        (sum, v) =>
          v.electric
            ? sum
            : v.vahanFuelType?.toUpperCase().includes("PETROL")
              ? sum + 150
              : sum + 120,
        0,
      );
      const calcFeeGoods = vGoods.reduce(
        (sum, v) =>
          v.electric
            ? sum
            : v.vahanFuelType?.toUpperCase().includes("PETROL")
              ? sum + 200
              : sum + 150,
        0,
      );

      const items: DonutPayloadItem[] = [
        {
          name: "Two-Wheeler (Delivery/Bike)",
          shortName: "2W Delivery/Bike",
          count: v2W.length,
          percentage: Math.round((v2W.length / liveCount) * 100),
          feeRateLabel: "₹50/yr (EV: ₹0)",
          totalAnnualFee: calcFee2W,
          color: "#3b82f6",
        },
        {
          name: "Three-Wheeler (Passenger / Auto)",
          shortName: "3W Auto-rickshaw",
          count: v3W.length,
          percentage: Math.round((v3W.length / liveCount) * 100),
          feeRateLabel: "₹80/yr (EV: ₹0)",
          totalAnnualFee: calcFee3W,
          color: "#f59e0b",
        },
        {
          name: "Four-Wheeler (Passenger, M1 Cab/Taxi)",
          shortName: "4W Cab / Taxi",
          count: v4W.length,
          percentage: Math.round((v4W.length / liveCount) * 100),
          feeRateLabel: "₹120-150/yr (EV: ₹0)",
          totalAnnualFee: calcFee4W,
          color: "#10b981",
        },
        {
          name: "Four-Wheeler (Carrier, N1 Goods/Cargo)",
          shortName: "Goods / Cargo LCV",
          count: vGoods.length,
          percentage: Math.round((vGoods.length / liveCount) * 100),
          feeRateLabel: "₹150-200/yr (EV: ₹0)",
          totalAnnualFee: calcFeeGoods,
          color: "#8b5cf6",
        },
      ];
      return { isLive: true, totalCount: liveCount, items };
    }

    // Default declared quota distribution when live onboarded is 0
    const declaredTotal = data?.declaredFleetSize || 260000;
    const count2W = Math.round(declaredTotal * 0.5);
    const count3W = Math.round(declaredTotal * 0.15);
    const count4W = Math.round(declaredTotal * 0.3);
    const countGoods = declaredTotal - count2W - count3W - count4W;

    const items: DonutPayloadItem[] = [
      {
        name: "Two-Wheeler (Delivery/Bike)",
        shortName: "2W Delivery/Bike",
        count: count2W,
        percentage: 50,
        feeRateLabel: "₹50/yr (EV: ₹0)",
        totalAnnualFee: count2W * 50,
        color: "#3b82f6",
      },
      {
        name: "Three-Wheeler (Passenger / Auto)",
        shortName: "3W Auto-rickshaw",
        count: count3W,
        percentage: 15,
        feeRateLabel: "₹80/yr (EV: ₹0)",
        totalAnnualFee: count3W * 80,
        color: "#f59e0b",
      },
      {
        name: "Four-Wheeler (Passenger, M1 Cab/Taxi)",
        shortName: "4W Cab / Taxi",
        count: count4W,
        percentage: 30,
        feeRateLabel: "₹120-150/yr (EV: ₹0)",
        totalAnnualFee: count4W * 120,
        color: "#10b981",
      },
      {
        name: "Four-Wheeler (Carrier, N1 Goods/Cargo)",
        shortName: "Goods / Cargo LCV",
        count: countGoods,
        percentage: 5,
        feeRateLabel: "₹150-200/yr (EV: ₹0)",
        totalAnnualFee: countGoods * 150,
        color: "#8b5cf6",
      },
    ];
    return { isLive: false, totalCount: declaredTotal, items };
  }, [rawVehicles, data?.declaredFleetSize]);

  const totalAnnualFeeLiability = useMemo(
    () =>
      categoryData.items.reduce((sum, item) => sum + item.totalAnnualFee, 0),
    [categoryData],
  );

  // Document expiry radar data (Chart 2)
  const expiryData = useMemo(() => {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const evaluateExpiry = (dates: (string | null | undefined)[]) => {
      let valid = 0;
      let expiringSoon = 0;
      let expired = 0;

      for (const d of dates) {
        if (!d) {
          expired++;
        } else {
          const date = new Date(d);
          if (isNaN(date.getTime()) || date < now) {
            expired++;
          } else if (date <= in30Days) {
            expiringSoon++;
          } else {
            valid++;
          }
        }
      }
      return { valid, expiringSoon, expired };
    };

    if (rawVehicles.length > 0 || rawDrivers.length > 0) {
      const pucStats = evaluateExpiry(rawVehicles.map((v) => v.pucValidUntil));
      const fitnessStats = evaluateExpiry(
        rawVehicles.map((v) => v.fitnessValidUntil),
      );
      const insuranceStats = evaluateExpiry(
        rawVehicles.map((v) => v.insuranceValidUntil),
      );
      const psvStats = evaluateExpiry(
        rawDrivers.map((d) => d.psvBadgeValidUntil),
      );

      return {
        isLive: true,
        totalExpired:
          pucStats.expired +
          fitnessStats.expired +
          insuranceStats.expired +
          psvStats.expired,
        totalExpiringSoon:
          pucStats.expiringSoon +
          fitnessStats.expiringSoon +
          insuranceStats.expiringSoon +
          psvStats.expiringSoon,
        rows: [
          { category: "PUCC (Pollution)", ...pucStats },
          { category: "Fitness Certificate", ...fitnessStats },
          { category: "Commercial Insurance", ...insuranceStats },
          { category: "Driver PSV Badges", ...psvStats },
        ],
      };
    }

    // Baseline preview representation when fleet is not yet uploaded
    return {
      isLive: false,
      totalExpired: 0,
      totalExpiringSoon: 0,
      rows: [
        { category: "PUCC (Pollution)", valid: 100, expiringSoon: 0, expired: 0 },
        { category: "Fitness Certificate", valid: 100, expiringSoon: 0, expired: 0 },
        {
          category: "Commercial Insurance",
          valid: 100,
          expiringSoon: 0,
          expired: 0,
        },
        { category: "Driver PSV Badges", valid: 100, expiringSoon: 0, expired: 0 },
      ],
    };
  }, [rawVehicles, rawDrivers]);

  return (
    <DashboardLayout>
      {/* Official Delhi Government Transport Department Ribbon & Active Licence Showcase */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs mb-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs">
                <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                OFFICIAL 5-YEAR OPERATING LICENCE ACTIVE
              </span>
              <span className="font-mono text-xs font-semibold rounded-md bg-muted px-2.5 py-1 text-muted-foreground border">
                {data?.licenseNumber ?? "LIC-DL-2026-6AFBF1BD"}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Welcome, {auth.user?.name ?? "Aggregator"}
            </h1>

            {/* <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Authorized Aggregator under <b>Delhi Motor Vehicle Aggregator and Delivery Service Provider Scheme, 2023</b>. Valid until{" "}
              <b className="text-foreground">
                {data?.licenseValidUntil
                  ? new Date(data.licenseValidUntil).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "04 Nov 2031"}
              </b> · Bank Guarantee of <b className="text-foreground">{money(data?.bankGuaranteeAmount)}</b> secured with Transport Department.
            </p> */}
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link to="/applications">
              <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold h-9 shadow-2xs">
                <FileText className="h-4 w-4 text-primary" />
                View Application Dossier
              </Button>
            </Link>
            {/* <Link to="/onboarding">
              <Button size="sm" className="gap-2 text-xs font-semibold h-9 shadow-xs">
                <Upload className="h-4 w-4" />
                Onboard Fleet
              </Button>
            </Link> */}
          </div>
        </div>
      </div>

      {dashboard.isError && (
        <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {getErrorMessage(dashboard.error, "Dashboard could not be loaded.")}
        </div>
      )}

      {/* 4 High-Impact KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Fleet Capacity */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fleet Capacity</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Car className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-heading text-foreground">
              {data?.paidAndOnboardedVehicles ?? 0} <span className="text-sm font-normal text-muted-foreground">/ {data?.declaredFleetSize?.toLocaleString("en-IN") ?? "0"}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(data?.remainingFleetCapacity ?? data?.declaredFleetSize ?? 0).toLocaleString("en-IN")} declaration slots available
            </p>
          </div>
        </div>

        {/* Metric 2: Verified Drivers */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verified Drivers</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-heading text-foreground">
              {totalDrivers}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data?.drivers?.ACTIVE ?? 0} active on Delhi Sarathi Registry
            </p>
          </div>
        </div>

        {/* Metric 3: Security & Operational Wallet */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Compliance Wallet</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-heading text-foreground">
              {money(data?.walletAvailableBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {money(data?.walletHeldBalance)} held in vehicle security
            </p>
          </div>
        </div>

        {/* Metric 4: Compliance Health */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Compliance Health</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-heading text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              100% <span className="text-xs font-normal text-muted-foreground">Good Standing</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data?.criticalComplianceAlerts ?? 0} open compliance notices
            </p>
          </div>
        </div>
      </div>

      {/* Fleet Analytics: Category Composition & Document Expiry Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Chart 1: Fleet Category Composition & Annual Fee Schedule */}
        <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">
                    Fleet Composition by Category
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Vehicle mix & official annual fee schedule
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  categoryData.isLive
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {categoryData.isLive
                  ? "Live Fleet Roster"
                  : "Declared Quota Allocation"}
              </span>
            </div>

            {/* Donut Chart + Breakdown List */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-5 relative h-[185px] flex items-center justify-center">
                {/* Center Label in Donut: strictly behind SVG with z-0 and fades on slice hover */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 transition-opacity duration-200 ${
                    isPieHovered ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
                    {categoryData.isLive ? "Onboarded" : "Capacity"}
                  </span>
                  <span className="text-sm font-bold font-heading text-foreground">
                    {categoryData.isLive
                      ? categoryData.totalCount.toLocaleString("en-IN")
                      : `${(categoryData.totalCount / 1000).toFixed(0)}k`}
                  </span>
                </div>

                <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                  <PieChart>
                    <Pie
                      data={categoryData.items}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="name"
                      onMouseEnter={() => setIsPieHovered(true)}
                      onMouseLeave={() => setIsPieHovered(false)}
                    >
                      {categoryData.items.map((entry, index) => (
                        <Cell key={`donut-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      wrapperStyle={{ zIndex: 50, outline: "none", pointerEvents: "none" }}
                      content={<CustomDonutTooltip />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Slices Legend & Fee Rates */}
              <div className="sm:col-span-7 space-y-2">
                {categoryData.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-foreground truncate text-[11px] sm:text-xs">
                        {item.shortName}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {categoryData.isLive
                          ? item.count.toLocaleString("en-IN")
                          : `${item.percentage}%`}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                        {item.feeRateLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Annual Fee Bar */}
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="text-muted-foreground text-[11px]">
              Total Annual Fee Payable:{" "}
              <b className="text-foreground">{money(totalAnnualFeeLiability)}</b>
              <span className="text-[10px] text-muted-foreground ml-1.5">(Electric vehicles: ₹0 fee)</span>
            </span>
            <Link
              to="/fleet"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1 text-[11px]"
            >
              Inspect Fleet Roster <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Chart 2: Document Expiry Radar */}
        <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">
                    Document Expiry Radar
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Continuous VAHAN & Sarathi compliance tracking
                  </p>
                </div>
              </div>

              {/* Status Indicator Legend */}
              <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Valid
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> &lt;30d Expiring
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Expired
                </span>
              </div>
            </div>

            {/* Stacked Horizontal Bar Chart */}
            <div className="h-[185px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expiryData.rows}
                  layout="vertical"
                  margin={{ top: 4, right: 10, left: 10, bottom: 4 }}
                  barSize={15}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "currentColor", fontSize: 11 }}
                    width={130}
                  />
                  <Tooltip
                    wrapperStyle={{ zIndex: 50, outline: "none", pointerEvents: "none" }}
                    content={<CustomExpiryTooltip />}
                  />
                  <Bar
                    dataKey="valid"
                    name="Valid & Compliant"
                    stackId="radarStack"
                    fill="#10b981"
                  />
                  <Bar
                    dataKey="expiringSoon"
                    name="Expiring <30d"
                    stackId="radarStack"
                    fill="#f59e0b"
                  />
                  <Bar
                    dataKey="expired"
                    name="Expired / Defective"
                    stackId="radarStack"
                    fill="#ef4444"
                    radius={[0, 3, 3, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Health Banner */}
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              {expiryData.totalExpired > 0 ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <span className="text-destructive font-semibold">
                    {expiryData.totalExpired} record(s) flagged expired — immediate offboarding risk.
                  </span>
                </>
              ) : expiryData.totalExpiringSoon > 0 ? (
                <>
                  <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    {expiryData.totalExpiringSoon} document(s) expiring within 30 days — renewal notice active.
                  </span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-foreground font-medium">
                    100% Verified Clearance · Automated 24/7 VAHAN verification active.
                  </span>
                </>
              )}
            </span>
            <Link
              to="/ev-compliance"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1 text-[11px]"
            >
              Compliance Desk <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3-Step Getting Started Launchpad (Highly Approachable & Actionable) */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs mb-6">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3.5 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Aggregator Getting Started Guide
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Complete the 3 steps to commence fleet operations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: Vehicles */}
          <div className="rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 p-4 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                  Step 1 · Vehicles
                </span>
                <Car className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground">Onboard Commercial Fleet</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add vehicles via single entry or batch CSV for real-time VAHAN registration, fitness, and pollution compliance check.
              </p>
            </div>
            <Link to="/onboarding">
              <Button size="sm" className="w-full gap-1.5 text-xs font-semibold h-8 shadow-xs">
                <Upload className="h-3.5 w-3.5" /> Start Vehicle Onboarding
              </Button>
            </Link>
          </div>

          {/* Action 2: Drivers */}
          <div className="rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 p-4 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
                  Step 2 · Drivers
                </span>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground">Enroll Certified Drivers</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Verify driver credentials via Sarathi DL registry, commercial PSV badge validation, and police verification status.
              </p>
            </div>
            <Link to="/onboarding">
              <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs font-semibold h-8 shadow-2xs">
                <UserCheck className="h-3.5 w-3.5" /> Enroll Drivers
              </Button>
            </Link>
          </div>

          {/* Action 3: Wallet */}
          <div className="rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 p-4 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                  Step 3 · Wallet
                </span>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground">Fund Security Wallet</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Maintain operational wallet balance to cover vehicle security deposits and per-trip welfare cess seamlessly.
              </p>
            </div>
            <Link to="/wallet">
              <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs font-semibold h-8 shadow-2xs">
                <CreditCard className="h-3.5 w-3.5" /> Top Up Wallet
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Two-Column Grid: Pipeline & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Fleet Capacity & Verification Funnel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-2">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">Licensed Fleet Capacity & Progress</h3>
                <p className="text-xs text-muted-foreground"></p>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {((data?.paidAndOnboardedVehicles ?? 0) / (data?.declaredFleetSize || 1) * 100).toFixed(1)}% Active
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Declared Capacity Utilization</span>
                <span className="font-bold text-foreground">
                  {data?.paidAndOnboardedVehicles ?? 0} of {data?.declaredFleetSize?.toLocaleString("en-IN") ?? 0} Vehicles
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      data?.declaredFleetSize
                        ? ((data.fleetCapacityUsed ?? 0) / data.declaredFleetSize) * 100
                        : 0,
                    )}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>{data?.paidAndOnboardedVehicles ?? 0} Onboarded & Paid</span>
                <span>{(data?.remainingFleetCapacity ?? data?.declaredFleetSize ?? 0).toLocaleString("en-IN")} Slots Available</span>
              </div>
            </div>

            {/* Fleet & Driver Lifecycle State (Granular Approachable Table View) */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Fleet & Driver Lifecycle State
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Detailed status breakdown across VAHAN & Sarathi registries
                  </p>
                </div>
                <Link
                  to="/fleet"
                  className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                >
                  View Full Fleet <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicles Column Table */}
                <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/30 border-b border-border/70">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5 text-muted-foreground" />
                      Vehicles
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {totalVehicles.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="divide-y divide-border/40 text-xs">
                    <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Imported</span>
                      <span className="font-mono font-semibold text-foreground">{data?.vehicles?.IMPORTED ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">VAHAN Verified</span>
                      <span className="font-mono font-semibold text-foreground">{data?.vehicles?.VAHAN_VERIFIED ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Rejected</span>
                      <span className="font-mono font-semibold text-foreground">{data?.vehicles?.REJECTED ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Security Deposit Required</span>
                      <span className="font-mono font-semibold text-foreground">{data?.vehicles?.SECURITY_DEPOSIT_REQUIRED ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Payment Required</span>
                      <span className="font-mono font-semibold text-foreground">{data?.vehicles?.PAYMENT_REQUIRED ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Active</span>
                      <span className="font-mono font-semibold text-foreground">{data?.vehicles?.ACTIVE ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/30 transition-colors">
                      <span className="text-muted-foreground">Offboarded</span>
                      <span className="font-mono font-semibold text-foreground">{data?.vehicles?.OFFBOARDED ?? 0}</span>
                    </div>
                  </div>
                </div>

                {/* Drivers Column Table */}
                <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/30 border-b border-border/70">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        Drivers
                      </span>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {totalDrivers.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="divide-y divide-border/40 text-xs">
                      <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/30 transition-colors">
                        <span className="text-muted-foreground">Pending Sarathi</span>
                        <span className="font-mono font-semibold text-foreground">{data?.drivers?.PENDING_SARATHI ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/30 transition-colors">
                        <span className="text-muted-foreground">Rejected</span>
                        <span className="font-mono font-semibold text-foreground">{data?.drivers?.REJECTED ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/30 transition-colors">
                        <span className="text-muted-foreground">Active</span>
                        <span className="font-mono font-semibold text-foreground">{data?.drivers?.ACTIVE ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between px-3.5 py-2 hover:bg-muted/30 transition-colors">
                        <span className="text-muted-foreground">Offboarded</span>
                        <span className="font-mono font-semibold text-foreground">{data?.drivers?.OFFBOARDED ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Bottom Bar */}
                  <div className="px-3.5 py-2.5 bg-muted/20 border-t border-border/60 mt-auto flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Sarathi DL registry status</span>
                    <Link to="/onboarding" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                      Enroll Drivers <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Scheme Directives & Helpdesk */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading font-bold text-base text-foreground">Scheme Guidelines & Helpdesk</h3>
              <span className="text-xs font-semibold text-primary">NCT Delhi</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border p-3 bg-muted/20 space-y-1">
                <b className="text-foreground block">Delhi EV Transition Policy Mandate</b>
                <p className="text-muted-foreground leading-relaxed">
                  All commercial onboarding for 2W & 3W fleets must comply with zero-emission electrification milestones.
                </p>
                <Link to="/ev-compliance" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline pt-1">
                  View EV Target Tracker <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-xl border p-3 bg-muted/20 space-y-1">
                <b className="text-foreground block">Official Notices & Circulars</b>
                <p className="text-muted-foreground leading-relaxed">
                  {data?.unreadNotifications
                    ? `${data.unreadNotifications} unread regulatory notification(s) published.`
                    : "No pending objections or regulatory compliance memos."}
                </p>
                <Link to="/notifications" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline pt-1">
                  Open Notifications Desk <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" /> Helpdesk: 011-2399-7777
              </span>
              <Link to="/help" className="hover:underline font-medium text-foreground">
                FAQs & Guidelines
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
