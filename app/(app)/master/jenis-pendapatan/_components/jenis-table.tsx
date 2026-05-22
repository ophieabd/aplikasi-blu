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
import { createJenis, updateJenis, toggleJenisAktif } from "@/app/actions/master"
import { createClient } from "@/lib/supabase/client"

const schema = z.object({
  kategori_pendapatan_id: z.string().uuid(),
  kode: z.string().min(1).max(20),
  nama: z.string().min(1),
  akun_pendapatan: z.string().optional(),
  keterangan: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

type KategoriOption = { id: string; nama: string }
type Row = MasterRow & {
  kategori_pendapatan_id: string
  kode: string
  nama: string
  akun_pendapatan: string | null
  keterangan: string | null
  is_active: boolean
  kategori: { nama: string } | null
}

function JenisForm({ row, onDone }: { row: Row | null; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([])

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kategori_pendapatan_id: row?.kategori_pendapatan_id ?? "",
      kode: row?.kode ?? "",
      nama: row?.nama ?? "",
      akun_pendapatan: row?.akun_pendapatan ?? "",
      keterangan: row?.keterangan ?? "",
    },
  })

  useEffect(() => {
    const sb = createClient()
    sb.from("kategori_pendapatan").select("id, nama").order("kode").then(({ data }) => {
      if (data) setKategoriOptions(data)
    })
  }, [])

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = row
        ? await updateJenis(row.id, values)
        : await createJenis(values)
      if (!result.ok) { toast.error(result.pesan); return }
      toast.success(row ? "Berhasil diperbarui" : "Berhasil ditambahkan")
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Kategori Pendapatan</Label>
        <Controller
          name="kategori_pendapatan_id"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategoriOptions.map((k) => (
                  <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.kategori_pendapatan_id && <p className="text-xs text-red-400">{errors.kategori_pendapatan_id.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Kode</Label>
        <Input {...register("kode")} placeholder="JNS-01" className="bg-white/5 border-white/10 text-white" />
        {errors.kode && <p className="text-xs text-red-400">{errors.kode.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Nama</Label>
        <Input {...register("nama")} placeholder="Nama jenis pendapatan" className="bg-white/5 border-white/10 text-white" />
        {errors.nama && <p className="text-xs text-red-400">{errors.nama.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Akun Pendapatan</Label>
        <Input {...register("akun_pendapatan")} placeholder="424111" className="bg-white/5 border-white/10 text-white" />
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

export function JenisTable({ data }: { data: Row[] }) {
  return (
    <MasterTable
      data={data}
      dialogTitle="Jenis Pendapatan"
      columns={[
        { key: "kode", label: "Kode" },
        { key: "nama", label: "Nama" },
        { key: "kategori", label: "Kategori", render: (row) => row.kategori?.nama ?? "-" },
        { key: "akun_pendapatan", label: "Akun Pendapatan" },
        { key: "is_active", label: "Status", render: (row) => <StatusBadge aktif={row.is_active} /> },
      ]}
      form={(row, onDone) => <JenisForm row={row as Row | null} onDone={onDone} />}
      onToggleAktif={toggleJenisAktif}
    />
  )
}
