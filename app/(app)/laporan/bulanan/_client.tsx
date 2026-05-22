"use client"

import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/empty-state"

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]

type JenisGroup = { kode: string; nama: string; total: number }
type KategoriGroup = { kodeKategori: string; namaKategori: string; total: number; jenis: Record<string, JenisGroup> }

export function LaporanBulananClient({ tahun, bulan, byKategori, total }: {
  tahun: number; bulan: number
  byKategori: KategoriGroup[]; total: number
}) {
  const router = useRouter()
  const tahunList = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  function navigate(t: number, b: number) {
    router.push(`/laporan/bulanan?tahun=${t}&bulan=${b}`)
  }

  function exportExcel() {
    const rows: Record<string, unknown>[] = []
    for (const kat of byKategori) {
      rows.push({ "Kategori": kat.namaKategori, "Jenis": "", "Total": kat.total })
      for (const j of Object.values(kat.jenis)) {
        rows.push({ "Kategori": "", "Jenis": j.nama, "Total": j.total })
      }
    }
    rows.push({ "Kategori": "TOTAL", "Jenis": "", "Total": total })
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Bulanan")
    XLSX.writeFile(wb, `laporan-bulanan-${tahun}-${String(bulan).padStart(2, "0")}.xlsx`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <Select value={String(bulan)} onValueChange={(v) => v != null && navigate(tahun, parseInt(v))}>
            <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              {BULAN.map((b, i) => <SelectItem key={i + 1} value={String(i + 1)}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(tahun)} onValueChange={(v) => v != null && navigate(parseInt(v), bulan)}>
            <SelectTrigger className="w-28 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              {tahunList.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
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

      {byKategori.length === 0 ? (
        <EmptyState message={`Tidak ada penerimaan pada ${BULAN[bulan - 1]} ${tahun}`} />
      ) : (
        <div className="flex flex-col gap-3">
          {byKategori.map((kat) => (
            <div key={kat.kodeKategori} className="rounded-xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between bg-white/5 px-4 py-3">
                <span className="text-sm font-semibold text-white/90">{kat.namaKategori}</span>
                <span className="text-sm font-bold text-white">{rupiah(kat.total)}</span>
              </div>
              <div className="divide-y divide-white/5">
                {Object.values(kat.jenis).map((j) => (
                  <div key={j.kode} className="flex items-center justify-between px-6 py-2.5">
                    <span className="text-sm text-white/60">{j.nama}</span>
                    <span className="text-sm text-white/70">{rupiah(j.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
            <span className="text-sm font-semibold text-white/80">TOTAL BULAN INI</span>
            <span className="text-base font-bold text-white">{rupiah(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
