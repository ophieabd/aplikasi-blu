import { requireRole } from "@/lib/session"
import { rekapHarian } from "@/app/actions/laporan"
import { PageHeader } from "@/components/page-header"
import { LaporanHarianClient } from "./_client"

export default async function LaporanHarianPage({
  searchParams,
}: {
  searchParams: Promise<{ tanggal?: string }>
}) {
  await requireRole(["ADMIN", "PIMPINAN"])
  const params = await searchParams
  const tanggal = params.tanggal ?? new Date().toISOString().split("T")[0]
  const { rows, total } = await rekapHarian(tanggal)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Laporan Harian" description="Rekap penerimaan per hari" />
      <LaporanHarianClient tanggal={tanggal} rows={rows} total={total} />
    </div>
  )
}
