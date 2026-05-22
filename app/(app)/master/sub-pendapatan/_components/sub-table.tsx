"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MasterTable, type MasterRow } from "@/components/master-table"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { toast } from "sonner"
import { createSub, updateSub, toggleSubAktif } from "@/app/actions/master"
import { createClient } from "@/lib/supabase/client"

const schema = z.object({
  jenis_pendapatan_id: z.string().uuid(),
  kode: z.string().min(1).max(20),
  nama: z.string().min(1),
  keterangan: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

type JenisOption = { id: string; nama: string }
type Row = MasterRow & {
  jenis_pendapatan_id: string
  kode: string
  nama: string
  keterangan: string | null
  is_active: boolean
  jenis: { nama: string } | null
}

function SubForm({ row, onDone }: { row: Row | null; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [jenisOptions, setJenisOptions] = useState<JenisOption[]>([])

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      jenis_pendapatan_id: row?.jenis_pendapatan_id ?? "",
      kode: row?.kode ?? "",
      nama: row?.nama ?? "",
      keterangan: row?.keterangan ?? "",
    },
  })

  useEffect(() => {
    const sb = createClient()
    sb.from("jenis_pendapatan").select("id, nama").order("kode").then(({ data }) => {
      if (data) setJenisOptions(data)
    })
  }, [])

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = row
        ? await updateSub(row.id, values)
        : await createSub(values)
      if (!result.ok) { toast.error(result.pesan); return }
      toast.success(row ? "Berhasil diperbarui" : "Berhasil ditambahkan")
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Jenis Pendapatan</Label>
        <Controller
          name="jenis_pendapatan_id"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Pilih jenis" />
              </SelectTrigger>
              <SelectContent>
                {jenisOptions.map((j) => (
                  <SelectItem key={j.id} value={j.id}>{j.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.jenis_pendapatan_id && <p className="text-xs text-red-400">{errors.jenis_pendapatan_id.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Kode</Label>
        <Input {...register("kode")} placeholder="SUB-01" className="bg-white/5 border-white/10 text-white" />
        {errors.kode && <p className="text-xs text-red-400">{errors.kode.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Nama</Label>
        <Input {...register("nama")} placeholder="Nama sub pendapatan" className="bg-white/5 border-white/10 text-white" />
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

export function SubTable({ data }: { data: Row[] }) {
  return (
    <MasterTable
      data={data}
      dialogTitle="Sub Pendapatan"
      columns={[
        { key: "kode", label: "Kode" },
        { key: "nama", label: "Nama" },
        { key: "jenis", label: "Jenis", render: (row) => row.jenis?.nama ?? "-" },
        { key: "is_active", label: "Status", render: (row) => <StatusBadge aktif={row.is_active} /> },
      ]}
      form={(row, onDone) => <SubForm row={row as Row | null} onDone={onDone} />}
      onToggleAktif={toggleSubAktif}
    />
  )
}
