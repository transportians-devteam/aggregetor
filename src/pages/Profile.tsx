import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, IdCard, Mail, Pencil, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/services/authService";
import {
  listLicenses,
  listMyApplications,
} from "@/services/registrationService";
import { getErrorMessage } from "@/services/api";

export default function Profile() {
	const { auth, refreshProfile } = useAuth();
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState(auth.user?.name ?? "");
	const [email, setEmail] = useState(auth.user?.email ?? "");
  const operator = auth.role === "aggregator" || auth.role === "dsp";
  const applications = useQuery({
    queryKey: ["my-applications"],
    queryFn: listMyApplications,
    enabled: operator,
  });
  const licenses = useQuery({
    queryKey: ["my-licenses"],
    queryFn: listLicenses,
    enabled: operator,
  });
  const application = applications.data?.[0];
	const licence = licenses.data?.[0];
	const saveProfile = useMutation({
		mutationFn: () => updateProfile({ name, email }),
		onSuccess: async () => {
			await refreshProfile();
			setEditing(false);
			toast.success("Profile updated");
		},
	});
	const cancelEdit = () => {
		setName(auth.user?.name ?? "");
		setEmail(auth.user?.email ?? "");
		setEditing(false);
	};
  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold">My profile</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Authenticated identity and registration details held by the portal.
      </p>
      {(applications.isError || licenses.isError) && (
        <p className="mb-4 text-destructive">
          {getErrorMessage(applications.error || licenses.error)}
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
		  <div className="mb-4 flex items-center justify-between gap-3">
			<h2 className="flex items-center gap-2 font-semibold">
			  <User className="h-5 w-5 text-primary" />
			  Identity
			</h2>
			{!editing && (
			  <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
				<Pencil className="mr-1 h-3.5 w-3.5" /> Edit profile
			  </Button>
			)}
		  </div>
		  {saveProfile.isError && (
			<p className="mb-3 text-sm text-destructive">
			  {getErrorMessage(saveProfile.error)}
			</p>
		  )}
		  <dl className="space-y-3 text-sm">
			<div>
			  <dt className="text-xs uppercase text-muted-foreground">Name</dt>
			  <dd>
				{editing ? (
				  <Input
					className="mt-1"
					value={name}
					maxLength={150}
					onChange={(event) => setName(event.target.value)}
				  />
				) : (
				  auth.user?.name
				)}
			  </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs uppercase text-muted-foreground">
                <Phone className="h-3 w-3" />
                Phone
              </dt>
              <dd>{auth.user?.phone}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs uppercase text-muted-foreground">
                <Mail className="h-3 w-3" />
                Email
              </dt>
			  <dd>
				{editing ? (
				  <Input
					className="mt-1"
					type="email"
					value={email}
					maxLength={255}
					onChange={(event) => setEmail(event.target.value)}
					placeholder="Email address"
				  />
				) : (
				  auth.user?.email || "Not provided"
				)}
			  </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Role</dt>
              <dd className="capitalize">{auth.role?.replaceAll("_", " ")}</dd>
            </div>
		  </dl>
		  {editing && (
			<div className="mt-5 flex gap-2">
			  <Button
				onClick={() => saveProfile.mutate()}
				disabled={!name.trim() || saveProfile.isPending}
			  >
				{saveProfile.isPending ? "Saving…" : "Save changes"}
			  </Button>
			  <Button variant="outline" onClick={cancelEdit} disabled={saveProfile.isPending}>
				Cancel
			  </Button>
			</div>
		  )}
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            Registration
          </h2>
          {operator ? (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  Company
                </dt>
                <dd>{application?.companyName ?? "No application"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  Application
                </dt>
                <dd>
                  {application
                    ? `${application.applicationNumber} · ${application.status}`
                    : "Not started"}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs uppercase text-muted-foreground">
                  <IdCard className="h-3 w-3" />
                  Licence
                </dt>
                <dd>
                  {licence
                    ? `${licence.licenseNumber} · ${licence.status}`
                    : "Not issued"}
                </dd>
              </div>
              {licence && (
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">
                    Validity
                  </dt>
                  <dd>
                    {licence.validFrom} to {licence.validUntil}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Authority users do not have an operator registration profile.
            </p>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
