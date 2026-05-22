import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Banknote, Clock, TrendingUp, ArrowRight, Plus } from "lucide-react"
import { getDashboardStats } from "@/app/actions/dashboard"
import { PenerimaanStatusBadge } from "@/components/penerimaan-status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardChart } from "./_chart"

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  if (!stats) redirect("/")

  const isAdmin = stats.role === "ADMIN"
  const isPimpinan = stats.role === "PIMPINAN"
  const isOperator = stats.role === "OPERATOR"

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-white/90">
          Selamat datang, {stats.nama}
        </h1>
        <p className="mt-0.5 text-sm text-white/40">
          {stats.role === "ADMIN" ? "Administrator"
            : stats.role === "PIMPINAN" ? "Pimpinan"
            : `Operator${stats.unitNama ? ` — ${stats.unitNama}` : ""}`}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Total Verified Bulan Ini"
          value={rupiah(stats.totalBulanIni)}
          color="green"
        />
        <StatCard
          icon={<Banknote className="h-4 w-4" />}
          label="Penerimaan Hari Ini"
          value={rupiah(stats.hariIni.total)}
          sub={`${stats.hariIni.count} transaksi`}
          color="blue"
        />
        {(isAdmin || isPimpinan) && (
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Menunggu Verifikasi"
            value={String(stats.draftCount)}
            sub="transaksi draft"
            color={stats.draftCount > 0 ? "amber" : "default"}
            href={isAdmin ? "/penerimaan?status=draft" : undefined}
          />
        )}
      </div>

      {/* Quick actions (operator) */}
      {isOperator && (
        <div className="flex gap-3">
          <Link
            href="/penerimaan/baru"
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Input Penerimaan
          </Link>
        </div>
      )}

      {/* Chart 7 hari */}
      {(isAdmin || isPimpinan) && (
        <DashboardChart data={stats.chartData} />
      )}

      {/* Transaksi terbaru */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <p className="text-sm font-medium text-white/60">Transaksi Terbaru</p>
          <Link href="/penerimaan" className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
            Lihat semua <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {stats.terbaru.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-white/30">
            Belum ada transaksi
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/40 text-xs">Nomor Bukti</TableHead>
                <TableHead className="text-white/40 text-xs">Tanggal</TableHead>
                <TableHead className="text-white/40 text-xs">Jenis</TableHead>
                <TableHead className="text-white/40 text-xs">Unit</TableHead>
                <TableHead className="text-white/40 text-xs text-right">Jumlah</TableHead>
                <TableHead className="text-white/40 text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.terbaru.map((row) => (
                <TableRow key={row.id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell className="py-3">
                    <Link href={`/penerimaan/${row.id}`} className="text-sm font-mono text-blue-400 hover:underline">
                      {row.nomor_bukti}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-white/60 py-3">
                    {format(new Date(row.tanggal_terima), "dd MMM yyyy", { locale: id })}
                  </TableCell>
                  <TableCell className="text-sm text-white/70 py-3">
                    {row.jenis?.nama ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-white/50 py-3">
                    {row.unit?.kode ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-white/80 py-3 text-right font-medium">
                    {rupiah(row.jumlah)}
                  </TableCell>
                  <TableCell className="py-3">
                    <PenerimaanStatusBadge status={row.status as "draft" | "verified" | "void"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

    </div>
  )
}

function StatCard({
  icon, label, value, sub, color, href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  color: "green" | "blue" | "amber" | "default"
  href?: string
}) {
  const colors = {
    green:   "text-green-400  bg-green-500/10  ring-green-500/20",
    blue:    "text-blue-400   bg-blue-500/10   ring-blue-500/20",
    amber:   "text-amber-400  bg-amber-500/10  ring-amber-500/20",
    default: "text-white/40   bg-white/5       ring-white/10",
  }

  const inner = (
    <div className="rounded-xl border border-white/10 px-5 py-4 flex flex-col gap-3">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="mt-1 text-xl font-semibold text-white/90">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-white/40">{sub}</p>}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {inner}
      </Link>
    )
  }
  return inner
}
