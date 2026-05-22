import { getCurrentProfile } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/")

  return (
    <div>
      <h1 className="text-xl font-semibold text-white/90">
        Selamat datang, {profile.nama_lengkap}
      </h1>
      <p className="mt-1 text-sm text-white/40">
        {profile.role.nama}
        {profile.unit_kerja && ` — ${profile.unit_kerja.nama}`}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profile.role.kode === "OPERATOR" && (
          <DashboardCard
            title="Input Penerimaan"
            desc="Catat penerimaan dana baru"
            href="/penerimaan/baru"
            color="blue"
          />
        )}
        {profile.role.kode === "ADMIN" && (
          <>
            <DashboardCard title="Kelola Penerimaan" desc="Verifikasi & kelola transaksi" href="/penerimaan" color="blue" />
            <DashboardCard title="Master Data" desc="Kelola kategori, jenis, unit" href="/master/kategori-pendapatan" color="amber" />
            <DashboardCard title="Pengguna" desc="Kelola akun & hak akses" href="/pengguna" color="green" />
          </>
        )}
        {(profile.role.kode === "ADMIN" || profile.role.kode === "PIMPINAN") && (
          <DashboardCard title="Laporan" desc="Rekap penerimaan & export" href="/laporan/harian" color="purple" />
        )}
      </div>
    </div>
  )
}

function DashboardCard({
  title, desc, href, color
}: {
  title: string; desc: string; href: string
  color: "blue" | "amber" | "green" | "purple"
}) {
  const colors = {
    blue:   "bg-blue-500/10   ring-blue-500/20   text-blue-400",
    amber:  "bg-amber-500/10  ring-amber-500/20  text-amber-400",
    green:  "bg-green-500/10  ring-green-500/20  text-green-400",
    purple: "bg-purple-500/10 ring-purple-500/20 text-purple-400",
  }
  return (
    <a
      href={href}
      className={`rounded-xl p-5 ring-1 transition-opacity hover:opacity-80 ${colors[color]}`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs opacity-70">{desc}</p>
    </a>
  )
}
