import { requireRole } from "@/lib/session"
import { rekapPerRekening } from "@/app/actions/laporan"
import { LaporanRekeningClient } from "./_client"

export default async function LaporanPerRekeningPage({
  searchParams,
}: {
  searchParams: Promise<{ tgl_awal?: string; tgl_akhir?: string }>
}) {
  await requireRole(["ADMIN", "PIMPINAN"])
  const params = await searchParams
  const now = new Date()
  const tglAwal  = params.tgl_awal  ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const tglAkhir = params.tgl_akhir ?? now.toISOString().split("T")[0]
  const { byRekening, total } = await rekapPerRekening(tglAwal, tglAkhir)

  return <LaporanRekeningClient tglAwal={tglAwal} tglAkhir={tglAkhir} byRekening={byRekening} total={total} />
}
