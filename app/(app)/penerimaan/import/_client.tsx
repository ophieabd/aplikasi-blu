"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { Upload, Download, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { parseImportData, commitImport, type ImportRow, type ImportPreviewRow } from "@/app/actions/import-penerimaan"

const TEMPLATE_HEADERS = [
  "tanggal_transaksi", "kode_jenis", "kode_sub", "kode_unit",
  "kode_rekening", "kode_metode", "jumlah", "nomor_bukti", "uraian"
]

const TEMPLATE_SAMPLE = [
  ["2026-05-01", "UKT", "UKT-REG", "FSH", "BSI", "TRANSFER_BANK", "5000000", "REF001", "UKT Semester Ganjil"],
  ["2026-05-01", "WSD", "", "FSH", "BSI", "TUNAI", "2500000", "", "Biaya Wisuda"],
]

function downloadTemplate() {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_SAMPLE])
  ws["!cols"] = TEMPLATE_HEADERS.map(() => ({ wch: 18 }))
  XLSX.utils.book_append_sheet(wb, ws, "Template")
  XLSX.writeFile(wb, "template_import_penerimaan.xlsx")
}

type Step = "upload" | "preview" | "done"

export function ImportClient() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("upload")
  const [preview, setPreview] = useState<ImportPreviewRow[]>([])
  const [pending, startTransition] = useTransition()
  const [dragOver, setDragOver] = useState(false)

  function processFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array", cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: "" })

        if (rows.length === 0) { toast.error("File kosong"); return }
        if (rows.length > 500) { toast.error("Maksimal 500 baris"); return }

        const importRows: ImportRow[] = rows.map((r, i) => ({
          baris: i + 2,
          tanggal_terima: formatDate(r["tanggal_transaksi"] ?? r["tanggal_terima"]),
          kode_jenis: String(r["kode_jenis"] ?? "").toUpperCase(),
          kode_sub: r["kode_sub"] ? String(r["kode_sub"]).toUpperCase() : undefined,
          kode_unit: String(r["kode_unit"] ?? "").toUpperCase(),
          kode_rekening: String(r["kode_rekening"] ?? "").toUpperCase(),
          kode_metode: String(r["kode_metode"] ?? "").toUpperCase(),
          jumlah: Number(r["jumlah"]) || 0,
          nomor_referensi: r["nomor_bukti"] ? String(r["nomor_bukti"]) : r["nomor_referensi"] ? String(r["nomor_referensi"]) : undefined,
          uraian: r["uraian"] ? String(r["uraian"]) : undefined,
        }))

        startTransition(async () => {
          const result = await parseImportData(importRows)
          setPreview(result)
          setStep("preview")
        })
      } catch {
        toast.error("Gagal membaca file. Pastikan format Excel/CSV benar.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handleCommit() {
    startTransition(async () => {
      const result = await commitImport(preview)
      if (!result.ok) { toast.error(result.pesan); return }
      toast.success(`${result.jumlah} transaksi berhasil diimpor sebagai draft`)
      setStep("done")
    })
  }

  const validCount   = preview.filter((r) => r.valid).length
  const invalidCount = preview.length - validCount

  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-400" />
        <p className="text-lg font-medium text-white">Import berhasil</p>
        <p className="text-sm text-white/40">Data tersimpan sebagai draft, siap untuk diverifikasi</p>
        <Button onClick={() => router.push("/penerimaan")}>Lihat Daftar Penerimaan</Button>
      </div>
    )
  }

  if (step === "preview") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />{validCount} baris valid
          </span>
          {invalidCount > 0 && (
            <span className="text-sm text-red-400 flex items-center gap-1.5">
              <XCircle className="h-4 w-4" />{invalidCount} baris error (tidak akan diimpor)
            </span>
          )}
        </div>

        <div className="rounded-xl border border-white/10 overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/40 text-xs w-12">Baris</TableHead>
                <TableHead className="text-white/40 text-xs">Tgl. Transaksi</TableHead>
                <TableHead className="text-white/40 text-xs">Jenis</TableHead>
                <TableHead className="text-white/40 text-xs">Unit</TableHead>
                <TableHead className="text-white/40 text-xs text-right">Jumlah</TableHead>
                <TableHead className="text-white/40 text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.map((row) => (
                <TableRow key={row.baris}
                  className={`border-white/5 ${row.valid ? "hover:bg-white/[0.02]" : "bg-red-500/5"}`}>
                  <TableCell className="text-xs text-white/40 py-2">{row.baris}</TableCell>
                  <TableCell className="text-xs text-white/70 py-2">{row.tanggal_terima}</TableCell>
                  <TableCell className="text-xs text-white/70 py-2">{row.kode_jenis}</TableCell>
                  <TableCell className="text-xs text-white/70 py-2">{row.kode_unit}</TableCell>
                  <TableCell className="text-xs text-white/70 py-2 text-right">
                    {row.jumlah ? new Intl.NumberFormat("id-ID").format(row.jumlah) : "—"}
                  </TableCell>
                  <TableCell className="text-xs py-2">
                    {row.valid ? (
                      <span className="text-green-400">✓ Valid</span>
                    ) : (
                      <span className="text-red-400" title={row.errors.join(", ")}>
                        ✗ {row.errors[0]}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setStep("upload")} className="text-white/50">
            Kembali
          </Button>
          <Button onClick={handleCommit} disabled={pending || validCount === 0} className="flex-1">
            {pending ? "Mengimpor..." : `Import ${validCount} Baris Valid`}
          </Button>
        </div>
      </div>
    )
  }

  // Upload step
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={downloadTemplate} className="gap-1.5 text-white/50 hover:text-white">
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-16 cursor-pointer transition-colors
          ${dragOver ? "border-white/30 bg-white/5" : "border-white/10 hover:border-white/20"}`}
      >
        <Upload className="h-8 w-8 text-white/30" />
        <div className="text-center">
          <p className="text-sm text-white/60">Drag & drop file di sini, atau klik untuk pilih</p>
          <p className="text-xs text-white/30 mt-1">Format: .xlsx, .xls, .csv — Maks. 500 baris</p>
        </div>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
      </label>

      <div className="rounded-lg bg-white/5 p-4 text-xs text-white/40">
        <p className="font-medium text-white/50 mb-2">Kolom yang diperlukan:</p>
        <p className="font-mono leading-relaxed">{TEMPLATE_HEADERS.join(" | ")}</p>
        <p className="mt-2">Kode menggunakan UPPERCASE. Download template untuk contoh.</p>
      </div>
    </div>
  )
}

function formatDate(val: unknown): string {
  if (!val) return ""
  if (val instanceof Date) return val.toISOString().split("T")[0]
  const s = String(val)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.split("T")[0]
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0]
  return s
}
