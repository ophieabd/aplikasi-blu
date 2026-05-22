"use client"

import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/empty-state"

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

type Rekening = { kode: string; nama_bank: string; nama_rekening: string; nomor_rekening: string; total: number }

export function LaporanRekeningClient({ tglAwal, tglAkhir, byRekening, total }: {
  tglAwal: string; tglAkhir: string; byRekening: Rekening[]; total: number
}) {
  const router = useRouter()

  function navigate(awal: string, akhir: string) {
    router.push(`/laporan/per-rekening?tgl_awal=${awal}&tgl_akhir=${akhir}`)
  }

  function exportExcel() {
    const data = byRekening.map((r) => ({
      "Kode": r.kode,
      "Nama Bank": r.nama_bank,
      "Nama Rekening": r.nama_rekening,
      "Nomor Rekening": r.nomor_rekening,
      "Total Penerimaan": r.total,
    }))
    data.push({ "Kode": "TOTAL", "Nama Bank": "", "Nama Rekening": "", "Nomor Rekening": "", "Total Penerimaan": total })
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Rekening")
    XLSX.writeFile(wb, `rekap-rekening-${tglAwal}-sd-${tglAkhir}.xlsx`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-white/40">Dari</Label>
            <Input type="date" value={tglAwal} onChange={(e) => navigate(e.target.value, tglAkhir)}
              className="w-40 bg-white/5 border-white/10 text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-white/40">Sampai</Label>
            <Input type="date" value={tglAkhir} onChange={(e) => navigate(tglAwal, e.target.value)}
              className="w-40 bg-white/5 border-white/10 text-white" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={exportExcel} className="gap-1.5 text-white/50 hover:text-white">
            <Download className="h-4 w-4" />Excel
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()} className="gap-1.5 text-white/50 hover:text-white">
            <Printer className="h-4 w-4" />PDF
          </Button>
        </div>
      </div>

      {byRekening.length === 0 ? (
        <EmptyState message="Tidak ada data untuk periode ini" />
      ) : (
        <div className="flex flex-col gap-2">
          {byRekening.map((r) => (
            <div key={r.kode} className="rounded-xl border border-white/10 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">{r.nama_bank}</p>
                <p className="text-xs text-white/40">{r.nama_rekening} — {r.nomor_rekening}</p>
              </div>
              <span className="text-sm font-bold text-white">{rupiah(r.total)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl bg-white/10 px-5 py-4">
            <span className="text-sm font-semibold text-white/80">TOTAL</span>
            <span className="text-base font-bold text-white">{rupiah(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
