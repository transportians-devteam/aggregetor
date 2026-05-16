import { DashboardLayout } from '@/components/DashboardLayout';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function ChangePassword() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newPwd, setNewPwd] = useState('');

  const rules = [
    { label: 'At least 8 characters', met: newPwd.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(newPwd) },
    { label: 'One lowercase letter', met: /[a-z]/.test(newPwd) },
    { label: 'One digit', met: /\d/.test(newPwd) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(newPwd) },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Change Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Update your account credentials</p>
        </div>

        <div className="glass rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><Lock className="w-5 h-5" /></div>
            <h2 className="font-heading font-semibold">Security Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/30 outline-none pr-10" placeholder="Enter current password" />
                <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/30 outline-none pr-10" placeholder="Enter new password" />
                <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Confirm New Password</label>
              <input type="password" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/30 outline-none" placeholder="Confirm new password" />
            </div>
          </div>

          {/* Password Rules */}
          {newPwd.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Password Requirements</p>
              {rules.map(r => (
                <div key={r.label} className="flex items-center gap-2">
                  {r.met ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                  <span className={`text-xs ${r.met ? 'text-green-700' : 'text-muted-foreground'}`}>{r.label}</span>
                </div>
              ))}
            </div>
          )}

          <Button className="w-full" disabled={!rules.every(r => r.met)}>Update Password</Button>
          <p className="text-xs text-muted-foreground text-center">You will be signed out of all sessions after changing your password.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
