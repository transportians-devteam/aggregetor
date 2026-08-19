import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createTopUp,
  completeDevelopmentPayment,
  getWallet,
  getWalletEntries,
} from "@/services/walletService";
import { getErrorMessage } from "@/services/api";

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    value,
  );

export default function WalletPage() {
  const client = useQueryClient();
  const [amount, setAmount] = useState(5000);
  const [error, setError] = useState("");
  const wallet = useQuery({ queryKey: ["wallet"], queryFn: getWallet });
  const entries = useQuery({
    queryKey: ["walletEntries"],
    queryFn: getWalletEntries,
  });
  const topUp = useMutation({
    mutationFn: async () => {
      const intent = await createTopUp(amount);
      if (import.meta.env.DEV) return completeDevelopmentPayment(intent.id);
      window.location.assign(intent.checkoutUrl);
      return null;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["wallet"] });
      client.invalidateQueries({ queryKey: ["walletEntries"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Wallet top-up completed");
    },
    onError: (failure) => setError(getErrorMessage(failure)),
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Wallet</h1>
        <p className="text-sm text-muted-foreground">
          Provider-backed top-ups and immutable transaction history
        </p>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-xl border p-4 sm:p-5">
          <WalletIcon className="h-5 w-5 text-primary" />
          <p className="mt-2 break-words text-2xl font-bold sm:text-3xl">
            {money(wallet.data?.availableBalance)}
          </p>
          <p className="text-sm text-muted-foreground">Available</p>
        </div>
        <div className="glass rounded-xl border p-4 sm:p-5">
          <CreditCard className="h-5 w-5 text-amber-600" />
          <p className="mt-2 break-words text-2xl font-bold sm:text-3xl">
            {money(wallet.data?.heldBalance)}
          </p>
          <p className="text-sm text-muted-foreground">
            Held security deposits
          </p>
        </div>
      </div>
      <section className="glass mb-6 rounded-xl border p-4 sm:p-5">
        <h2 className="mb-3 font-semibold">Top up wallet</h2>
        <div className="flex max-w-md flex-col gap-3 sm:flex-row">
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <Button
            className="w-full sm:w-auto"
            variant="accent"
            onClick={() => {
              setError("");
              topUp.mutate();
            }}
            disabled={amount < 1 || topUp.isPending}
          >
            {topUp.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Continue to payment
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </section>
      <section className="glass rounded-xl border overflow-x-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Ledger</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-right">Available after</th>
              <th className="p-3 text-right">Held after</th>
            </tr>
          </thead>
          <tbody>
            {entries.data?.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="p-3">
                  {new Date(entry.createdAt).toLocaleString()}
                </td>
                <td className="p-3">{entry.type.replaceAll("_", " ")}</td>
                <td className="p-3 font-mono text-xs">
                  {entry.referenceType}: {entry.referenceId}
                </td>
                <td className="p-3 text-right font-semibold">
                  {entry.direction === "CREDIT" || entry.direction === "RELEASE"
                    ? "+"
                    : "-"}
                  {money(entry.amount)}
                </td>
                <td className="p-3 text-right">
                  {money(entry.availableBalanceAfter)}
                </td>
                <td className="p-3 text-right">
                  {money(entry.heldBalanceAfter)}
                </td>
              </tr>
            ))}
            {!entries.isLoading && !entries.data?.length && (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-muted-foreground"
                >
                  No wallet transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </DashboardLayout>
  );
}
