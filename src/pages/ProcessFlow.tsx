import { Link } from "react-router-dom";
import { AlertTriangle, Car, CreditCard, FileCheck, Radio, Scale } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

const phases = [
  { n: 1, title: "Registration & security deposit", icon: FileCheck, path: "/applications", text: "Eligibility, Form 1 details, NCR office, compliance officer, fleet-based bank guarantee verification and five-year licence issue.", decisions: ["Minimum 26 vehicles", "BG slabs: ₹1L / ₹2.5L / ₹5L / ₹10L", "DC decision and 30-day appeal"] },
  { n: 2, title: "Virtual wallet & fee engine", icon: CreditCard, path: "/wallet", text: "Wallet recharge, receipts, vehicle funding, security-deposit holds, transaction ledger, penalties and refunds.", decisions: ["Insufficient balance blocks payment", "Every debit/credit is logged", "Deposits can be released or forfeited"] },
  { n: 3, title: "Fleet declaration & EV compliance", icon: Car, path: "/onboarding", text: "VAHAN/SARATHI verification, CSV onboarding, fortnightly declaration windows and incremental EV-target enforcement.", decisions: ["Delhi registration required", "Invalid documents reject onboarding", "Conventional induction blocked when EV target is missed"] },
  { n: 4, title: "Safety, GPS & CCC monitoring", icon: Radio, path: "/safety", text: "Panic alerts, GPS connectivity, low driver ratings, document expiry and random physical spot checks.", decisions: ["Panic alert queues police escalation", "Low rating suspends pending training", "Confirmed violation creates ₹5,000 notice"] },
  { n: 5, title: "Penalty, suspension & enforcement", icon: AlertTriangle, path: "/penalties", text: "Compliance notices, operator response, authority review, 10-day to six-month suspension, extension and cancellation.", decisions: ["Satisfactory response closes case", "Failure escalates enforcement", "Wallet payment and compliance evidence supported"] },
  { n: 6, title: "Appeal process", icon: Scale, path: "/applications", text: "Appeals must be filed within 30 days and are reviewed by the assigned appellate authority before a final decision.", decisions: ["No delayed appeal condonation", "Allowed appeal restores the decision", "Rejected appeal keeps suspension/cancellation"] },
];

export default function ProcessFlow() {
  return <DashboardLayout><div className="mb-6"><h1 className="font-heading text-2xl font-bold">Portal process flow</h1>
    <p className="text-sm text-muted-foreground">The six operational phases implemented from registration through final appeal.</p></div>
    <div className="grid gap-4 lg:grid-cols-2">{phases.map(({n,title,icon:Icon,path,text,decisions})=><article key={n} className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span>
        <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Phase {n}</p><h2 className="font-heading text-lg font-bold">{title}</h2></div></div>
      <p className="mt-3 text-sm text-muted-foreground">{text}</p><ul className="mt-3 space-y-1 text-sm">{decisions.map(x=><li key={x}>• {x}</li>)}</ul>
      <Link className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline" to={path}>Open this workflow →</Link>
    </article>)}</div></DashboardLayout>;
}
