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
import { createRekening, updateRekening, toggleRekeningAktif } from "@/app/actions/master"

const schema = z.object({
  kode: z.string().min(1),
  nama_bank: z.string().min(1),
  nama_rekening: z.string().min(1),
  nomor_rekening: z.string().min(1),
  keterangan: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

type Row = MasterRow & {
  kode: string
  nama_bank: string
  nama_rekening: string
  nomor_rekening: string
  keterangan: string | null
  is_active: boolean
}

function RekeningForm({ row, onDone }: { row: Row | null; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kode: row?.kode ?? "",
      nama_bank: row?.nama_bank ?? "",
      nama_rekening: row?.nama_rekening ?? "",
      nomor_rekening: row?.nomor_rekening ?? "",
      keterangan: row?.keterangan ?? "",
    },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = row
        ? await updateRekening(row.id, values)
        : await createRekening(values)
      if (!result.ok) { toast.error(result.pesan); return }
      toast.success(row ? "Berhasil diperbarui" : "Berhasil ditambahkan")
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Kode</Label>
        <Input {...register("kode")} placeholder="RK-01" className="bg-white/5 border-white/10 text-white" />
        {errors.kode && <p className="text-xs text-red-400">{errors.kode.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Nama Bank</Label>
        <Input {...register("nama_bank")} placeholder="Bank BNI" className="bg-white/5 border-white/10 text-white" />
        {errors.nama_bank && <p className="text-xs text-red-400">{errors.nama_bank.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Nama Rekening</Label>
        <Input {...register("nama_rekening")} placeholder="Nama pemilik rekening" className="bg-white/5 border-white/10 text-white" />
        {errors.nama_rekening && <p className="text-xs text-red-400">{errors.nama_rekening.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Nomor Rekening</Label>
        <Input {...register("nomor_rekening")} placeholder="0123456789" className="bg-white/5 border-white/10 text-white" />
        {errors.nomor_rekening && <p className="text-xs text-red-400">{errors.nomor_rekening.message}</p>}
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

export function RekeningTable({ data }: { data: Row[] }) {
  return (
    <MasterTable
      data={data}
      dialogTitle="Rekening Bank"
      columns={[
        { key: "kode", label: "Kode" },
        { key: "nama_bank", label: "Nama Bank" },
        { key: "nama_rekening", label: "Nama Rekening" },
        { key: "nomor_rekening", label: "Nomor Rekening" },
        { key: "is_active", label: "Status", render: (row) => <StatusBadge aktif={row.is_active} /> },
      ]}
      form={(row, onDone) => <RekeningForm row={row as Row | null} onDone={onDone} />}
      onToggleAktif={toggleRekeningAktif}
    />
  )
}
