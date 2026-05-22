"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MasterTable, type MasterRow } from "@/components/master-table"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { toast } from "sonner"
import { createUnitKerja, updateUnitKerja, toggleUnitKerjaAktif } from "@/app/actions/master"

const schema = z.object({
  kode: z.string().min(1).max(20),
  nama: z.string().min(1),
  keterangan: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

type Row = MasterRow & { kode: string; nama: string; keterangan: string | null; is_active: boolean }

function UnitForm({ row, onDone }: { row: Row | null; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { kode: row?.kode ?? "", nama: row?.nama ?? "", keterangan: row?.keterangan ?? "" },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = row
        ? await updateUnitKerja(row.id, values)
        : await createUnitKerja(values)
      if (!result.ok) { toast.error(result.pesan); return }
      toast.success(row ? "Berhasil diperbarui" : "Berhasil ditambahkan")
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Kode</Label>
        <Input {...register("kode")} placeholder="UK-01" className="bg-white/5 border-white/10 text-white" />
        {errors.kode && <p className="text-xs text-red-400">{errors.kode.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Nama</Label>
        <Input {...register("nama")} placeholder="Nama unit kerja" className="bg-white/5 border-white/10 text-white" />
        {errors.nama && <p className="text-xs text-red-400">{errors.nama.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Keterangan</Label>
        <Textarea {...register("keterangan")} rows={2} placeholder="Opsional" className="bg-white/5 border-white/10 text-white resize-none" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  )
}

export function UnitTable({ data }: { data: Row[] }) {
  return (
    <MasterTable
      data={data}
      dialogTitle="Unit Kerja"
      columns={[
        { key: "kode", label: "Kode" },
        { key: "nama", label: "Nama" },
        { key: "keterangan", label: "Keterangan" },
        { key: "is_active", label: "Status", render: (row) => <StatusBadge aktif={row.is_active} /> },
      ]}
      form={(row, onDone) => <UnitForm row={row as Row | null} onDone={onDone} />}
      onToggleAktif={toggleUnitKerjaAktif}
    />
  )
}
