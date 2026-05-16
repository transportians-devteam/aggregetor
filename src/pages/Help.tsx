import { DashboardLayout } from '@/components/DashboardLayout';
import { HelpCircle, MessageSquare, ChevronDown, Phone, Mail, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const faqs = [
  { q: 'How do I apply for an aggregator license?', a: 'Navigate to the landing page and click "Apply for License". You will need to provide company details, compliance officer information, upload required documents (GST, PAN, Bank Guarantee), and pay the application fee via the portal wallet.' },
  { q: 'What happens if I miss the fortnightly declaration?', a: 'Missing the fortnightly declaration window (2-day grace period) results in an automatic penalty of ₹10,000. Repeated misses may trigger a license review.' },
  { q: 'How is the annual fee calculated?', a: 'Annual fee is based on fleet composition: EVs are exempt (₹0/year), while ICE vehicles (Petrol/CNG/Diesel) attract ₹50–₹200/year per vehicle depending on category.' },
  { q: 'What are the EV compliance phase targets?', a: 'Phase 1 (6 months): 5%, Phase 2 (1 year): 15%, Phase 3 (2 years): 25%, Phase 4 (3 years): 50%, Phase 5 (4 years): 75%, Phase 6 (5 years): 100%.' },
  { q: 'How do I recharge my wallet?', a: 'Go to the Fee & Wallet section, click "Recharge", enter the amount (min ₹1,000), and complete payment via Razorpay (UPI/Card/NetBanking).' },
];

const tickets = [
  { id: 'TKT-2026-042', subject: 'VAHAN API not returning data for DL08XX1234', status: 'in_review', created: '2026-03-23' },
  { id: 'TKT-2026-038', subject: 'Wrong penalty amount for Q4 2025', status: 'resolved', created: '2026-03-15' },
  { id: 'TKT-2026-030', subject: 'Wallet recharge failed but amount debited', status: 'resolved', created: '2026-03-05' },
];

export default function Help() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Help & Support</h1>
            <p className="text-sm text-muted-foreground mt-1">FAQs, support tickets, and contact information</p>
          </div>
          <Button size="sm"><Plus className="w-4 h-4 mr-2" />New Ticket</Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* FAQs */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-heading font-semibold text-sm flex items-center gap-2"><HelpCircle className="w-4 h-4 text-primary" />Frequently Asked Questions</h2>
            {faqs.map((faq, i) => (
              <details key={i} className="group glass rounded-xl border border-border overflow-hidden">
                <summary className="font-medium text-sm px-5 py-4 cursor-pointer flex justify-between items-center hover:bg-muted/30 transition-colors list-none">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-4 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border">{faq.a}</div>
              </details>
            ))}
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <div className="glass rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-heading font-semibold text-sm">Contact Authority</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Helpline</p>
                    <p className="text-sm font-medium">011-2345-6789</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">gacp@delhi.gov.in</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Portal</p>
                    <p className="text-sm font-medium text-primary cursor-pointer">myfleet.delhi.gov.in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Tickets */}
            <div className="glass rounded-xl border border-border p-5 space-y-3">
              <h3 className="font-heading font-semibold text-sm">My Tickets</h3>
              {tickets.map(t => (
                <div key={t.id} className="border border-border rounded-lg p-3 hover:bg-muted/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{t.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs font-medium leading-snug">{t.subject}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.created}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
