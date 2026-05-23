import Link from "next/link"
import { getCurrentProfile } from "@/lib/session"
import { redirect } from "next/navigation"
import { listPenerimaan } from "@/app/actions/penerimaan"
import { PageHeader } from "@/components/page-header"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
            <Button size="sm" render={<Link href="/penerimaan/baru" />}>
              <Plus className="h-4 w-4" />
              Input Baru
            </Button>
          ) : undefined
        }
      />

      {/* Filter status */}
      <div className="flex gap-2">
        {(["", "draft", "verified", "void"] as const).map((s) => {
          const isActive = (params.status ?? "") === s
          return (
            <Badge
              key={s}
              variant={isActive ? "secondary" : "ghost"}
              render={<Link href={s ? `/penerimaan?status=${s}` : "/penerimaan"} />}
            >
              {s === "" ? "Semua" : s === "draft" ? "Draft" : s === "verified" ? "Terverifikasi" : "Dibatalkan"}
            </Badge>
          )
        })}
      </div>

      <PenerimaanTable data={data as Parameters<typeof PenerimaanTable>[0]["data"]} isAdmin={isAdmin} />
    </div>
  )
}
