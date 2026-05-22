import { requireRole } from "@/lib/session"
import { PageHeader } from "@/components/page-header"
import { PenerimaanForm } from "../_components/penerimaan-form"

export default async function PenerimaanBaruPage() {
  const profile = await requireRole(["OPERATOR", "ADMIN"])

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader
        title="Input Penerimaan"
        description="Catat penerimaan dana baru sebagai draft"
      />
      <PenerimaanForm
        lockedUnitId={
          profile.role.kode === "OPERATOR" && profile.unit_kerja_id
            ? profile.unit_kerja_id
            : undefined
        }
      />
    </div>
  )
}
