import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileText,
  Gauge,
  Leaf,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Target,
  Upload,
  WalletCards,
  Zap,
} from "lucide-react";
import heroIllustration from "@/assets/delhiev_new.jpeg";
import collageIllustration from "@/assets/Aggregator poster.png";
import aggregatorPolicy from "@/assets/Delhi Aggregator Scheme 2023_1.pdf";
import {
  getPublicEvAdoption,
  listPublicContent,
  type ContentSection,
  type PortalContentItem,
} from "@/services/contentService";

function Deadline() {
  const calculate = () => {
    const remaining = Math.max(
      0,
      new Date("2030-01-01T00:00:00+05:30").getTime() - Date.now(),
    );
    return {
      days: Math.floor(remaining / 86_400_000),
      hours: Math.floor((remaining / 3_600_000) % 24),
      minutes: Math.floor((remaining / 60_000) % 60),
      seconds: Math.floor((remaining / 1_000) % 60),
    };
  };
  const [value, setValue] = useState(calculate);
  useEffect(() => {
    const timer = window.setInterval(() => setValue(calculate()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="font-display flex items-end justify-center gap-1.5 font-bold">
      {Object.entries(value).map(([unit, number], index) => (
        <span key={unit} className="contents">
          <span>
            <b className="text-xl md:text-2xl">
              {number.toString().padStart(index ? 2 : 1, "0")}
            </b>
            <small className="ml-0.5 text-[8px] uppercase text-white/60">
              {unit[0]}
            </small>
          </span>
          {index < 3 && <i className="pb-1 not-italic text-white/30">:</i>}
        </span>
      ))}
    </div>
  );
}

const defaultServices = [
  {
    icon: ShieldCheck,
    title: "Licence management",
    text: "Apply, review and track the complete five-year licence lifecycle.",
  },
  {
    icon: Car,
    title: "Fleet registration",
    text: "Validate vehicles and drivers through VAHAN and SARATHI.",
  },
  {
    icon: Leaf,
    title: "EV compliance tracker",
    text: "Monitor continuous policy findings and system offboarding.",
  },
  {
    icon: WalletCards,
    title: "Fee and wallet system",
    text: "Recharge, fund deposits and pay monetary penalties.",
  },
];

const defaultMilestones = [
  { period: "6 months", value: "5%", icon: Clock3 },
  { period: "1 year", value: "15%", icon: Zap },
  { period: "2 years", value: "25%", icon: Car },
  { period: "3 years", value: "50%", icon: BarChart3, current: true },
  { period: "4 years", value: "75%", icon: ShieldCheck },
  { period: "5 years", value: "100%", icon: Target },
  { period: "2030", value: "100% EV", icon: Leaf, final: true },
];

const defaultFaqs = [
  [
    "Who can register on the portal?",
    "Aggregator and delivery service provider organisations operating more than 25 motor vehicles can create an applicant account and submit a licence application.",
  ],
  [
    "Which documents are required?",
    "Company registration, GST certificate, PAN certificate and the prescribed bank guarantee are mandatory before an application can be submitted.",
  ],
  [
    "How is fleet compliance checked?",
    "The portal continuously checks registration, PUCC, insurance, challan, electrification, fleet-size and security-deposit conditions.",
  ],
];

const contentIcons = {
  car: Car,
  chart: BarChart3,
  check: Check,
  clock: Clock3,
  file: FileText,
  help: CircleHelp,
  leaf: Leaf,
  mail: Mail,
  map: MapPin,
  phone: Phone,
  shield: ShieldCheck,
  target: Target,
  wallet: WalletCards,
  zap: Zap,
};
const contentIcon = (name: string | null) =>
  contentIcons[name as keyof typeof contentIcons] ?? CircleHelp;
const section = (items: PortalContentItem[], name: ContentSection) =>
  items.filter((item) => item.section === name);

export default function Landing() {
  const contentQuery = useQuery({
    queryKey: ["public-content"],
    queryFn: listPublicContent,
    staleTime: 300_000,
  });
  const adoptionQuery = useQuery({
    queryKey: ["public-ev-adoption"],
    queryFn: getPublicEvAdoption,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
  const content = contentQuery.data ?? [];
  const dynamicServices = section(content, "SERVICE");
  const services = dynamicServices.length
    ? dynamicServices.map((item) => ({
        icon: contentIcon(item.icon),
        title: item.title,
        text: item.body ?? "",
      }))
    : defaultServices;
  const dynamicMilestones = section(content, "MILESTONE");
  const milestoneTargets = dynamicMilestones.length
    ? dynamicMilestones.map((item) => ({
        period: item.title,
        value: item.value ?? "",
        icon: contentIcon(item.icon),
        final: item.label === "Final objective",
      }))
    : defaultMilestones.map(({ period, value, icon, final }) => ({
        period,
        value,
        icon,
        final,
      }));
  const adoption = adoptionQuery.data?.adoptionPercentage ?? 0;
  const percentageOf = (value: string) =>
    Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  const nextMilestoneIndex = Math.max(
    0,
    (() => {
      const index = milestoneTargets.findIndex(
        (item) => percentageOf(item.value) > adoption,
      );
      return index < 0 ? milestoneTargets.length - 1 : index;
    })(),
  );
  const milestones = milestoneTargets.map((item, index) => ({
    ...item,
    current: index === nextMilestoneIndex,
    achieved: adoption > 0 && percentageOf(item.value) <= adoption,
  }));
  const dynamicFaqs = section(content, "FAQ");
  const faqs: string[][] = dynamicFaqs.length
    ? dynamicFaqs.map((item) => [item.title, item.body ?? ""])
    : defaultFaqs;
  const dynamicNotices = section(content, "NOTICE");
  const dynamicBenefits = section(content, "BENEFIT");
  const dynamicMetrics = section(content, "METRIC");
  const contacts = section(content, "CONTACT");
  const contact = (label: string) =>
    contacts.find((item) => item.label === label)?.value ?? "—";
  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f9f8] text-slate-800">
      <header className="sticky top-0 z-50 border-b border-emerald-950/5 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf7ee]">
              <img
                src="/logo-removebg-preview.png"
                alt="GACP"
                className="h-7 w-7 object-contain"
              />
            </span>
            <span className="min-w-0">
              <b className="block font-heading text-sm leading-none text-[#105d34]">
                GACP
              </b>
              <small className="hidden truncate text-[9px] text-slate-500 sm:block">
                Government Aggregator Compliance Portal
              </small>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-xs font-semibold text-slate-600 md:flex">
            <a href="#scheme" className="hover:text-[#19733c]">
              Scheme
            </a>
            <a href="#how" className="hover:text-[#19733c]">
              How it works
            </a>
            <a href="#targets" className="hover:text-[#19733c]">
              EV targets
            </a>
            <a href="#faq" className="hover:text-[#19733c]">
              FAQ
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              to="/login"
              className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:px-3"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#1d8a49] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#146a38] sm:px-4"
            >
              <span className="sm:hidden">Apply</span>
              <span className="hidden sm:inline">Apply for licence</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate min-h-[600px] overflow-hidden bg-[#8ed7f7] sm:min-h-[620px] md:min-h-[640px]">
          <img
            src={heroIllustration}
            alt="Illustrated Delhi landmarks and electric vehicles"
            className="absolute inset-0 h-full w-full object-cover object-center md:inset-x-0 md:bottom-0 md:top-auto md:h-auto md:max-w-none"
            decoding="async"
          />
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#8ed7f7]/80 via-[#8ed7f7]/35 to-transparent" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pt-10 text-center sm:px-6 md:pt-12">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-800/10 bg-white/85 px-3 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#19733c] shadow-sm">
              <Leaf className="h-3 w-3" />
              Transport Department · Government of NCT of Delhi
            </span>
            <h1 className="max-w-6xl font-body text-[46px] font-bold leading-[1.06] tracking-[-.03em] text-[#146a38] drop-shadow-sm sm:text-[60px] md:text-[67px] lg:text-[72px]">
              Welcome to Delhi Aggregator Portal
            </h1>
			<p className="mt-3 max-w-2xl px-3 text-base font-semibold leading-relaxed text-slate-800 [text-shadow:0_1px_0_rgba(255,255,255,1),0_2px_8px_rgba(255,255,255,.9)] sm:text-[17px] md:text-lg">
              A unified digital platform for licensing, fleet onboarding,
              continuous compliance, payments and regulatory workflows.
            </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-16 md:gap-28">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-[#19733c] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-[#105d34]"
              >
                Apply for licence <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-xs font-bold text-[#19733c] shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5"
              >
                Track compliance
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#155f2b] text-white">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-y-6 px-3 py-6 sm:px-6 md:grid-cols-4 md:gap-y-0 md:py-7 lg:px-8">
            {(dynamicMetrics.length
              ? dynamicMetrics
              : [
                  {
                    id: "fleet",
                    value: "26+",
                    label: "Minimum fleet size",
                    title: "",
                  },
                  {
                    id: "licence",
                    value: "5 years",
                    label: "Licence validity",
                    title: "",
                  },
                  {
                    id: "target",
                    value: "100%",
                    label: "2030 EV objective",
                    title: "",
                  },
                ]
            ).map((metric) => (
              <div key={metric.id} className="px-3 text-center">
                <b className="font-display text-2xl md:text-3xl">
                  {metric.value}
                </b>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[.15em] text-white/65">
                  {metric.label ?? metric.title}
                </p>
              </div>
            ))}
            <div className="px-3 text-center">
              <Deadline />
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[.15em] text-white/65">
                Time to 2030
              </p>
            </div>
          </div>
        </section>

        <section
          id="scheme"
          className="border-b border-slate-100 bg-[#f7f9f8] py-14 md:py-16"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {services.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-emerald-900/5 bg-white p-5 shadow-[0_8px_30px_rgba(22,101,52,.06)] transition hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(22,101,52,.12)]"
              >
                <span className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#f0f9f2]" />
                <span className="relative mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef8f0] text-[#238249]">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="relative font-heading text-sm font-bold text-slate-800">
                  {title}
                </h2>
                <p className="relative mt-2 text-[11px] leading-relaxed text-slate-500">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
            <div className="relative mx-auto w-full max-w-sm px-3 pb-8 sm:px-5">
              <div className="absolute inset-x-0 bottom-12 top-8 -rotate-3 rounded-[28px] border border-emerald-700/15 bg-[#edf8f0]" />
              <div className="relative overflow-hidden rounded-[24px] border-4 border-white bg-sky-100 shadow-xl">
                <img
                  src={collageIllustration}
                  alt="Electric mobility in Delhi"
                  className="aspect-[4/5] h-auto w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-[#19733c] shadow sm:left-4 sm:top-4">
                  <Leaf className="mr-1 inline h-3 w-3" />
                  Zero-emission mobility
                </span>
              </div>
              <div className="absolute -bottom-1 right-0 rounded-2xl border bg-white p-3 shadow-xl sm:p-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Objective
                </p>
                <p className="font-heading text-lg font-extrabold text-[#19733c] sm:text-xl">
                  100% EV
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[28px] bg-[#2c843d] p-7 text-white shadow-[0_22px_50px_rgba(15,80,40,.22)] md:p-9">
              <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-white/5" />
              <h2 className="relative flex items-center gap-3 font-heading text-2xl font-extrabold">
                <span className="h-7 w-1.5 rounded-full bg-amber-400" />
                Circulars and notifications
              </h2>
              <div className="relative mt-6 divide-y divide-white/10">
                {(dynamicNotices.length
                  ? dynamicNotices
                  : [
                      {
                        id: "fallback",
                        title: "Portal notifications are loading",
                        label: null,
                      },
                    ]
                ).map((notice) => (
                  <div
                    key={notice.id}
                    className="flex items-center gap-3 py-3.5 text-[11px] text-white/85"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                    <span className="flex-1">{notice.title}</span>
                    {notice.label && (
                      <b className="rounded-full bg-rose-500 px-2 py-0.5 text-[8px] uppercase">
                        {notice.label}
                      </b>
                    )}
                  </div>
                ))}
              </div>
              <p className="relative mt-6 text-[9px] font-bold uppercase tracking-[.2em] text-white/55">
                Quick actions
              </p>
              <div className="relative mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  ["Apply for licence", FileText, "/register"],
                  ["Sign in to portal", ShieldCheck, "/login"],
                  ["Review EV targets", Target, "#targets"],
                  ["Read Aggregator Policy", CircleHelp, aggregatorPolicy],
                ].map(([label, Icon, path]) => (
                  <Link
                    key={String(label)}
                    to={String(path)}
                    reloadDocument={path === aggregatorPolicy}
                    target={path === aggregatorPolicy ? "_blank" : undefined}
                    rel={path === aggregatorPolicy ? "noreferrer" : undefined}
                    className="flex items-center gap-3 rounded-xl bg-white p-3.5 text-[11px] font-bold text-slate-700 transition hover:-translate-y-0.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf8f0] text-[#19733c]">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="bg-[#f7f9f8] py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-heading text-2xl font-extrabold text-[#2d7f3b]">
              How it works
            </h2>
            <div className="relative mt-12 grid gap-10 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-emerald-600/25 md:block" />
              {[
                [
                  "Step 1",
                  "Apply for licence",
                  "Create the organisation application and upload documents.",
                  Upload,
                ],
                [
                  "Step 2",
                  "Onboard your fleet",
                  "Validate vehicles and drivers, then pay applicable vehicle fees.",
                  Car,
                ],
                [
                  "Step 3",
                  "Track compliance",
                  "Respond to findings, payments and regulatory actions.",
                  Gauge,
                ],
              ].map(([step, title, text, Icon]) => (
                <article
                  key={String(step)}
                  className="relative flex flex-col items-center text-center"
                >
                  <span className="z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#edf8f0] text-[#238249] shadow-lg">
                    <Icon className="h-6 w-6" />
                  </span>
                  <b className="mt-4 rounded-full bg-amber-400 px-2.5 py-1 text-[8px] uppercase text-amber-950">
                    {step}
                  </b>
                  <h3 className="mt-2 font-heading text-sm font-bold">
                    {title}
                  </h3>
                  <p className="mt-1 max-w-[220px] text-[10px] leading-relaxed text-slate-500">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="targets"
          className="border-y border-slate-100 bg-[#f4f7f5] py-16 md:py-20"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-heading text-3xl font-extrabold text-[#2d7f3b]">
                EV target milestones
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Current portal adoption:{" "}
                <b className="text-[#2d7f3b]">{adoption.toFixed(2)}%</b> ·{" "}
                {adoptionQuery.data?.electricVehicles ?? 0} electric of{" "}
                {adoptionQuery.data?.eligibleVehicles ?? 0} eligible registered
                vehicles
              </p>
              <div className="mx-auto mt-4 h-2.5 max-w-2xl overflow-hidden rounded-full bg-emerald-950/10">
                <div
                  className="h-full rounded-full bg-[#2d7f3b] transition-[width] duration-700"
                  style={{ width: `${Math.min(100, adoption)}%` }}
                />
              </div>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {milestones.map(
                ({ period, value, icon: Icon, current, final, achieved }) => (
                  <article
                    key={period}
                    className={`relative flex min-h-32 flex-col items-center justify-center rounded-xl border p-3 text-center transition hover:-translate-y-1 ${current ? "border-[#2d7f3b] bg-[#2d7f3b] text-white shadow-xl" : final ? "border-amber-400 bg-amber-400 text-amber-950 shadow-lg" : achieved ? "border-emerald-600/30 bg-emerald-100 text-[#1f7137]" : "border-emerald-700/15 bg-[#f3faf4] text-[#2d7f3b]"}`}
                  >
                    {current && (
                      <b className="absolute -top-2.5 rounded-full bg-amber-400 px-2 py-0.5 text-[7px] uppercase text-amber-950">
                        Next target
                      </b>
                    )}
                    <Icon
                      className={`h-6 w-6 ${current ? "text-white/70" : "opacity-45"}`}
                    />
                    <p className="mt-3 text-[8px] font-bold uppercase tracking-wider opacity-70">
                      {period}
                    </p>
                    <b className="mt-1 font-heading text-xl">{value}</b>
                    {achieved && !current && (
                      <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-emerald-600" />
                    )}
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="bg-[#f7f9f8] py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-heading text-3xl font-extrabold text-[#2d7f3b]">
                Why go electric?
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                A cleaner fleet and a simpler compliance path for operators.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {dynamicBenefits.map((benefit) => {
                const Icon = contentIcon(benefit.icon);
                return (
                  <article
                    key={benefit.id}
                    className="rounded-2xl border-4 border-white bg-[#edf7ef] p-7 text-center shadow-md"
                  >
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#2d7f3b] shadow">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 font-heading text-sm font-bold">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                      {benefit.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-white py-16 md:py-20">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-heading text-2xl font-extrabold text-[#2d7f3b]">
              Frequently asked questions
            </h2>
            <div className="mt-8 space-y-3">
              {faqs.map(([question, answer]) => (
                <details
                  key={question}
                  className="group rounded-lg border border-slate-200 bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-xs font-semibold">
                    {question}
                    <ChevronDown className="h-4 w-4 text-[#2d7f3b] transition group-open:rotate-180" />
                  </summary>
                  <p className="border-t border-slate-100 px-5 py-4 text-xs leading-relaxed text-slate-500">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#073727] text-white/65">
        <div className="mx-auto grid w-full max-w-7xl gap-9 px-4 py-12 sm:px-6 lg:px-8 md:grid-cols-[1.4fr_1fr_1fr_1.15fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/15">
                <img
                  src="/logo-removebg-preview.png"
                  alt=""
                  className="h-7 w-7"
                />
              </span>
              <span>
                <b className="block text-xs text-white">
                  Delhi Aggregator Portal
                </b>
                <small className="text-[7px] font-bold uppercase tracking-wider text-emerald-400">
                  Transport Dept · Govt of NCT of Delhi
                </small>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[10px] leading-relaxed">
              The single-window portal for applicant licensing, fleet
              onboarding, compliance monitoring, payments and enforcement
              workflows.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-emerald-400/10 px-3 py-1 text-[8px] text-emerald-300">
              System operational
            </span>
          </div>
          <div>
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-white">
              Portal and services
            </h3>
            <div className="mt-4 space-y-2 text-[9px]">
              <Link className="block hover:text-white" to="/register">
                Aggregator onboarding
              </Link>
              <Link className="block hover:text-white" to="/login">
                Fleet and compliance portal
              </Link>
              <a className="block hover:text-white" href="#targets">
                EV target milestones
              </a>
              <a className="block hover:text-white" href="#faq">
                Help and FAQs
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-white">
              Key workflows
            </h3>
            <div className="mt-4 space-y-2 text-[9px]">
              <span className="block">Document review</span>
              <span className="block">VAHAN and SARATHI checks</span>
              <span className="block">Wallet and deposits</span>
              <span className="block">Appeals and licensing</span>
            </div>
          </div>
          <div>
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-white">
              Helpdesk and support
            </h3>
            <div className="mt-4 space-y-3 text-[9px]">
              <p className="flex gap-2">
                <Phone className="h-3 w-3 text-emerald-400" />
                {contact("Phone")}
              </p>
              <p className="flex gap-2">
                <Mail className="h-3 w-3 text-emerald-400" />
                {contact("Email")}
              </p>
              <p className="flex gap-2">
                <MapPin className="h-3 w-3 shrink-0 text-emerald-400" />
                {contact("Address")}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8 text-[8px] sm:flex-row">
            <p>© 2026 Transport Department, Government of NCT of Delhi.</p>
            <div className="flex gap-4">
              <span>Privacy policy</span>
              <span>Terms of service</span>
              <span>Accessibility</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
