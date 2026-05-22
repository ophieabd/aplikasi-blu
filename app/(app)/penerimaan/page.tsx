import Link from "next/link"
import { getCurrentProfile } from "@/lib/session"
import { redirect } from "next/navigation"
import { listPenerimaan } from "@/app/actions/penerimaan"
import { PageHeader } from "@/components/page-header"
import { Plus } from "lucide-react"
import { PenerimaanTable } from "./_components/penerimaan-table"

export default async function PenerimaanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/")

  const params = await searchParams
  const { data, count } = await listPenerimaan({
    status: params.status as "draft" | "verified" | "void" | undefined,
    page: params.page ? parseInt(params.page) : 1,
  })

  const isOperator = profile.role.kode === "OPERATOR"
  const isAdmin = profile.role.kode === "ADMIN"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Penerimaan Dana"
        description={`${count} transaksi`}
        action={
          isOperator ? (
            <Link
              href="/penerimaan/baru"
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Input Baru
            </Link>
          ) : undefined
        }
      />

      {/* Filter status */}
      <div className="flex gap-2">
        {(["", "draft", "verified", "void"] as const).map((s) => (
          <Link
            key={s}
            href={s ? `/penerimaan?status=${s}` : "/penerimaan"}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              (params.status ?? "") === s
                ? "bg-white/15 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {s === "" ? "Semua" : s === "draft" ? "Draft" : s === "verified" ? "Terverifikasi" : "Dibatalkan"}
          </Link>
        ))}
      </div>

      <PenerimaanTable data={data as Parameters<typeof PenerimaanTable>[0]["data"]} isAdmin={isAdmin} />
    </div>
  )
}
