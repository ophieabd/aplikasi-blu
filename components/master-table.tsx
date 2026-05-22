"use client"

import { useState, useTransition, ReactNode } from "react"
import { Plus, Pencil, ToggleLeft, ToggleRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { toast } from "sonner"

export type MasterRow = {
  id: string
  kode: string
  nama: string
  keterangan?: string | null
  is_active: boolean
  [key: string]: unknown
}

type Column<T extends MasterRow> = {
  key: keyof T | string
  label: string
  render?: (row: T) => ReactNode
}

type Props<T extends MasterRow> = {
  data: T[]
  columns: Column<T>[]
  dialogTitle: string
  form: (row: T | null, onDone: () => void) => ReactNode
  onToggleAktif: (id: string, is_active: boolean) => Promise<{ ok: boolean; pesan?: string }>
}

export function MasterTable<T extends MasterRow>({
  data, columns, dialogTitle, form, onToggleAktif
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<T | null>(null)
  const [pending, startTransition] = useTransition()

  function openCreate() { setSelected(null); setOpen(true) }
  function openEdit(row: T) { setSelected(row); setOpen(true) }
  function onDone() { setOpen(false) }

  function handleToggle(row: T) {
    startTransition(async () => {
      const result = await onToggleAktif(row.id, !row.is_active)
      if (!result.ok) toast.error(result.pesan ?? "Gagal mengubah status")
      else toast.success(row.is_active ? "Dinonaktifkan" : "Diaktifkan")
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead key={String(col.key)} className="text-white/40 text-xs">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="text-white/40 text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} className="border-white/5 hover:bg-white/[0.02]">
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className="text-sm text-white/70 py-3">
                      {col.render
                        ? col.render(row)
                        : col.key === "is_active"
                        ? <StatusBadge aktif={row.is_active} />
                        : String(row[col.key as keyof T] ?? "—")}
                    </TableCell>
                  ))}
                  <TableCell className="py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => openEdit(row)}
                        className="h-7 w-7 p-0 text-white/40 hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleToggle(row)}
                        disabled={pending}
                        className="h-7 w-7 p-0 text-white/40 hover:text-white"
                      >
                        {pending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : row.is_active ? (
                          <ToggleRight className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <ToggleLeft className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? `Edit ${dialogTitle}` : `Tambah ${dialogTitle}`}</DialogTitle>
          </DialogHeader>
          {form(selected, onDone)}
        </DialogContent>
      </Dialog>
    </div>
  )
}
