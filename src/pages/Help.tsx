import { ChevronDown, HelpCircle, Mail, Phone } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { listPublicContent } from "@/services/contentService";

const faqs = [
  [
    "How do I apply for a licence?",
    "Create an operator account, complete the registration application, upload all four required documents and submit it for departmental review.",
  ],
  [
    "Why was a vehicle or driver restricted?",
    "The portal applies continuous policy checks. Open Compliance and System Offboarding to see the relevant finding.",
  ],
  [
    "How do I pay a monetary penalty?",
    "Open Penalties and pay the outstanding penalty from your portal wallet. Recharge the wallet first when the available balance is insufficient.",
  ],
  [
    "How do appeals work?",
    "Rejected registration applications and eligible enforcement decisions can be appealed. An appellate officer records the final decision.",
  ],
];

export default function Help() {
  const query = useQuery({
    queryKey: ["public-content"],
    queryFn: listPublicContent,
  });
  const dynamicFaqs =
    query.data
      ?.filter((item) => item.section === "FAQ")
      .map((item) => [item.title, item.body ?? ""]) ?? faqs;
  const contacts =
    query.data?.filter((item) => item.section === "CONTACT") ?? [];
  const contact = (label: string) =>
    contacts.find((item) => item.label === label)?.value ?? "—";
  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold">Help and support</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Guidance for workflows implemented in this portal.
      </p>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <HelpCircle className="h-4 w-4 text-primary" />
            Frequently asked questions
          </h2>
          {dynamicFaqs.map(([question, answer]) => (
            <details key={question} className="group rounded-xl border bg-card">
              <summary className="flex cursor-pointer list-none justify-between p-4 text-sm font-medium">
                {question}
                <ChevronDown className="h-4 w-4 group-open:rotate-180" />
              </summary>
              <p className="border-t px-4 py-3 text-sm text-muted-foreground">
                {answer}
              </p>
            </details>
          ))}
        </section>
        <aside className="h-fit rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Transport Department support</h2>
          <p className="mt-4 flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-primary" />
            {contact("Phone")}
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-primary" />
            {contact("Email")}
          </p>
        </aside>
      </div>
    </DashboardLayout>
  );
}
