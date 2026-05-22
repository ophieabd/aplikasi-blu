"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/currency-input"
import { toast } from "sonner"
import { createPenerimaan, updatePenerimaan, type PenerimaanInput } from "@/app/actions/penerimaan"
import { createClient } from "@/lib/supabase/client"

const schema = z.object({
  tanggal_terima: z.string().min(1, "Wajib diisi"),
  kategori_id: z.string().uuid("Wajib dipilih"),
  jenis_pendapatan_id: z.string().uuid("Wajib dipilih"),
  sub_pendapatan_id: z.string().optional(),
  unit_kerja_id: z.string().uuid("Wajib dipilih"),
  rekening_bank_id: z.string().uuid("Wajib dipilih"),
  jenis_pemindahan_kas_id: z.string().uuid("Wajib dipilih"),
  jumlah: z.number().positive("Jumlah harus lebih dari 0"),
  nomor_referensi: z.string().optional(),
  uraian: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

type OptionItem = { id: string; kode: string; nama: string }
type JenisItem = OptionItem & { kategori_pendapatan_id: string }
type SubItem = OptionItem & { jenis_pendapatan_id: string }

type Props = {
  editId?: string
  defaultValues?: Partial<FormValues>
  lockedUnitId?: string
}

export function PenerimaanForm({ editId, defaultValues, lockedUnitId }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [kategoriList, setKategoriList] = useState<OptionItem[]>([])
  const [jenisList, setJenisList] = useState<JenisItem[]>([])
  const [subList, setSubList] = useState<SubItem[]>([])
  const [unitList, setUnitList] = useState<OptionItem[]>([])
  const [rekeningList, setRekeningList] = useState<OptionItem[]>([])
  const [metodeList, setMetodeList] = useState<OptionItem[]>([])

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tanggal_terima: new Date().toISOString().split("T")[0],
      ...defaultValues,
      unit_kerja_id: lockedUnitId ?? defaultValues?.unit_kerja_id,
    },
  })

  const watchKategori = watch("kategori_id")
  const watchJenis = watch("jenis_pendapatan_id")

  // Load semua master saat mount
  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.from("kategori_pendapatan").select("id, kode, nama").eq("is_active", true).order("kode"),
      sb.from("unit_kerja").select("id, kode, nama").eq("is_active", true).order("kode"),
      sb.from("rekening_bank").select("id, kode, nama_bank, nama_rekening").eq("is_active", true).order("kode"),
      sb.from("jenis_pemindahan_kas").select("id, kode, nama").eq("is_active", true).order("kode"),
    ]).then(([kat, unit, rek, metode]) => {
      setKategoriList(kat.data ?? [])
      setUnitList(unit.data?.map((u) => ({ id: u.id, kode: u.kode, nama: u.nama })) ?? [])
      setRekeningList(rek.data?.map((r) => ({ id: r.id, kode: r.kode, nama: `${r.nama_bank} - ${r.nama_rekening}` })) ?? [])
      setMetodeList(metode.data ?? [])
    })
  }, [])

  // Load jenis saat kategori berubah
  useEffect(() => {
    if (!watchKategori) { setJenisList([]); setSubList([]); return }
    const sb = createClient()
    sb.from("jenis_pendapatan")
      .select("id, kode, nama, kategori_pendapatan_id")
      .eq("kategori_pendapatan_id", watchKategori)
      .eq("is_active", true)
      .order("kode")
      .then(({ data }) => {
        setJenisList(data ?? [])
        setSubList([])
        setValue("jenis_pendapatan_id", "" as string)
        setValue("sub_pendapatan_id", "")
      })
  }, [watchKategori, setValue])

  // Load sub saat jenis berubah
  useEffect(() => {
    if (!watchJenis) { setSubList([]); return }
    const sb = createClient()
    sb.from("sub_pendapatan")
      .select("id, kode, nama, jenis_pendapatan_id")
      .eq("jenis_pendapatan_id", watchJenis)
      .eq("is_active", true)
      .order("kode")
      .then(({ data }) => {
        setSubList(data ?? [])
        setValue("sub_pendapatan_id", "")
      })
  }, [watchJenis, setValue])

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const input: PenerimaanInput = {
        tanggal_terima: values.tanggal_terima,
        jenis_pendapatan_id: values.jenis_pendapatan_id,
        sub_pendapatan_id: values.sub_pendapatan_id || undefined,
        unit_kerja_id: values.unit_kerja_id,
        rekening_bank_id: values.rekening_bank_id,
        jenis_pemindahan_kas_id: values.jenis_pemindahan_kas_id,
        jumlah: values.jumlah,
        nomor_referensi: values.nomor_referensi || undefined,
        uraian: values.uraian || undefined,
      }
      const result = editId
        ? await updatePenerimaan(editId, input)
        : await createPenerimaan(input)

      if (!result.ok) { toast.error(result.pesan); return }
      toast.success(editId ? "Berhasil diperbarui" : "Penerimaan berhasil disimpan sebagai draft")
      router.push("/penerimaan")
    })
  }

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/20"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Tanggal */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Tanggal Transaksi <span className="text-red-400">*</span></Label>
        <Input {...register("tanggal_terima")} type="date" className={inputClass} />
        {errors.tanggal_terima && <p className="text-xs text-red-400">{errors.tanggal_terima.message}</p>}
      </div>

      {/* Kategori → Jenis → Sub */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Kategori Pendapatan <span className="text-red-400">*</span></Label>
        <Controller name="kategori_id" control={control} render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value ?? ""}>
            <SelectTrigger className={inputClass}><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              {kategoriList.map((k) => <SelectItem key={k.id} value={k.id}>{k.kode} — {k.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        )} />
        {errors.kategori_id && <p className="text-xs text-red-400">{errors.kategori_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/60 text-xs">Jenis Pendapatan <span className="text-red-400">*</span></Label>
          <Controller name="jenis_pendapatan_id" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchKategori}>
              <SelectTrigger className={inputClass}><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {jenisList.map((j) => <SelectItem key={j.id} value={j.id}>{j.kode} — {j.nama}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
          {errors.jenis_pendapatan_id && <p className="text-xs text-red-400">{errors.jenis_pendapatan_id.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/60 text-xs">Sub Pendapatan</Label>
          <Controller name="sub_pendapatan_id" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchJenis || subList.length === 0}>
              <SelectTrigger className={inputClass}><SelectValue placeholder="Pilih sub (opsional)" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {subList.map((s) => <SelectItem key={s.id} value={s.id}>{s.kode} — {s.nama}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </div>
      </div>

      {/* Unit kerja + Rekening + Metode */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/60 text-xs">Unit Kerja <span className="text-red-400">*</span></Label>
          <Controller name="unit_kerja_id" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!!lockedUnitId}>
              <SelectTrigger className={inputClass}><SelectValue placeholder="Pilih unit" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {unitList.map((u) => <SelectItem key={u.id} value={u.id}>{u.kode} — {u.nama}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
          {errors.unit_kerja_id && <p className="text-xs text-red-400">{errors.unit_kerja_id.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/60 text-xs">Rekening Bank <span className="text-red-400">*</span></Label>
          <Controller name="rekening_bank_id" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <SelectTrigger className={inputClass}><SelectValue placeholder="Pilih rekening" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {rekeningList.map((r) => <SelectItem key={r.id} value={r.id}>{r.kode} — {r.nama}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
          {errors.rekening_bank_id && <p className="text-xs text-red-400">{errors.rekening_bank_id.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/60 text-xs">Metode Pembayaran <span className="text-red-400">*</span></Label>
          <Controller name="jenis_pemindahan_kas_id" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <SelectTrigger className={inputClass}><SelectValue placeholder="Pilih metode" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {metodeList.map((m) => <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
          {errors.jenis_pemindahan_kas_id && <p className="text-xs text-red-400">{errors.jenis_pemindahan_kas_id.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/60 text-xs">Jumlah <span className="text-red-400">*</span></Label>
          <Controller name="jumlah" control={control} render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onChange={field.onChange}
              className={inputClass}
            />
          )} />
          {errors.jumlah && <p className="text-xs text-red-400">{errors.jumlah.message}</p>}
        </div>
      </div>

      {/* Nomor bukti + uraian */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Nomor Bukti</Label>
        <Input {...register("nomor_referensi")} placeholder="No. bukti / referensi transaksi" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-white/60 text-xs">Uraian</Label>
        <Textarea {...register("uraian")} rows={2} placeholder="Keterangan tambahan (opsional)" className={`${inputClass} resize-none`} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()} className="flex-1 text-white/50">
          Batal
        </Button>
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Menyimpan..." : editId ? "Perbarui" : "Simpan sebagai Draft"}
        </Button>
      </div>
    </form>
  )
}
