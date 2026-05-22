"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Harian", href: "/laporan/harian" },
  { label: "Bulanan", href: "/laporan/bulanan" },
  { label: "Per Rekening", href: "/laporan/per-rekening" },
]

export function LaporanTabs() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 border-b border-white/10">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:transition-opacity",
              active
                ? "text-white after:bg-white after:opacity-100"
                : "text-white/40 after:bg-white after:opacity-0 hover:text-white/70"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
