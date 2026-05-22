import { requireRole } from "@/lib/session"
import { rekapBulanan } from "@/app/actions/laporan"
import { PageHeader } from "@/components/page-header"
import { LaporanBulananClient } from "./_client"

export default async function LaporanBulananPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string; bulan?: string }>
}) {
  await requireRole(["ADMIN", "PIMPINAN"])
  const params = await searchParams
  const now = new Date()
  const tahun = parseInt(params.tahun ?? String(now.getFullYear()))
  const bulan = parseInt(params.bulan ?? String(now.getMonth() + 1))
  const { byKategori, total } = await rekapBulanan(tahun, bulan)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Laporan Bulanan" description="Rekap penerimaan per bulan, dikelompokkan per kategori" />
      <LaporanBulananClient tahun={tahun} bulan={bulan} byKategori={byKategori} total={total} />
    </div>
  )
}
