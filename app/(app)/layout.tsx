import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/session"
import { AppShell } from "@/components/app-shell"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/")
  if (!profile.is_active) redirect("/")

  return <AppShell profile={profile}>{children}</AppShell>
}
