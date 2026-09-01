import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, MapPin, Radio, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/services/api";
import {
  listSafetyEvents,
  reportSafetyEvent,
  reviewSafetyEvent,
  submitSafetyRemediation,
  type SafetyEventType,
} from "@/services/safetyService";

const eventLabels: Record<SafetyEventType, string> = {
  PANIC_ALERT: "Panic alert",
  GPS_DISCONNECTED: "GPS / CCC disconnected",
  LOW_DRIVER_RATING: "Low driver rating",
  DOCUMENT_EXPIRY: "PUCC / insurance / fitness expiry",
  RANDOM_SPOT_CHECK: "Random spot check",
};

export default function SafetyMonitoring() {
  const { auth } = useAuth();
  const client = useQueryClient();
  const authority = auth.role === "enforcement" || auth.role === "admin";
  const operator = auth.role === "aggregator" || auth.role === "dsp";
  const [type, setType] = useState<SafetyEventType>("GPS_DISCONNECTED");
  const [ownerUserId, setOwnerUserId] = useState("");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const events = useQuery({ queryKey: ["safety-events"], queryFn: listSafetyEvents });
  const pages = useClientPagination(events.data ?? []);
  const refresh = () => client.invalidateQueries({ queryKey: ["safety-events"] });
  const report = useMutation({
    mutationFn: () => reportSafetyEvent({
      ...(authority ? { ownerUserId: Number(ownerUserId) } : {}), eventType: type,
      source: authority ? "GOVERNMENT_SPOT_CHECK" : "OPERATOR_CCC", location, details,
    }, authority),
    onSuccess: () => { toast.success("Safety event recorded"); setDetails(""); refresh(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const review = useMutation({
    mutationFn: ({ id, compliant }: { id: string; compliant: boolean }) =>
      reviewSafetyEvent(id, compliant, notes[id] || (compliant ? "Verified compliant" : "Violation confirmed")),
    onSuccess: () => { toast.success("Safety review completed"); refresh(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const remediate = useMutation({
    mutationFn: (id: string) => submitSafetyRemediation(id, notes[id]),
    onSuccess: () => { toast.success("Training evidence submitted"); refresh(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return <DashboardLayout>
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="font-heading text-2xl font-bold">Safety, GPS and CCC monitoring</h1>
        <p className="text-sm text-muted-foreground">Panic response, GPS connectivity, document expiry, driver rating and physical spot checks.</p></div>
      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Phase 4</span>
    </div>
    {(operator || authority) && <section className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-3 font-semibold">Record operational event</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {authority && <Input type="number" min={1} value={ownerUserId} onChange={e=>setOwnerUserId(e.target.value)} placeholder="Operator user ID" />}
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={type} onChange={e=>setType(e.target.value as SafetyEventType)}>
          {Object.entries(eventLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
        <Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location / GPS coordinates (optional)" />
        <Textarea className="md:col-span-2" value={details} onChange={e=>setDetails(e.target.value)} placeholder="Event details" />
      </div>
      <Button className="mt-3" disabled={!details.trim() || (authority && !ownerUserId) || report.isPending} onClick={()=>report.mutate()}>
        <Radio className="mr-2 h-4 w-4" />Record event
      </Button>
    </section>}
    {events.isError && <p className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{getErrorMessage(events.error)}</p>}
    <div className="space-y-3">{pages.pageItems.map(event=><article key={event.id} className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-semibold">{eventLabels[event.eventType]}</h2>
        <p className="text-xs text-muted-foreground">Operator #{event.ownerUserId} · {new Date(event.eventAt).toLocaleString()}</p></div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{event.status.replaceAll("_", " ")}</span></div>
      <p className="mt-3 text-sm">{event.details}</p>
      {event.location && <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{event.location}</p>}
      {event.policeNotified && <p className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-xs font-semibold text-destructive"><AlertTriangle className="h-4 w-4" />Police-control notification queued and emergency response active.</p>}
      {event.enforcementCaseId && <p className="mt-2 text-xs">Enforcement case: <b>{event.enforcementCaseId}</b></p>}
      {((authority && !["CLOSED","NON_COMPLIANT"].includes(event.status)) || (operator && event.status === "DRIVER_SUSPENDED")) && <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input value={notes[event.id] ?? ""} onChange={e=>setNotes({...notes,[event.id]:e.target.value})} placeholder={operator ? "Training report / evidence reference" : "Review findings"} />
        {operator ? <Button disabled={!notes[event.id]?.trim()} onClick={()=>remediate.mutate(event.id)}>Submit training</Button> : <>
          <Button variant="outline" onClick={()=>review.mutate({id:event.id,compliant:true})}><ShieldCheck className="mr-2 h-4 w-4" />Compliant</Button>
          <Button variant="destructive" onClick={()=>review.mutate({id:event.id,compliant:false})}>Issue ₹5,000 notice</Button></>}
      </div>}
    </article>)}</div>
    <ListPagination page={pages.page} pageSize={pages.pageSize} totalItems={pages.totalItems} onPageChange={pages.setPage} />
  </DashboardLayout>;
}
