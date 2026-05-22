import { cn } from "@/lib/utils"

type StatusBadgeProps = {
  aktif: boolean
  label?: [string, string]
}

export function StatusBadge({
  aktif,
  label = ["Aktif", "Nonaktif"],
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        aktif
          ? "bg-green-500/10 text-green-400 ring-green-500/20"
          : "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20"
      )}
    >
      {aktif ? label[0] : label[1]}
    </span>
  )
}
