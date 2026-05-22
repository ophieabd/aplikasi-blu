"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { X, CheckCheck } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { PenerimaanStatusBadge } from "@/components/penerimaan-status-badge"
import { EmptyState } from "@/components/empty-state"
import { toast } from "sonner"
import { bulkVerifyPenerimaan } from "@/app/actions/penerimaan"

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

type Row = {
  id: string
  nomor_bukti: string
  tanggal_terima: string
  jumlah: number
  status: string
  jenis: unknown
  unit: unknown
}

export function PenerimaanTable({ data, isAdmin }: { data: Row[]; isAdmin: boolean }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()

  const draftIds = data.filter((r) => r.status === "draft").map((r) => r.id)
  const allDraftSelected = draftIds.length > 0 && draftIds.every((id) => selected.has(id))

  function toggleSelectAll() {
    if (allDraftSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(draftIds))
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function handleBulkVerify() {
    startTransition(async () => {
      const result = await bulkVerifyPenerimaan(Array.from(selected))
      if (!result.ok) { toast.error(result.pesan); return }
      const { berhasil, gagal } = result.data
      if (gagal > 0) {
        toast.warning(`${berhasil} terverifikasi, ${gagal} gagal`)
      } else {
        toast.success(`${berhasil} transaksi berhasil diverifikasi`)
      }
      setSelected(new Set())
    })
  }

  if (data.length === 0) return <EmptyState message="Belum ada transaksi penerimaan" />

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              {isAdmin && (
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={allDraftSelected}
                    onCheckedChange={toggleSelectAll}
                    disabled={draftIds.length === 0}
                    className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-zinc-900"
                  />
                </TableHead>
              )}
              <TableHead className="text-white/40 text-xs">Nomor Bukti</TableHead>
              <TableHead className="text-white/40 text-xs">Tanggal</TableHead>
              <TableHead className="text-white/40 text-xs">Jenis</TableHead>
              <TableHead className="text-white/40 text-xs">Unit</TableHead>
              <TableHead className="text-white/40 text-xs text-right">Jumlah</TableHead>
              <TableHead className="text-white/40 text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const isDraft = row.status === "draft"
              const isChecked = selected.has(row.id)
              return (
                <TableRow
                  key={row.id}
                  className={`border-white/5 hover:bg-white/[0.02] cursor-pointer ${isChecked ? "bg-white/[0.04]" : ""}`}
                >
                  {isAdmin && (
                    <TableCell className="pl-4 py-3 w-10">
                      {isDraft && (
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleRow(row.id)}
                          className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-zinc-900"
                        />
                      )}
                    </TableCell>
                  )}
                  <TableCell className="py-3">
                    <Link href={`/penerimaan/${row.id}`} className="text-sm font-mono text-blue-400 hover:underline">
                      {row.nomor_bukti}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-white/60 py-3">
                    {format(new Date(row.tanggal_terima), "dd MMM yyyy", { locale: id })}
                  </TableCell>
                  <TableCell className="text-sm text-white/70 py-3">
                    {(row.jenis as { nama?: string } | null)?.nama ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-white/50 py-3">
                    {(row.unit as { kode?: string } | null)?.kode ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-white/80 py-3 text-right font-medium">
                    {rupiah(row.jumlah)}
                  </TableCell>
                  <TableCell className="py-3">
                    <PenerimaanStatusBadge status={row.status as "draft" | "verified" | "void"} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Floating bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur px-4 py-3 shadow-xl">
          <span className="text-sm text-white/60 flex-1">
            {selected.size} transaksi dipilih
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(new Set())}
            className="text-white/40 hover:text-white gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Batalkan
          </Button>
          <Button
            size="sm"
            onClick={handleBulkVerify}
            disabled={pending}
            className="gap-1.5 bg-green-600 hover:bg-green-500 text-white"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {pending ? "Memverifikasi..." : `Verifikasi (${selected.size})`}
          </Button>
        </div>
      )}
    </div>
  )
}
